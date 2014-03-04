'use strict';

V.Postavke = Marionette.ItemView.extend({
    template: window.JST['/controls/loading.hbs'],
    templatereal: window.JST['/postavke/postavkeView.hbs'],
    events: {
        'click .lang': 'switchLanguage',
        'click #grupaGrozdeBtn': 'setGrupaGrozde',
        'click #grupaMasuljBtn': 'setGrupaMasulj',
        'click #grupaMostBtn': 'setGrupaMost',
        'click #grupaVinoBtn': 'setGrupaVino',
        'click #deleteLocalDbBtn': 'deleteLocalDb',
        'click #loadSampleDataBtn': 'loadSampleData'
//        'toggled #panel2-2': 'showGroups'
    },
    initialize: function() {
//        this.fetchData();
        this.template = this.templatereal;
        this.render();
    },
    fetchData: function() {
        var postavke = new Backbone.Model();
        this.model = postavke;
        var self = this;
        this.stages = 4;    //Number of things to load
        this.progress = 0;   //Loading progress
        var grupaGrozde = new V.System({key: 'GRUPA_GROZDE'});
        grupaGrozde.fetch({success: function(model) {
                var id = model.get('value');
                var grupa = new V.Grupa({id: id});
                grupa.fetch({success: function(model) {
                        postavke.set('grupaGrozde', model.get('naziv'));
                        self.progress++;
                        self.tryRender();
                    }, error: function(e) {
                        console.log('Error fetching grupaGrozde');
                        self.progress++;
                        self.tryRender();
                    }
                });
            }, error: function(e) {
                console.log('Error fetching grupaGrozde');
                self.progress++;
                self.tryRender();
            }
        });
        var grupaMost = new V.System({key: 'GRUPA_MOST'});
        grupaMost.fetch({success: function(model) {
                var id = model.get('value');
                var grupa = new V.Grupa({id: id});
                grupa.fetch({success: function(model) {
                        postavke.set('grupaMost', model.get('naziv'));
                        self.progress++;
                        self.tryRender();
                    }, error: function(e) {
                        console.log('Error fetching grupaMost');
                        self.progress++;
                        self.tryRender();
                    }
                });
            }, error: function(e) {
                console.log('Error fetching grupaGrozde');
                self.progress++;
                self.tryRender();
            }
        });
        var grupaMasulj = new V.System({key: 'GRUPA_MASULJ'});
        grupaMasulj.fetch({success: function(model) {
                var id = model.get('value');
                var grupa = new V.Grupa({id: id});
                grupa.fetch({success: function(model) {
                        postavke.set('grupaMasulj', model.get('naziv'));
                        self.progress++;
                        self.tryRender();
                    }, error: function(e) {
                        console.log('Error fetching grupaMasulj');
                        self.progress++;
                        self.tryRender();
                    }
                });
            }, error: function(e) {
                console.log('Error fetching grupaGrozde');
                self.progress++;
                self.tryRender();
            }
        });
        var grupaVino = new V.System({key: 'GRUPA_VINO'});
        grupaVino.fetch({success: function(model) {
                var id = model.get('value');
                var grupa = new V.Grupa({id: id});
                grupa.fetch({success: function(model) {
                        postavke.set('grupaVino', model.get('naziv'));
                        self.progress++;
                        self.tryRender();
                    }, error: function(e) {
                        console.log('Error fetching grupaVino');
                        self.progress++;
                        self.tryRender();
                    }
                });
            }, error: function(e) {
                console.log('Error fetching grupaGrozde');
                self.progress++;
                self.tryRender();
            }
        });
    },
    tryRender: function() {
        if (this.progress === this.stages) {
            this.template = this.templatereal;
            this.render();
        }
    },
    onRender: function() {
        var self = this;
//        this.groups = new V.GrupaList();
//        this.groups.fetch();
//        this.groups.on('sync', function(list) {
//            self.showGroups(list.toJSON());
//        });
        Foundation.init();
//        this.showGroups()
    },
    showGroups: function(list) {
        var treeDiv = this.$('#groupTree');
//        $.jstree.defaults.core.theme.variant = "large";
        var data = [];
        var map = {}, node = {}, roots = [], unsettled = [], group;  //unsettled nodes
        for (var i = 0, j = list.length; i < j; ++i) {
            group = list[i];
            node = list[i];
            node.text = group.naziv;
            node.children = [];
            map[node.id] = i; // use map to look-up the parents
            if (node.parent !== null) {
                if (typeof map[node.parent] !== 'undefined') {
                    list[map[group.parent]].children.push(node);
                    delete node.parent;
                } else {
                    unsettled.push(node);
                }
            } else {
                roots.push(node);
                delete node.parent;
            }


        }
        //Ovo moram nekako popraviti
        while (unsettled.length > 0) {
            var node = unsettled.shift();
            if (typeof map[node.parent] !== 'undefined') {
                list[map[node.parent]].children.push(node);
            } else {
                unsettled.push(node);
            }
        }
//        var jsonData = JSON.stringify(roots);
        treeDiv
                .on('changed.jstree', function(e, data) {
                    var tf = $('#odabranaGrupaTF');
                    tf.val(data.node.text);
                    tf.data('id', data.node.id);
                    var checked = data.node.original.container || false;
                    $('#odabranaGrupaContainerCB').attr('checked', checked);
                })
                .jstree({'core': {
                        'data': roots
                    }
                });
    },
    switchLanguage: function(e) {

        var lang = e.currentTarget.dataset['lang'];
        window.localStorage.lang = lang;
        location.reload();

    },
    onShow: function() {
        Foundation.init();
    },
    setGrupaGrozde: function(e) {
        var selectedNodes = this.$('#groupTree').jstree().get_selected();
        if (selectedNodes.length > 0) {
            var selectedId = selectedNodes[0];
            var selectedNode = this.$('#groupTree').jstree().get_node(selectedId);
            this.$('#grupaGrozde').html(selectedNode.text);
            //Save to system table
            var systemProp = new V.System({key: 'GRUPA_GROZDE'});
            systemProp.fetch({success: function(model) {
                    model.set('value', selectedId);
                    model.save();
                },
                error: function(notFoundModel) {
                    notFoundModel.set('value', selectedId);
                    notFoundModel.save();
                }
            });

        }
        e.preventDefault();

    },
    setGrupaMasulj: function(e) {
        var selectedNodes = this.$('#groupTree').jstree().get_selected();
        if (selectedNodes.length > 0) {
            var selectedId = selectedNodes[0];
            var selectedNode = this.$('#groupTree').jstree().get_node(selectedId);
            this.$('#grupaMasulj').html(selectedNode.text);
            //Save to system table
            var systemProp = new V.System({key: 'GRUPA_MASULJ'});
            systemProp.fetch({success: function(model) {
                    model.set('value', selectedId);
                    model.save();
                },
                error: function(notFoundModel) {
                    notFoundModel.set('value', selectedId);
                    notFoundModel.save();
                }
            });

        }
        e.preventDefault();
    },
    setGrupaVino: function(e) {
        var selectedNodes = this.$('#groupTree').jstree().get_selected();
        if (selectedNodes.length > 0) {
            var selectedId = selectedNodes[0];
            var selectedNode = this.$('#groupTree').jstree().get_node(selectedId);
            this.$('#grupaVino').html(selectedNode.text);
            //Save to system table
            var systemProp = new V.System({key: 'GRUPA_VINO'});
            systemProp.fetch({success: function(model) {
                    model.set('value', selectedId);
                    model.save();
                },
                error: function(notFoundModel) {
                    notFoundModel.set('value', selectedId);
                    notFoundModel.save();
                }
            });

        }
        e.preventDefault();
    },
    setGrupaMost: function(e) {
        var selectedNodes = this.$('#groupTree').jstree().get_selected();
        if (selectedNodes.length > 0) {
            var selectedId = selectedNodes[0];
            var selectedNode = this.$('#groupTree').jstree().get_node(selectedId);
            this.$('#grupaMost').html(selectedNode.text);
            //Save to system table
            var systemProp = new V.System({key: 'GRUPA_MOST'});
            systemProp.fetch({success: function(model) {
                    model.set('value', selectedId);
                    model.save();
                },
                error: function(notFoundModel) {
                    notFoundModel.set('value', selectedId);
                    notFoundModel.save();
                }
            });

        }
        e.preventDefault();
    },
    deleteLocalDb: function(e) {
        //Sync db;
        var schema = V.VinopleSchema;
        indexedDB.deleteDatabase(schema.datastore);
        e.preventDefault();
//        location.reload();
    },
    loadSampleData: function(e) {
        var schema = V.VinopleSchema;
//        indexedDB.deleteDatabase(schema.datastore);
 var db = new V.IndexedDB();
     db.update(schema, function() {
        console.log("IndexedDB schema updated to version: " + schema.version);
        });
        var sampleData = V.SampleData;
       
       window.FileSync.syncObject(sampleData, schema);

        e.preventDefault();
//        location.reload();
    }

});
