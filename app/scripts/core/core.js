'use strict';
//V - Vinople
var V = V || {};
V.TopBar = Marionette.ItemView.extend({
    template: window.JST['/core/topBar.hbs'],
    events: {
        'click #back-canvas': 'back'
    },
    onShow: function() {
        var backcanvas = $('#back-canvas')[0];
        if (backcanvas) {
            var ctx = backcanvas.getContext("2d");
            if (ctx) {
                ctx.strokeStyle = 'rgb(255,255,255)';
                ctx.fillStyle = 'rgb(255,255,255)';
                ctx.lineWidth = 5;
//                ctx.fillRect(10, 10, 40, 40);
                var size = 35;
                var x = 10;
                var y = 25;
//                ctx.moveTo(10, 10);
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(x + 2, y);
                ctx.lineTo(size, y);
                ctx.moveTo(x, y);
                ctx.lineTo(x + (size / 3), y + (-size / 4));
                ctx.moveTo(x, y);
                ctx.lineTo(x + (size / 3), y + (size / 4));
                ctx.moveTo(x - 5, y);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
//                ctx.strokeRect(70, 10, 40, 40);
//                ctx.fillRect(130, 10, 40, 40);
//                ctx.strokeRect(130, 10, 40, 40);
//                ctx.strokeRect(190, 10, 40, 40);
//                ctx.fillRect(190, 10, 40, 40);
            } else {
                console.log("no context!  Can't go on");
            }
//            backcanvas.on('click', function(e) {
//                window.history.back();
//            });
        } else {
            console.log("Couldn't find the canvas!");
        }
    },
    serverOnline: function() {
        $('#server span').html('online');
    },
    serverOffline: function() {
        $('#server span').html('offline');
    },
    serverSyncing: function() {
        $('#server span').html('syncing');
    },
    back: function() {
        history.go(-1);
    }
});

var NF = {};
NF.en = {thousandsSeparator: ",",
    decimalSeparator: "."};
NF.hr = {thousandsSeparator: ".",
    decimalSeparator: ","};

Handlebars.registerHelper("nf", function(number, format) {
    var lang = window.localStorage.lang;
    lang = lang.split('-')[0];
    var locale = NF[lang];
    var result = number;
    return result;
});

V.IndexedDB = (function() {
    var tDB = function() {


    };
    var datastore = null;


    // prototype
    tDB.prototype = {
        constructor: tDB,
        /**
         * Open a connection to the datastore.
         */
        open: function(storename, callback) {
            this.storename = storename;
            // Database version.
//        var version = "2";

            // Open a connection to the datastore.
            var request = indexedDB.open("Vinople");
            var storename = this.storename;
            // Handle datastore upgrades.
            request.onupgradeneeded = function(e) {
                var db = e.target.result;

                e.target.transaction.onerror = tDB.onerror;

                // Delete the old datastore.
                if (db.objectStoreNames.contains(storename)) {
                    db.deleteObjectStore(storename);
                }

                // Create a new datastore.
                var store = db.createObjectStore(storename, {
                    keyPath: 'id'
                });
//            store.createIndex('naziv','naziv', {unique: false});
            };

            // Handle successful datastore access.
            request.onsuccess = function(e) {
                // Get a reference to the DB.
                datastore = e.target.result;

                // Execute the callback.
                callback();
            };

            // Handle errors when opening the datastore.
            request.onerror = tDB.onerror;
        },
        update: function(schema, callback) {
            var version = schema.version;
            var datastore = schema.datastore;

            var request = indexedDB.open(datastore, version);
            // Handle datastore upgrades.
            request.onupgradeneeded = function(e) {
                var db = e.target.result;

                e.target.transaction.onerror = tDB.onerror;

                // Delete the old datastore.
                var objectstores = schema.objectstores;
                for (var i = 0, j = objectstores.length; i < j; ++i) {
                    var storename = objectstores[i].storename;
                    if (db.objectStoreNames.contains(storename)) {
                        db.deleteObjectStore(storename);
                    }
                    var store = db.createObjectStore(storename, {
                        keyPath: 'id'
                    });
                    var keys = objectstores[i].keys;
                    if (typeof keys !== 'undefined') {
                        for (var x = 0, y = keys.length; x < y; ++x) {
                            var keyname = keys[x].keyname;
                            var keypath = keys[x].keypath || keys[x].keyname;
                            var unique = keys[x].unique || false;
                            store.createIndex(keyname, keypath, {unique: unique});
                        }
                    }
                }

            };

            // Handle successful datastore access.
            request.onsuccess = function(e) {
                // Get a reference to the DB.
                datastore = e.target.result;

                // Execute the callback.
                callback();
            };

            // Handle errors when opening the datastore.
            request.onerror = tDB.onerror;
        },
        deleteStore: function(schema, callback) {
            var version = parseInt(schema.version) + 1;
            version = version.toString();
            var datastore = schema.datastore;

            indexedDB.deleteDatabase(datastore);
        },
        /**
         * Fetch all of the todo items in the datastore.
         */
        selectAll: function(callback) {
            var db = datastore;
            var transaction = db.transaction([this.storename], 'readwrite');
            var objStore = transaction.objectStore(this.storename);

            var keyRange = IDBKeyRange.lowerBound(0);
            var cursorRequest = objStore.openCursor(keyRange);

            var sortaList = [];

            transaction.oncomplete = function(e) {
                // Execute the callback function.
                callback(sortaList);
            };

            cursorRequest.onsuccess = function(e) {
                var result = e.target.result;

                if (!!result === false) {
                    return;
                }

                sortaList.push(result.value);

                result.continue();
            };

            cursorRequest.onerror = tDB.onerror;
        },
        /**
         * Create a new todo item.
         */
        create: function(storename, data, callback) {
            // Get a reference to the db.
            var db = datastore;

            // Initiate a new transaction.
            var transaction = db.transaction([storename], 'readwrite');

            // Get the datastore.
            var objStore = transaction.objectStore(storename);

            // Create the datastore request.
            var request = objStore.put(data);

            // Handle a successful datastore put.
            request.onsuccess = function(e) {
                // Execute the callback function.
                callback(data);
            };

            // Handle errors.
            request.onerror = tDB.onerror;
        },
        /**
         * Create a new todo item.
         */
        remove: function(storename, key, callback) {
            // Get a reference to the db.
            var db = datastore;

            // Initiate a new transaction.
            var transaction = db.transaction([storename], 'readwrite');

            // Get the datastore.
            var objStore = transaction.objectStore(storename);

            // Create the datastore request.
            var request = objStore.delete(key);

            // Handle a successful datastore put.
            request.onsuccess = function(e) {
                // Execute the callback function.
                callback(key);
            };

            // Handle errors.
            request.onerror = tDB.onerror;
        }
    };
    // Export the tDB object.
    return tDB;
}());

// -- VinopleSync --------------------------------------------------------------



//Backbone.sync = new VinopleSync().sync;
//(function() {
//    var VinopleSync = {
//        initialize: function(backbone, url, cb) {
//            if (!backbone)
//                throw new Error('Backbone must be defined');
//            this.backbone = backbone;
//            this.backbone.sync = this.sync;
//            if (this.socket) {
//                cb();
//            } else {
//                this.socket = window.socket;
//            }
//            this.db = new V.IndexedDB();
//        },
//        sync: function(method, model, options) {
//            var response, errorInfo;
//            var db = this.db = new V.IndexedDB();
//            this.db.open(this.root, function() {
//                 console.log("opened IndexedDB.");
//                            VinopleSync.dbopened = true;
//                try {
//                    switch (method) {
//                        case 'read':
//
//                            
//
//                           
//                            db.selectAll(options.success);
//
//                            setTimeout(VinopleSync._syncServer(model, method, options, null), 2000);
//                            break;
//                        case 'create':
//                            if (model.isNew()) {
//                                model.set('id', VinopleSync.generateID());
//                            }
//                            response = VinopleSync._create(model.root, model.toJSON());
//                            setTimeout(VinopleSync._syncServer(method, options, response, callback), 2000);
//                            break;
//                        case 'update':
//                            response = VinopleSync._update(model.root, model.toJSON());
//                            setTimeout(VinopleSync._syncServer(method, options, response, callback), 2000);
//                        case 'delete':
//                            response = VinopleSync._destroy(options);
//                            setTimeout(VinopleSync._syncServer(method, options, response, callback), 2000);
//                            break;
//                    }
//                } catch (error) {
//                    errorInfo = error.message;
//                    options.error(null, errorInfo);
//                }
//
////        if (response) {
////            callback(null, response);
////        } else if (errorInfo) {
////            callback(errorInfo);
////        } else {
////            callback("Data not found in IndexedDB");
////        }
//            });
//        },
//        generateID: function() {
//            return uuid.v4();
//        },
//        // -- Protected Methods ----------------------------------------------------
//        _index: function() {
//
//            return VinopleSync._data[this.root];
//        },
//        _show: function() {
//            return VinopleSync._idMap[this.root][this.get('id')] || null;
//        },
//        _create: function(resource, output) {
//
////            this.set('id', this.generateID());
//            var hash = JSON.stringify(output);
////        this.add(hash);
////                data = VinopleSync._data[this.root],
////                idMap = VinopleSync._idMap[this.root];
//
//
////        hash.id = this.generateID(this.root);
////        data.push(hash);
////        idMap[hash.id] = hash;
//
//            this._save(resource, output);
//            return hash;
//        },
//        _update: function(resource, output) {
//             var hash = JSON.stringify(output);
//
//
//            this._save(resource, output);
//            return hash;
//        },
//        _destroy: function() {
//            this.db.remove(this.root, this.get('id'), function(key) {
//
//            });
//
//            return this.toJSON();
//        },
//        _save: function(resource, output) {
//            var array = [];
//            if (Array.isArray(output)) {
//                array = output;
//            } else {
//                array.push(output);
//            }
////            if (this._isYUIModelList) {
////                array = this._items;
////            } else {
//
////            }
//            for (var i = 0, j = array.length; i < j; ++i) {
//                this.db.create(resource, array[i], function(data) {
//
//                });
//            }
//
////        if (VinopleSync._hasLocalStorage) {
////            this.storage && this.storage.setItem(
////                    this.root,
////                    Y.JSON.stringify(VinopleSync._data[this.root])
////                    );
////        }
//        },
//        callbacks: {},
//        _syncServer: function(model, action, options, data) {
//            if (typeof window.socket !== 'undefined' && window.socket.readyState > 0) {
//                var self = this;
//                window.socket.onmessage = function(e) {
//                    self._handleMsg(model, options, JSON.parse(e.data));
//                };
////            var resource= this.resource;
////                this.fire('syncStart', {resource: this.resource});
//                var request = {};
//                request.action = action;
////                request.options = options;
////                if (model instanceof VinopleSync.backbone.Collection) {
////                    request.resource = model.model.url;
////                } else {
//                request.resource = model.url;
////                }
////                request.resource = model.url;
//                request.path = action;
//                request.data = data;
//                request.uid = uuid.v4();
//
//                this.callbacks[request.uid] = model.root;
//                window.socket.send(JSON.stringify(request));
//
//            }
//        },
//        _handleMsg: function(model, options, msg) {
//            if (typeof msg.output !== 'undefined') {
//                var output = JSON.parse(msg.output);
//                if (msg.uid && this.callbacks[msg.uid]) {
////                if (msg.resource === model.url) {
////            this.reset();
//                    var action = msg.action;
//                    switch (action) {
//                        case 'read':
//                            model.add(output);
//                            this._create(this.callbacks[msg.uid], output);    //Fetches model root
//                            options.success(output);
//                            break;
//                        case 'create':
//
//                            break;
//                        case 'update':
//
//                            break;
//                        case 'delete':
//
//                            break;
//                    }
//                }
//            }
//        }
//    };
//Not using at the moment
//    VinopleSync.initialize(Backbone);
//    window.VinopleSync = VinopleSync;
//})(this);


