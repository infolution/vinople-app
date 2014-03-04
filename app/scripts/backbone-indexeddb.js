//https://github.com/superfeedr/indexeddb-backbonejs-adapter
(function () { /*global _: false, Backbone: false */
    // Generate four random hex digits.
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    // Generate a pseudo-GUID by concatenating random hexadecimal.
    function guid() {
//        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
        return uuid.v4();
    }

    var Backbone, _;
    if (typeof exports !== 'undefined') {
        _ = require('underscore');
        Backbone = require('backbone');
    } else {
        _ = window._;
        Backbone = window.Backbone;
    }


    // Naming is a mess!
    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
    var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || {READ_WRITE: "readwrite"}; // No prefix in moz
    var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange; // No prefix in moz

    window.IDBCursor = window.IDBCursor || window.webkitIDBCursor || window.mozIDBCursor || window.msIDBCursor;


    // Driver object
    // That's the interesting part.
    // There is a driver for each schema provided. The schema is a te combination of name (for the database), a version as well as migrations to reach that
    // version of the database.
    function Driver(schema, ready, nolog) {
        this.schema = schema;
        this.ready = ready;
        this.error = null;
        this.transactions = []; // Used to list all transactions and keep track of active ones.
        this.db = null;
        this.nolog = nolog;
        this.supportOnUpgradeNeeded = false;
        var lastMigrationPathVersion = _.last(this.schema.migrations).version;
        if (!this.nolog)
            debugLog("opening database " + this.schema.id + " in version #" + lastMigrationPathVersion);
        this.dbRequest = indexedDB.open(this.schema.id, lastMigrationPathVersion); //schema version need to be an unsigned long

        this.launchMigrationPath = function (dbVersion) {
            var transaction = this.dbRequest.transaction || versionRequest.result;
            var clonedMigrations = _.clone(schema.migrations);
            this.migrate(transaction, clonedMigrations, dbVersion, {
                success: function () {
                    this.ready();
                }.bind(this),
                error: function () {
                    this.error = "Database not up to date. " + dbVersion + " expected was " + lastMigrationPathVersion;
                }.bind(this)
            });
        };

        this.dbRequest.onblocked = function (event) {
            if (!this.nolog)
                debugLog("blocked");
        }

        this.dbRequest.onsuccess = function (e) {
            this.db = e.target.result; // Attach the connection ot the queue.
            if (!this.supportOnUpgradeNeeded) {
                var currentIntDBVersion = (parseInt(this.db.version) || 0); // we need convert beacuse chrome store in integer and ie10 DP4+ in int;
                var lastMigrationInt = (parseInt(lastMigrationPathVersion) || 0);  // And make sure we compare numbers with numbers.

                if (currentIntDBVersion === lastMigrationInt) { //if support new event onupgradeneeded will trigger the ready function
                    // No migration to perform!

                    this.ready();
                } else if (currentIntDBVersion < lastMigrationInt) {
                    // We need to migrate up to the current migration defined in the database
                    this.launchMigrationPath(currentIntDBVersion);
                } else {
                    // Looks like the IndexedDB is at a higher version than the current driver schema.
                    this.error = "Database version is greater than current code " + currentIntDBVersion + " expected was " + lastMigrationInt;
                }
            }
            ;
        }.bind(this);


        this.dbRequest.onerror = function (e) {
            // Failed to open the database
            this.error = "Couldn't not connect to the database"
        }.bind(this);

        this.dbRequest.onabort = function (e) {
            // Failed to open the database
            this.error = "Connection to the database aborted"
        }.bind(this);


        this.dbRequest.onupgradeneeded = function (iDBVersionChangeEvent) {
            this.db = iDBVersionChangeEvent.target.transaction.db;

            this.supportOnUpgradeNeeded = true;

            if (!this.nolog)
                debugLog("onupgradeneeded = " + iDBVersionChangeEvent.oldVersion + " => " + iDBVersionChangeEvent.newVersion);
            this.launchMigrationPath(iDBVersionChangeEvent.oldVersion);


        }.bind(this);
    }

    function debugLog(str) {
        if (typeof window !== "undefined" && typeof window.console !== "undefined" && typeof window.console.log !== "undefined") {
            window.console.log(str);
        }
        else if (console.log !== "undefined") {
            console.log(str)
        }
    }

    // Driver Prototype
    Driver.prototype = {
        // Tracks transactions. Mostly for debugging purposes. TO-IMPROVE
        _track_transaction: function (transaction) {
            this.transactions.push(transaction);
            function removeIt() {
                var idx = this.transactions.indexOf(transaction);
                if (idx !== -1) {
                    this.transactions.splice(idx);
                }
            }
            ;
            transaction.oncomplete = removeIt.bind(this);
            transaction.onabort = removeIt.bind(this);
            transaction.onerror = removeIt.bind(this);
        },
        // Performs all the migrations to reach the right version of the database.
        migrate: function (transaction, migrations, version, options) {
            if (!this.nolog)
                debugLog("migrate begin version from #" + version);
            var that = this;
            var migration = migrations.shift();
            if (migration) {
                if (!version || version < migration.version) {
                    // We need to apply this migration-
                    if (typeof migration.before == "undefined") {
                        migration.before = function (next) {
                            next();
                        };
                    }
                    if (typeof migration.after == "undefined") {
                        migration.after = function (next) {
                            next();
                        };
                    }
                    // First, let's run the before script
                    if (!this.nolog)
                        debugLog("migrate begin before version #" + migration.version);
                    migration.before(function () {
                        if (!this.nolog)
                            debugLog("migrate done before version #" + migration.version);

                        var continueMigration = function (e) {
                            if (!this.nolog)
                                debugLog("migrate begin migrate version #" + migration.version);

                            migration.migrate(transaction, function () {
                                if (!this.nolog)
                                    debugLog("migrate done migrate version #" + migration.version);
                                // Migration successfully appliedn let's go to the next one!
                                if (!this.nolog)
                                    debugLog("migrate begin after version #" + migration.version);
                                migration.after(function () {
                                    if (!this.nolog)
                                        debugLog("migrate done after version #" + migration.version);
                                    if (!this.nolog)
                                        debugLog("Migrated to " + migration.version);

                                    //last modification occurred, need finish
                                    if (migrations.length == 0) {
                                        /*if(this.supportOnUpgradeNeeded){
                                         debugLog("Done migrating");
                                         // No more migration
                                         options.success();
                                         }
                                         else{*/
                                        if (!this.nolog)
                                            debugLog("migrate setting transaction.oncomplete to finish  version #" + migration.version);
                                        transaction.oncomplete = function () {
                                            if (!that.nolog)
                                                debugLog("migrate done transaction.oncomplete version #" + migration.version);

                                            if (!that.nolog)
                                                debugLog("Done migrating");
                                            // No more migration
                                            options.success();
                                        }
                                        //}
                                    }
                                    else {
                                        if (!this.nolog)
                                            debugLog("migrate end from version #" + version + " to " + migration.version);
                                        that.migrate(transaction, migrations, version, options);
                                    }

                                }.bind(this));
                            }.bind(this));
                        }.bind(this);

                        if (!this.supportOnUpgradeNeeded) {
                            if (!this.nolog)
                                debugLog("migrate begin setVersion version #" + migration.version);
                            var versionRequest = this.db.setVersion(migration.version);
                            versionRequest.onsuccess = continueMigration;
                            versionRequest.onerror = options.error;
                        }
                        else {
                            continueMigration();
                        }

                    }.bind(this));
                } else {
                    // No need to apply this migration
                    if (!this.nolog)
                        debugLog("Skipping migration " + migration.version);
                    this.migrate(transaction, migrations, version, options);
                }
            }
        },
        // This is the main method, called by the ExecutionQueue when the driver is ready (database open and migration performed)
        execute: function (storeName, method, object, options) {
            if (!this.nolog)
                debugLog("execute : " + method + " on " + storeName + " for " + object.id);
            switch (method) {
                case "create":
                    this.create(storeName, object, options);
                    break;
                case "read":
                    if (object.id || object.cid) {
                        this.read(storeName, object, options); // It's a model
                    } else {
                        this.query(storeName, object, options); // It's a collection
                    }
                    break;
                case "update":
                    this.update(storeName, object, options); // We may want to check that this is not a collection. TOFIX
                    break;
                case "delete":
                    if (object.id || object.cid) {
                        this.delete(storeName, object, options);
                    } else {
                        this.clear(storeName, object, options);
                    }
                    break;
                default:
                // Hum what?
            }
        },
        // Writes the json to the storeName in db. It is a create operations, which means it will fail if the key already exists
        // options are just success and error callbacks.
        create: function (storeName, object, options) {
            var writeTransaction = this.db.transaction([storeName], 'readwrite');
            //this._track_transaction(writeTransaction);
            var store = writeTransaction.objectStore(storeName);
//            //Add syncstatus - modified by me
//            object.set('syncstatus', 1);
//            object.set('isdeleted', 0);
            var clientId = window.localStorage.clientid || 'c5fb8dec-ea9f-43b1-a31f-fa4c46fe1a94';
            object.set('clientid', clientId);
            var json = object.toJSON();


            var writeRequest;

            if (json.id === undefined && !store.autoIncrement)
                json.id = guid();

            writeTransaction.onerror = function (e) {
                options.error(e);
            };
            writeTransaction.oncomplete = function (e) {
                options.success(json);
            };

            if (!store.keyPath)
                writeRequest = store.add(json, json.id);
            else
                writeRequest = store.add(json);
        },
        // Writes the json to the storeName in db. It is an update operation, which means it will overwrite the value if the key already exist
        // options are just success and error callbacks.
        update: function (storeName, object, options) {
            var writeTransaction = this.db.transaction([storeName], 'readwrite');
            //this._track_transaction(writeTransaction);
            var store = writeTransaction.objectStore(storeName);

//            //Add syncstatus - modified by me
//            object.set('syncstatus', 1);
//            object.set('isdeleted', 0);

            var json = object.toJSON() || object;
            var writeRequest;

            if (!json.id)
                json.id = guid();

            if (!store.keyPath)
                writeRequest = store.put(json, json.id);
            else
                writeRequest = store.put(json);

            writeRequest.onerror = function (e) {
                options.error(e);
            };
            writeTransaction.oncomplete = function (e) {
                options.success(json);
            };
        },
        // Reads from storeName in db with json.id if it's there of with any json.xxxx as long as xxx is an index in storeName
        read: function (storeName, object, options) {
            var readTransaction = this.db.transaction([storeName], "readonly");
            this._track_transaction(readTransaction);

            var store = readTransaction.objectStore(storeName);
            var json = object.toJSON();

            var getRequest = null;
            if (json.id) {
                getRequest = store.get(json.id);
            } else if (options.index) {
                var index = store.index(options.index.name);
                getRequest = index.get(options.index.value);
            } else {
                // We need to find which index we have
                var cardinality = 0; // try to fit the index with most matches
                _.each(store.indexNames, function (key, index) {
                    index = store.index(key);
                    if (typeof index.keyPath === 'string' && 1 > cardinality) {
                        // simple index
                        if (json[index.keyPath] !== undefined) {
                            getRequest = index.get(json[index.keyPath]);
                            cardinality = 1;
                        }
                    } else if (typeof index.keyPath === 'object' && index.keyPath.length > cardinality) {
                        // compound index
                        var valid = true;
                        var keyValue = _.map(index.keyPath, function (keyPart) {
                            valid = valid && json[keyPart] !== undefined;
                            return json[keyPart];
                        });
                        if (valid) {
                            getRequest = index.get(keyValue);
                            cardinality = index.keyPath.length;
                        }
                    }
                });
            }
            if (getRequest) {
                getRequest.onsuccess = function (event) {
                    if (event.target.result) {
                        options.success(event.target.result);
                    } else {
                        options.error("Not Found");
                    }
                };
                getRequest.onerror = function () {
                    options.error("Not Found"); // We couldn't find the record.
                };
            } else {
                options.error("Not Found"); // We couldn't even look for it, as we don't have enough data.
            }
        },
        // Deletes the json.id key and value in storeName from db.
        delete: function (storeName, object, options) {
            var deleteTransaction = this.db.transaction([storeName], 'readwrite');
            //this._track_transaction(deleteTransaction);

            var store = deleteTransaction.objectStore(storeName);

            //Add syncstatus - modified by me
            object.set('syncstatus', 1);
            object.set('isdeleted', 1);

            var json = object.toJSON();

            var deleteRequest = store.delete(json.id);

            deleteTransaction.oncomplete = function (event) {
                options.success(null);
            };
            deleteRequest.onerror = function (event) {
                options.error("Not Deleted");
            };
        },
        // Clears all records for storeName from db.
        clear: function (storeName, object, options) {
            var deleteTransaction = this.db.transaction([storeName], "readwrite");
            //this._track_transaction(deleteTransaction);

            var store = deleteTransaction.objectStore(storeName);

            var deleteRequest = store.clear();
            deleteRequest.onsuccess = function (event) {
                options.success(null);
            };
            deleteRequest.onerror = function (event) {
                options.error("Not Cleared");
            };
        },
        // Performs a query on storeName in db.
        // options may include :
        // - conditions : value of an index, or range for an index
        // - range : range for the primary key
        // - limit : max number of elements to be yielded
        // - offset : skipped items.
        query: function (storeName, collection, options) {
            var elements = [];
            var skipped = 0, processed = 0;
            var queryTransaction = this.db.transaction([storeName], "readonly");
            //this._track_transaction(queryTransaction);

            var readCursor = null;
            var store = queryTransaction.objectStore(storeName);
            var index = null,
                lower = null,
                upper = null,
                bounds = null;

            if (options.conditions) {
                // We have a condition, we need to use it for the cursor
                _.each(store.indexNames, function (key) {
                    if (!readCursor) {
                        index = store.index(key);
                        if (options.conditions[index.keyPath] instanceof Array) {
                            lower = options.conditions[index.keyPath][0] > options.conditions[index.keyPath][1] ? options.conditions[index.keyPath][1] : options.conditions[index.keyPath][0];
                            upper = options.conditions[index.keyPath][0] > options.conditions[index.keyPath][1] ? options.conditions[index.keyPath][0] : options.conditions[index.keyPath][1];
                            bounds = IDBKeyRange.bound(lower, upper, true, true);

                            if (options.conditions[index.keyPath][0] > options.conditions[index.keyPath][1]) {
                                // Looks like we want the DESC order
                                readCursor = index.openCursor(bounds, window.IDBCursor.PREV || "prev");
                            } else {
                                // We want ASC order
                                readCursor = index.openCursor(bounds, window.IDBCursor.NEXT || "next");
                            }
                        } else if (options.conditions[index.keyPath] != undefined) {
                            bounds = IDBKeyRange.only(options.conditions[index.keyPath]);
                            readCursor = index.openCursor(bounds);
                        }
                    }
                });
            } else {
                // No conditions, use the index
                if (options.range) {
                    lower = options.range[0] > options.range[1] ? options.range[1] : options.range[0];
                    upper = options.range[0] > options.range[1] ? options.range[0] : options.range[1];
                    bounds = IDBKeyRange.bound(lower, upper);
                    if (options.range[0] > options.range[1]) {
                        readCursor = store.openCursor(bounds, window.IDBCursor.PREV || "prev");
                    } else {
                        readCursor = store.openCursor(bounds, window.IDBCursor.NEXT || "next");
                    }
                } else {
                    readCursor = store.openCursor();
                }
            }

            if (typeof (readCursor) == "undefined" || !readCursor) {
                options.error("No Cursor");
            } else {
                readCursor.onerror = function (e) {
                    options.error("readCursor error", e);
                };
                // Setup a handler for the cursor’s `success` event:
                readCursor.onsuccess = function (e) {
                    var cursor = e.target.result;
                    if (!cursor) {
                        if (options.addIndividually || options.clear) {
                            // nothing!
                            // We need to indicate that we're done. But, how?
                            collection.trigger("reset");
                        } else {
                            options.success(elements); // We're done. No more elements.
                        }
                    }
                    else {
                        // Cursor is not over yet.
                        if (options.limit && processed >= options.limit) {
                            // Yet, we have processed enough elements. So, let's just skip.
                            if (bounds && options.conditions[index.keyPath]) {
                                cursor.continue(options.conditions[index.keyPath][1] + 1);
                                /* We need to 'terminate' the cursor cleany, by moving to the end */
                            } else {
                                cursor.continue();
                                /* We need to 'terminate' the cursor cleany, by moving to the end */
                            }
                        }
                        else if (options.offset && options.offset > skipped) {
                            skipped++;
                            cursor.continue();
                            /* We need to Moving the cursor forward */
                        } else {
                            // This time, it looks like it's good!
                            if (options.addIndividually) {
                                collection.add(cursor.value);
                            } else if (options.clear) {
                                var deleteRequest = store.delete(cursor.value.id);
                                deleteRequest.onsuccess = function (event) {
                                    elements.push(cursor.value);
                                };
                                deleteRequest.onerror = function (event) {
                                    elements.push(cursor.value);
                                };

                            } else {
                                elements.push(cursor.value);
                            }
                            processed++;
                            cursor.continue();
                        }
                    }
                };
            }
        },
        close: function () {
            if (this.db) {
                this.db.close()
                ;
            }
        }
    };

    // ExecutionQueue object
    // The execution queue is an abstraction to buffer up requests to the database.
    // It holds a "driver". When the driver is ready, it just fires up the queue and executes in sync.
    function ExecutionQueue(schema, next, nolog) {
        this.driver = new Driver(schema, this.ready.bind(this), nolog);
        this.started = false;
        this.stack = [];
        this.version = _.last(schema.migrations).version;
        this.next = next;
    }

    // ExecutionQueue Prototype
    ExecutionQueue.prototype = {
        // Called when the driver is ready
        // It just loops over the elements in the queue and executes them.
        ready: function () {
            this.started = true;
            _.each(this.stack, function (message) {
                this.execute(message);
            }.bind(this));
            this.stack = [];    // fix memory leak
            this.next();
        },
        // Executes a given command on the driver. If not started, just stacks up one more element.
        execute: function (message) {
            if (this.started) {
                this.driver.execute(message[2].storeName || message[1].storeName, message[0], message[1], message[2]); // Upon messages, we execute the query
            } else {
                this.stack.push(message);
            }
        },
        close: function () {
            this.driver.close();
        }
    };

    // Method used by Backbone for sync of data with data store. It was initially designed to work with "server side" APIs, This wrapper makes
    // it work with the local indexedDB stuff. It uses the schema attribute provided by the object.
    // The wrapper keeps an active Executuon Queue for each "schema", and executes querues agains it, based on the object type (collection or
    // single model), but also the method... etc.
    // Keeps track of the connections
    var Databases = {};

    function sync(method, object, options) {

        if (method == "closeall") {
            _.each(Databases, function (database) {
                database.close();
            });
            // Clean up active databases object.
            Databases = {}
            return;
        }

        // If a model or a collection does not define a database, fall back on ajaxSync
        if (typeof object.database === 'undefined' && typeof Backbone.ajaxSync === 'function') {
            return Backbone.ajaxSync(method, object, options);
        }

        var schema = object.database;
        if (Databases[schema.id]) {
            if (Databases[schema.id].version != _.last(schema.migrations).version) {
                Databases[schema.id].close();
                delete Databases[schema.id];
            }
        }

        var promise;
        var noop = function () {
        };

        if (typeof ($) != 'undefined' && $.Deferred) {
            var dfd = $.Deferred();
            var resolve = dfd.resolve;
            var reject = dfd.reject;

            promise = dfd.promise();
        } else {
            var resolve = noop;
            var reject = noop;
        }

        var success = options.success;
        options.success = function (resp) {
            if (success)
                success(resp);
            resolve();
            object.trigger('sync', object, resp, options);
        };

        var error = options.error;
        options.error = function (resp) {
            if (error)
                error(resp);
            reject();
            object.trigger('error', object, resp, options);
        };

        var next = function () {
            Databases[schema.id].execute([method, object, options]);
        };

        if (!Databases[schema.id]) {
            Databases[schema.id] = new ExecutionQueue(schema, next, schema.nolog);
        } else {
            next();
        }

        return promise;
    };
    function VinopleSync(schema) {
        this.Databases = {};
        this.schema = schema;

        var next = function () {
//           this.Databases[schema.id].execute([method, object, options]);
        };
        this.Databases[schema.id] = new ExecutionQueue(schema, next, schema.nolog);
        this.callbacks = {};
    }

    VinopleSync.prototype = {
        syncServer: function (models, options) {
            if (typeof window.socket !== 'undefined' && window.socket.socket.connected) {
                console.log('Sync started... Sending request...');
                var self = this;

                var request = {};

                request.action = 'sync';
//                request.resource = object.url;
                request.resources = [];
                request.uid = uuid.v4();
                request.clientid = window.localStorage.clientid || 'c5fb8dec-ea9f-43b1-a31f-fa4c46fe1a94';
//                this.callbacks[request.uid] = object.storeName;
                var totalModels = models.length;

                var db = this.Databases[this.schema.id];
                async.eachSeries(models, function (model, callback) {
                        var resource = {};

                        resource.resource = model.url;
                        resource.storeName = model.storeName;

                        self.findUpdated(resource, db)
                            .then(self.findLastmodified)
                            .then(function(resource) {
                                request.resources.push(resource);
                                callback(null);
                            })
                            .catch(function (error) {
                                console.log(error);
                            })

                    },
                    function (err, result) {
                        self.sendRequest(request);
                    });
//                for (var i = 0, j = models.length; i < j; ++i) {
//                    var model = models[i];
//                    var resource = {};
//                    request.resources[i] = resource;
//                    request.resources[i].resource = model.url;
//                    request.resources[i].storeName = model.storeName;
//                    this.findUpdated(request, model, i, j, function (request, model, progress, total) {
//                        self.findLastmodified(request, model, progress, total, function (request, progress, total) {
//                            //Pošalji request prema serveru ako je zadnji
//                            if (progress + 1 === total) {
//                                self.sendRequest(request);
//                            }
//                        });
//                    });
//                }


            }
        },
        sendRequest: function (request) {
            window.socket.emit('vinople.db', request);
        },
        findLastmodified: function (result) {
            var resource = result.resource,
                db = result.db;

            var deferred = Q.defer();
            //Pronaći max lastmodified
            var todayTimestamp = new Date().getTime();
            var collection = new Backbone.Collection();
            collection.storeName = resource.storeName;
            collection.comparator = function (model) {
                return model.get('lastmodified');
            };
            var options = {};
            options.conditions = {lastmodified: [0, todayTimestamp]};
            options.success = function (fetchedCollection) {
                var lastmodified = 0;
                if (fetchedCollection.length > 0) {
                    collection.add(fetchedCollection);
                    collection.sort();
                    var lastModel = collection.last();
                    lastmodified = lastModel.get('lastmodified') || 0;

                }
                resource.lastmodified = lastmodified;
                deferred.resolve(resource);
            };
            options.error = function(error) {
                deferred.reject(error);
            };
            db.execute(['read', collection, options]);
            return deferred.promise;
        },
        findUpdated: function (resource, db) {
            var deferred = Q.defer();
            //Pronaći sve koji imaju syncstatus = 1
            var collection = new Backbone.Collection();
            collection.storeName = resource.storeName;
            var options = {};
            options.conditions = {syncstatus: 1};
            options.success = function (fetchedCollection) {
                var updatedData = fetchedCollection;
                resource.data = updatedData;
                deferred.resolve({resource: resource, db: db});
            };
            options.error = function(error) {
                deferred.reject(error);
            };
            db.execute(['read', collection, options]);
            return deferred.promise;
        },
        handleMsg: function (msg, options) {
            if (typeof msg.models !== 'undefined') {

                if (msg.uid && msg.result === 'success') {
//                if (msg.resource === model.url) {
//            this.reset();
                    var action = msg.action;
                    switch (action) {
//                        case 'read':
////                            model.add(output);
////                            this._create(this.callbacks[msg.uid], output);    //Fetches model root
////                            options.success(output);
//                            var array = [];
//                            if (Array.isArray(output)) {
//                                array = output;
//                            } else {
//                                array.push(output);
//                            }
//                            for (var i = 0, j = array.length; i < j; ++i) {
//
//                                var newModel = new Backbone.Model(array[i]);
//                                newModel.storeName = this.callbacks[msg.uid];
//                                this.Databases[this.schema.id].execute(['update', newModel, options]);
//                            }
//
//                            break;
//                        case 'create':
//
//                            break;
//                        case 'update':
//
//                            break;
                        case 'sync':
                            for (var x = 0, y = msg.models.length; x < y; ++x) {
                                var model = msg.models[x];
                                if (model) {
                                    var output = model.output;
                                    var array = [];
                                    if (Array.isArray(output)) {
                                        array = output;
                                    } else {
                                        array.push(output);
                                    }
                                    for (var i = 0, j = array.length; i < j; ++i) {
                                        var data = array[i].data;
                                        if (_.isString(data)) {
                                            data = JSON.parse(data);
                                        }
                                        if (typeof data !== 'undefined') {
                                            var newModel = new Backbone.Model(data);
                                            newModel.storeName = model.storeName;
                                            this.Databases[this.schema.id].execute(['update', newModel, options]);
                                        }
                                    }
                                }
                            }
                            console.log('Sync: sync finished');
                            break;
                    }
                }
                if (msg.uid && this.callbacks[msg.uid] && msg.result === 'fault') {
                    console.log('Vinople sync fault: ' + msg.fault);
                }
            }
        }
    };
    function FileSync(database) {
        this.Databases = {};
        this.database = database;

        var next = function () {
//           this.Databases[schema.id].execute([method, object, options]);
        };
        this.Databases[database.id] = new ExecutionQueue(database, next, database.nolog);
        this.callbacks = {};
    }

    FileSync.prototype = {
        syncObject: function (sampledata, schema) {
            var objectstores = schema.objectstores;
            this.schema = schema;
            var method = 'read';
            var options = {};
            options.success = function (json) {
//            console.log('Update success: ' + json.id);
            };
            options.error = function (e) {
                console.log(e);
            };

//        db.open(this.root, function() {
            for (var i = 0, j = objectstores.length; i < j; ++i) {
                var model = {};
                model.storeName = objectstores[i].storename;
                model.url = objectstores[i].storename.toLowerCase();
                model.add = function (model) {

                };
                if (typeof sampledata[objectstores[i].storename] !== 'undefined') {
                    var data = sampledata[objectstores[i].storename].data;
                    var output = data;
                    var array = [];
                    if (Array.isArray(output)) {
                        array = output;
                    } else {
                        array.push(output);
                    }
                    for (var x = 0, y = array.length; x < y; ++x) {

                        var newModel = new Backbone.Model(array[x]);
                        newModel.set('syncstatus', 1);
                        newModel.set('isdeleted', 0);
                        newModel.storeName = model.storeName;
                        this.Databases[this.database.id].execute(['update', newModel, options]);
                    }

                } else {
                    console.log('No data for ' + objectstores[i].storename);
                }
            }
        }
    };

    if (typeof exports == 'undefined') {
        Backbone.ajaxSync = Backbone.sync;
        Backbone.sync = sync;
    }
    else {
        exports.sync = sync;
        exports.debugLog = debugLog;
    }

    window.VinopleSync = new VinopleSync(database);
    window.FileSync = new FileSync(database);

    //window.addEventListener("unload",function(){Backbone.sync("closeall")})
})();
