V.Tvrtka = Marionette.ItemView.extend({
    template: window.JST['/tvrtka/tvrtkaView.hbs']
});


V.Tanks = Marionette.ItemView.extend({
    template: window.JST['/tvrtka/tanks.hbs'],
    initialize: function () {
        this.posudaList = new V.PosudaList();
        this.table = new Backgrid.Grid({
            columns: [
                {name: 'oznaka', label: "Label", cell: 'string'},
                {name: 'volumen', label: "Volume", cell: 'string'},
                {name: 'lokacija', label: "Location", cell: 'string'}
            ],
            collection: this.posudaList
        });
    },
    onRender: function () {
        this.$el.hide();
        _.defer(_.bind(this.transitionIn_, this));

        var render = this.table.render().el;
        this.$("#table").append(render);
        var self = this;
        this.posudaList.fetch();
        this.fetchLokacije();
    },
    fetchLokacije: function () {

        var s = this.$('#lokacijaDropdown');
        var sekcijaList = new V.SekcijaList();
        sekcijaList.fetch({success: function (list) {
            var optionsHtml = '',
                lokacijaMap = {};
            for (var i = 0, j = list.length; i < j; ++i) {
                var sekcija = list.models[i];
                if (typeof lokacijaMap[sekcija.get('lokacijaId')] === 'undefined') {
                    lokacijaMap[sekcija.get('lokacijaId')] = [];
                }
                lokacijaMap[sekcija.get('lokacijaId')].push(sekcija);

            }
            for (i in lokacijaMap) {
                if (i != null) {
                    var key = i;
                    var lokacija = new V.Lokacija({id: key});
                    lokacija.fetch({success: function(lok) {
                        optionsHtml += '<option disabled="disabled">' + lok.get('naziv') + '</option>';
                        for (var x = 0, y = lokacijaMap[i].length; x < y; ++x) {
                            var sek = lokacijaMap[i][x];
                            optionsHtml += '<option value="' + sek.get('id') + '">' + sek.get('naziv') + '</option>';
                        }
                        s.append(optionsHtml);
                    }});

                }
            }


        }});


    }
});

V.Lokacije = Marionette.ItemView.extend({
    template: window.JST['/tvrtka/lokacije.hbs'],
    initialize: function () {
        this.lokacijaList = new V.LokacijaList();
        this.lokacijaList.fetch();
        this.lokacijaItems = new V.LokacijaWidget({collection: this.lokacijaList});
        var self = this;
        this.lokacijaList.on('add', function () {
            var render = self.lokacijaItems.render().el;
            self.$("#lokacije").append(render);
        });

    }
});

V.Ljudi = Marionette.ItemView.extend({
    template: window.JST['/tvrtka/ljudi.hbs'],
    events: {
        'submit #saveForm': 'save'
    },
    initialize: function () {
        this.ljudiList = new V.LoginUserList();
        this.table = new Backgrid.Grid({
            columns: [
                {name: 'fullName', label: "Full name", cell: 'string'},
                {name: 'email', label: "E-mail", cell: 'string'},
                {name: 'password', label: "Pssword", cell: 'string'}
            ],
            collection: this.ljudiList
        });
    },
    onRender: function () {
        this.$el.hide();
        _.defer(_.bind(this.transitionIn_, this));

        var render = this.table.render().el;
        this.$("#table").append(render);
        this.ljudiList.fetch();
    },
    save: function (e) {
        var data = $(e.currentTarget).serializeObject();
        this.ljudiList.create(data);
    },
    deleteRecord: function (e) {
        var model = this.table.selectedRecord;
        var id = model.get('id');
        model.destroy({remove: true});
//        this.table.removeRow(model),
//        var rec = rec;
        e.preventDefault();
    },
    newRecord: function (e) {
        clearChildren(document.getElementById('saveForm'));
        e.preventDefault();
    }
});
V.LokacijaWidget = Marionette.ItemView.extend({
    template: window.JST['/tvrtka/lokacijaWidget.hbs']
});
V.Partneri = Marionette.ItemView.extend({
    template: window.JST['/tvrtka/partneri.hbs'],
    events: {
        'click #deleteBtn': 'deleteRecord',
        'submit #saveForm': 'save'
    },
    initialize: function () {
        this.partneri = new V.PartnerList();
        this.table = new Backgrid.Grid({
            columns: [
                {name: '', label: "", cell: 'select-row', editable: false, headerCell: 'select-all'},
                {name: 'naziv', label: V.Lang['LBL_naziv'], cell: 'string'},
                {name: 'adresa', label: V.Lang['LBL_adresa'], cell: 'string'},
                {name: 'postBroj', label: V.Lang['LBL_postbroj'], cell: 'string'},
                {name: 'mjesto', label: V.Lang['LBL_mjesto'], cell: 'string'},
                {name: 'oib', label: V.Lang['LBL_oib'], cell: 'string'},
                {name: 'kupac', label: V.Lang['LBL_kupac'], cell: 'boolean'},
                {name: 'dobavljac', label: V.Lang['LBL_dobavljac'], cell: 'boolean'}
            ],
            collection: this.partneri
        });
    },
    onRender: function () {
        this.$el.hide();
        _.defer(_.bind(this.transitionIn_, this));

        var render = this.table.render().el;
        this.$("#table").append(render);
        this.partneri.fetch();
    },
    save: function (e) {
        var data = $(e.currentTarget).serializeObject();
        this.partneri.create(data);
    },
    deleteRecord: function (e) {
        var selectedModels = this.table.getSelectedModels();

        for (var i = 0, j = selectedModels.length; i < j; ++i) {
            selectedModels[i].destroy({remove: true});
        }
//        model.destroy({remove: true});
//        this.table.removeRow(model),
//        var rec = rec;
        e.preventDefault();
    },
    newRecord: function (e) {
        clearChildren(document.getElementById('saveForm'));
        e.preventDefault();
    }
});
//
//Y.Tanks = Y.Base.create('Tanks', Y.View, [], {
//    template: 'tanks',
//    resources: Y.Intl.get("tvrtka"),
//    events: {
//        '#saveForm': {submit: 'save'}
//    },
//    initializer: function() {
//        this.posudaList = new Y.PosudaList();
//        this.posudaList.load();
//        var data = this.posudaList;
//        this.table = new Y.DataTable({
//            columns: [
//                {key: 'oznaka', label: "Label", width: '325px'},
//                {key: 'volumen', label: "Volume", width: '125px'},
//                {key: 'lokacija', label: "Location", width: '125px'}
//            ],
//            data: data
//        });
//        this.table.addAttr("selectedRow", {value: null});
//        this.table.after('selectedRowChange', function(e) {
//
//            var tr = e.newVal, // the Node for the TR clicked ...
//                    last_tr = e.prevVal, //  "   "   "   the last TR clicked ...
//                    rec = this.getRecord(tr);   // the current Record for the clicked TR
//
//            //
//            //  This if-block does double duty,
//            //  (a) it tracks the first click to toggle the "details" DIV to visible
//            //  (b) it un-hightlights the last TR clicked
//            //
//            if (!last_tr) {
//
//            } else {
//                last_tr.removeClass("myhilite");
//            }
//
//            //
//            //  After unhighlighting, now highlight the current TR
//            //
//            tr.addClass("myhilite");
//
//
//            //
//            //  Collect the "chars" member of the parent record into an array of
//            //  objects  with property name "aname"
//            //
//            var detail_data = [];
//            if (rec.get('chars')) {
//                Y.Array.each(rec.get('chars'), function(item) {
////                    detail_data.push({char_name: item});
//                });
//            }
//
//
//        });
//    },
//    render: function() {
//        var template = Handlebars.templates[this.template];
//        this.get('container').setHTML(template(this.resources));
//        var parent = this.get('container').one('#table');
//        this.table.render(parent);
//        this.table.delegate('click', function(e) {
//            this.set('selectedRow', e.currentTarget);
//        }, '.yui3-datatable-data tr', this.table);
//        return this;
//    },
//    save: function(e) {
//        var result = Y.QueryString.parse(Y.IO.stringify(e.currentTarget));
//        this.posudaList.create(result);
//        this.table.addRow(result);
//        var komada = Number(result.komada) || 0;
//        if (komada > 1) {
//            var pattern = /\d+$/;
//            var startBroj = Number(pattern.exec(result.oznaka)[0]);
//            for (var i = 1; i < komada; ++i) {
//                var noviTank = {};
//                noviTank.volumen = result.volumen;
//                var novaOznaka = startBroj + i
//                noviTank.oznaka = result.oznaka.replace(pattern, '' + novaOznaka);
//                this.table.addRow(noviTank);
//                this.posudaList.create(noviTank);
//            }
//        }
//
//
//
////        alert(result);
//    }
//});
//
//Y.Lokacije = Y.Base.create('Lokacije', Y.View, [], {
//    template: 'lokacije',
//    resources: Y.Intl.get("tvrtka"),
//    events: {
//        '#saveBtn': {click: 'save'}
//    },
//    initializer: function() {
//        var lokacijaList = new Y.LokacijaList();
//
//        this.set('model', lokacijaList);
//        var self = this;
//        lokacijaList.on('load', function(e) {
//            var parent = self.get('container').one('#lokacije');
//            parent.setHTML('');
//            var lokacijaList = self.get('model');
//            lokacijaList.each(function(model) {
//                var lokacijaWidget = new Y.LokacijaWidget({model: model});
//                parent.append(lokacijaWidget.render().get('container'));
//            });
//        });
//    },
//    render: function() {
//        var template = Handlebars.templates[this.template];
//        this.get('container').setHTML(template(this.resources));
//        this.get('model').load();
//        this.get('container').one('#lokacije').setHTML('<p><img src="/images/ajax-loader.gif" alt="ajax-loader" /> Loading...</p>');
//        return this;
//    },
//    save: function(e) {
//        //  http://yuiblog.com/blog/2008/05/08/inputex/   komponenta za validaciju forme
//        var formData = Y.one('#saveForm');
//    }
//});
//
//Y.Ljudi = Y.Base.create('Ljudi', Y.View, [], {
//    template: 'ljudi',
//    resources: Y.Intl.get("tvrtka"),
//    events: {
//        '#saveForm': {submit: 'save'},
//        '#deleteBtn': {click: 'deleteRecord'},
//        '#newBtn': {click: 'newRecord'}
//    },
//    sync: false,
//    initializer: function() {
//        this.ljudiList = new Y.LoginUserList();
//        var container = this.get('container');
//        var self = this;
//
//        this.ljudiList.on('syncStart', function(e) {
//            self.sync = true;
////           container.one('#serversync').setHTML('syncing... ');
////        var node = this.get('container').one('#spinner');
////        var spinner = new Y.Spinner({srcNode: node});
////        spinner.render();
//        });
//        this.ljudiList.load();
//        var data = this.ljudiList;
//        this.table = new Y.DataTable({
//            columns: [
//                {key: 'fullName', label: "Name", width: '325px'},
//                {key: 'email', label: "E-mail", width: '125px'},
//                {key: 'password', label: "Password", width: '125px'}
//            ],
//            data: data
//        });
//        this.table.addAttr("selectedRow", {value: null});
//        this.table.after('selectedRowChange', function(e) {
//            var tr = e.newVal, // the Node for the TR clicked ...
//                    last_tr = e.prevVal, //  "   "   "   the last TR clicked ...
//                    rec = this.getRecord(tr);   // the current Record for the clicked TR
//            e.currentTarget.selectedRecord = rec;
//            //
//            //  This if-block does double duty,
//            //  (a) it tracks the first click to toggle the "details" DIV to visible
//            //  (b) it un-hightlights the last TR clicked
//            //
//            if (!last_tr) {
//            } else {
//                last_tr.removeClass("myhilite");
//            }
//            //
//            //  After unhighlighting, now highlight the current TR
//            //
//            tr.addClass("myhilite");
//            //
//            //  Collect the "chars" member of the parent record into an array of
//            //  objects  with property name "aname"
//            //
////            var detail_data = [];
////            if (rec.get('chars')) {
////                Y.Array.each(rec.get('chars'), function(item) {
//////                    detail_data.push({char_name: item});
////                });
////            }
//        });
//        this.publish('syncStart', {preventable: false});
//
//
//    },
//    render: function() {
//        var template = Handlebars.templates[this.template];
//        this.get('container').setHTML(template(this.resources));
//        var parent = this.get('container').one('#table');
//        this.table.render(parent);
//        this.table.delegate('click', function(e) {
//            this.set('selectedRow', e.currentTarget);
//        }, '.yui3-datatable-data tr', this.table);
//
//        return this;
//    },
//    save: function(e) {
//        var result = Y.QueryString.parse(Y.IO.stringify(e.currentTarget));
//        result.username = result.email;
//        this.ljudiList.create(result);
//    },
//    deleteRecord: function(e) {
//        var model = this.table.selectedRecord;
//        var id = model.get('id');
//        model.destroy({remove: true});
////        this.table.removeRow(model),
////        var rec = rec;
//        e.preventDefault();
//    },
//    newRecord: function(e) {
//        clearChildren(document.getElementById('saveForm'));
//        e.preventDefault();
//    },
//    serverSync: function(e) {
//
//        this.get('container').one('#serversync').setHTML('syncing... ' + e.path);
////        var node = this.get('container').one('#spinner');
////        var spinner = new Y.Spinner({srcNode: node});
////        spinner.render();
//    }
//});
//
//Y.LokacijaWidget = Y.Base.create('LokacijaWidget', Y.View, [], {
//    template: 'lokacijaWidget',
//    resources: Y.Intl.get("tvrtka"),
//    initializer: function() {
//
//    },
//    render: function() {
//        var context = this.resources;
//        mergeInto(context, this.get('model').toJSON());
//        var template = Handlebars.templates[this.template];
//        this.get('container').setHTML(template(context));
//
//        return this;
//    }
//});



