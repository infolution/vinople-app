V.Skladiste = Marionette.ItemView.extend({
    template: window.JST['/skladiste/skladisteView.hbs'],

    //Fade effect
    onRender: function () {
        this.$el.hide();
        _.defer(_.bind(this.transitionIn_, this));
    },
    transitionIn_: function () {
        this.$el.fadeIn();
    },
    remove: function () {
        var parent_remove = _.bind(function () {
            Backbone.View.prototype.remove.call(this);
        }, this);

        // Calls parent's `view` method after animation completes
        this.$el.fadeOut(400, parent_remove);
    }
    //Fade effect - END
});
V.Enosredstva = Marionette.ItemView.extend({
    template: window.JST['/skladiste/enosredstva.hbs'],
    events: {
        'click #noviBtn': 'viewPrimkaPanel'
    },
    initialize: function () {
        this.enosredstva = new V.ArtiklList();
        var self = this;
        var filtered = new V.ArtiklList();
        this.enosredstva.enoloskaSredstva(filtered, true).then(function (lista) {
            self.render();
        });
        this.table = new Backgrid.Grid({
            columns: [
                {name: 'sifra', label: "Šifra", cell: 'string'},
                {name: 'naziv', label: "Naziv", cell: 'string'},
                {name: 'stanje', label: "Stanje", cell: 'number'}
            ],
            collection: filtered
        });
    },
    onRender: function () {
        this.$el.hide();
        _.defer(_.bind(this.transitionIn_, this));

        var render = this.table.render().el;
        this.$("#table").append(render);

    },
    viewPrimkaPanel: function (e) {
        var id = e.currentTarget.dataset['id'];
        document.location.hash = '#/' + V.Lang['URL_skladiste'] + '/' + V.Lang['URL_primka'] + '/' + id + '/';
        //        this.fire('viewPrerada', {id: id});
        e.preventDefault();
    }

});
V.Repromaterijal = Marionette.ItemView.extend({
    template: window.JST['/skladiste/gotovaroba.hbs'],
    initialize: function () {
        this.repromaterijal = new V.ArtiklList();
        var self = this;
        var filtered = new V.ArtiklList();
        this.repromaterijal.repromaterijal(filtered, true).then(function (lista) {
            self.render();
        });
        this.table = new Backgrid.Grid({
            columns: [
                {name: 'sifra', label: "Šifra", cell: 'string'},
                {name: 'naziv', label: "Naziv", cell: 'string'},
                {name: 'stanje', label: "Stanje", cell: 'number'}
            ],
            collection: filtered
        });
    },
    onRender: function () {
        this.$el.hide();
        _.defer(_.bind(this.transitionIn_, this));

        var render = this.table.render().el;
        this.$("#table").append(render);

    }

});
V.GotovaRoba = Marionette.ItemView.extend({
    template: window.JST['/skladiste/gotovaroba.hbs'],
    initialize: function () {
        this.gotovaroba = new V.ArtiklList();
        var self = this;
        var filtered = new V.ArtiklList();
        this.gotovaroba.gotoviProizvod(filtered, true).then(function (lista) {
            self.render();
        });
        this.table = new Backgrid.Grid({
            columns: [
                {name: 'naziv', label: "Naziv", cell: 'string'},
                {name: 'stanje', label: "Stanje", cell: 'number'}
            ],
            collection: filtered
        });
    },
    onRender: function () {
        this.$el.hide();
        _.defer(_.bind(this.transitionIn_, this));

        var render = this.table.render().el;
        this.$("#table").append(render);

    }

});
V.Katalog = Marionette.ItemView.extend({
    template: window.JST['/skladiste/katalog.hbs'],
    initialize: function () {
        this.katalog = new V.ArtiklList();
        var self = this;
        var gotovaroba = new V.ArtiklList();
        var repromaterijal = new V.ArtiklList();
        var enosredstva = new V.ArtiklList();
        var sirovina = new V.ArtiklList();
        this.katalog.gotoviProizvod(gotovaroba, true)
            .then(function (lista) {
                return self.katalog.repromaterijal(repromaterijal, true);
            }).then(function (lista) {
                return self.katalog.enoloskaSredstva(enosredstva, true);
            }).then(function (lista) {
                return self.katalog.sirovina(sirovina, true);
            }).then(function (lista) {
                self.render();
            });


        this.gotovaRobaTable = new Backgrid.Grid({
            columns: [
                {name: 'sifra', label: "Šifra", cell: 'string'},
                {name: 'naziv', label: "Naziv", cell: 'string'},
                {name: 'stanje', label: "Stanje", cell: 'number'}
            ],
            collection: gotovaroba
        });
        this.repromaterijalTable = new Backgrid.Grid({
            columns: [
                {name: 'sifra', label: "Šifra", cell: 'string'},
                {name: 'naziv', label: "Naziv", cell: 'string'},
                {name: 'stanje', label: "Stanje", cell: 'number'}
            ],
            collection: repromaterijal
        });
        this.enosredstvaTable = new Backgrid.Grid({
            columns: [
                {name: 'sifra', label: "Šifra", cell: 'string'},
                {name: 'naziv', label: "Naziv", cell: 'string'},
                {name: 'stanje', label: "Stanje", cell: 'number'}
            ],
            collection: enosredstva
        });
        this.sirovinaTable = new Backgrid.Grid({
            columns: [
                {name: 'sifra', label: "Šifra", cell: 'string'},
                {name: 'naziv', label: "Naziv", cell: 'string'},
                {name: 'stanje', label: "Stanje", cell: 'number'}
            ],
            collection: sirovina
        });
    },
    onRender: function () {
        this.$el.hide();
        _.defer(_.bind(this.transitionIn_, this));


        this.$("#gotovaRobaTable").append(this.gotovaRobaTable.render().el);
        this.$("#repromaterijalTable").append(this.repromaterijalTable.render().el);
        this.$("#enosredstvaTable").append(this.enosredstvaTable.render().el);
        this.$("#sirovinaTable").append(this.sirovinaTable.render().el);
        Foundation.init();
    },
    onShow: function () {
        Foundation.init();
    }

});
V.PrimkaPanel = Marionette.ItemView.extend({
    template: window.JST['/skladiste/primkaPanel.hbs'],
    events: {
        'click #partner .button': 'choosePartner',
        'change #kolicina': 'calculateCijena',
        'change #cijena': 'calculateCijena',
        'submit #stavkaForm': 'addStavka',
        'click #deleteBtn': 'deleteStavka'
    },
    initialize: function () {
        var self = this;
        V.App.vent.on("partner:selected", function (data) {
            $('#modal').foundation('reveal', 'close');
            $('#partner input').val(data.naziv || '');
            $('#partner').data('id', data.id);
        });


//        this.artiklTable.collection.on("backgrid:selected", function(e){
//            self.$('#artikl').html(e.get("naziv"));
//            self.$('#artikl').data('id',e.get("id"));
//
//        });

        this.stavke = new V.StavkaList();
        this.stavkeTable = new Backgrid.Grid({
            columns: [
                {name: '', label: "", cell: 'select-row', editable: false, headerCell: 'select-all'},
                {name: 'sifra', label: V.Lang['LBL_sifra'], cell: 'string', editable: false},
                {name: 'naziv', label: V.Lang['LBL_naziv'], cell: 'string', editable: false},
                {name: 'proizvodac', label: "Proizvođač", cell: 'string', editable: false},
                {name: 'jmStavka', label: V.Lang['LBL_jm'], cell: 'string', editable: false},
                {name: 'kolicina', label: V.Lang['LBL_kolicina'], cell: 'string', editable: false},
                {name: 'cijena', label: V.Lang['LBL_cijena'], cell: 'string', editable: false},
                {name: 'iznos', label: V.Lang['LBL_iznos'], cell: 'string', editable: false}
            ],
            collection: this.stavke
        });
    },
    onRender: function () {
        var node1 = this.$('#datum')[0];
        var picker = this.primkaDatum = new Pikaday({
            field: node1,
            format: 'DD.MM.YYYY'
        });
        picker.setDate(new Date());
        var self = this;
        var artiklList = new V.ArtiklList();
        var filtered = new V.ArtiklList();
        artiklList.repromaterijal(filtered, function (lista) {
            self.d3(filtered.toJSON());
        }, true);
        this.$("#stavkeTable").html(this.stavkeTable.render().el);

        this.$el.hide();
        _.defer(_.bind(this.transitionIn_, this));

    },
    d3: function (items) {
        var sorted = this.sorted = items.sort(function (a, b) {
            return a.naziv <= b.naziv ? -1 : 1;
        });
        var ul = this.ul = d3.select(this.el).select("#selector-items").append("ul").attr("class", "artikli");
        ul.selectAll("li").data(sorted)
            .enter().append("li")
            .attr("data-id", function (d) {
                return d.id
            })
            .html(function (d) {
                return d.naziv
            });

    },
    filter: function (e) {
        var query = e.currentTarget.value.toLowerCase();
        var filtered = this.sorted.filter(function (d) {
            if (d.naziv.toLowerCase().indexOf(query) > -1) {
                return true;
            }
        });
        var li = this.ul.selectAll("li").data(filtered)
            .attr("data-id", function (d) {
                return d.id
            })
            .html(function (d) {
                return d.naziv
            });
        li.enter().append("li")
            .attr("data-id", function (d) {
                return d.id
            })
            .html(function (d) {
                return d.naziv
            });
        li.exit()
            .attr("data-id", function (d) {
                return d.id
            })
            .html(function (d) {
                return d.naziv
            })
            .remove();
    },
    choosePartner: function (e) {

        this.$('#modalTitle').html('Partner');
        var partnerSelector = new V.PartnerSelector();
        var render = partnerSelector.render().el;
        this.$('#modalContent').html(render);
        this.$('#modal').foundation('reveal', 'open');
        e.preventDefault();
    },
    calculateCijena: function (e) {
        var kolicina = this.$('#kolicina').val();
        var cijena = this.$('#cijena').val();
        var iznos = kolicina * cijena;
        this.$('#stavkaIznos').html(iznos);
    },
    addStavka: function (e) {
        var data = $(e.currentTarget).serializeObject();
        data.artiklId = $('#artikl').data('id');
        data.artikl = this.artiklList.get(data.artiklId).toJSON();
        data.naziv = data.artikl.naziv;
        data.proizvodac = data.artikl.proizvodac;
        data.sifra = data.artikl.sifra;

        data.iznos = $('#stavkaIznos').html();
        var stavka = new V.Stavka(data);
        this.stavke.add(stavka);
        e.preventDefault();
    },
    deleteStavka: function (e) {
        var selectedModels = this.stavkeTable.getSelectedModels();
        var model = selectedModels || null;
        this.stavke.remove(model);
        e.preventDefault();

    }
});
//
//Y.Skladiste = Y.Base.create('Skladiste', Y.View, [], {
//    template: 'skladisteView',
//    resources: Y.Intl.get("skladiste"),
//    initializer: function() {
//
//    },
//    render: function() {
//         var template = Handlebars.templates[this.template];
//         this.get('container').setHTML(template(this.resources));;
//        
//        return this;
//    }
//});
//
//Y.Enosredstva = Y.Base.create('Enosredstva', Y.View, [], {
//    template: 'enosredstva',
//    resources: Y.Intl.get("skladiste"),
//    initializer: function() {
//        var data = [
//            {id: "ga-3475", name: "Pinot crni", color: "C", active: true, sortable: true},
//            {id: "sp-9980", name: "Graševina", color: "B", active: true},
//            {id: "wi-0650", name: "Škrlet", color: "B", active: true},
//            {id: "ga-34752", name: "Pinot crni", color: "C", active: true, sortable: true},
//            {id: "sp-99802", name: "Graševina", color: "B", active: true},
//            {id: "wi-06502", name: "Škrlet", color: "B", active: true},
//            {id: "ga-34753", name: "Pinot crni", color: "C", active: true, sortable: true},
//            {id: "sp-99803", name: "Graševina", color: "B", active: true},
//            {id: "wi-06503", name: "Škrlet", color: "B", active: true},
//            {id: "ga-34754", name: "Pinot crni", color: "C", active: true, sortable: true},
//            {id: "sp-99840", name: "Graševina", color: "B", active: true},
//            {id: "wi-06504", name: "Škrlet", color: "B", active: true},
//            {id: "ga-34755", name: "Pinot crni", color: "C", active: true, sortable: true},
//            {id: "sp-99805", name: "Graševina", color: "B", active: true},
//            {id: "wi-06505", name: "Škrlet", color: "B", active: true},
//            {id: "ga-34756", name: "Pinot crni", color: "C", active: true, sortable: true},
//            {id: "sp-99806", name: "Graševina", color: "B", active: true},
//            {id: "wi-06506", name: "Škrlet", color: "B", active: true}
//        ];
//        this.table = new Y.DataTable({
//            columns: [
//                {key: 'name', label: "Name", width: '325px'},
//                {key: 'color', label: "Color", width: '125px'},
//                {key: 'active', label: "Active", allowHTML: true, // to avoid HTML escaping
//                    width: '125px',
//                    formatter: '<input type="checkbox" checked/>',
//                    emptyCellValue: '<input type="checkbox"/>'}
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
//        return this;
//    }
//});
//
//Y.Repromaterijal = Y.Base.create('Repromaterijal', Y.View, [], {
//    template: 'gotovaroba',
//    resources: Y.Intl.get("gotovaroba"),
//    initializer: function() {
//        var data = [
//            {id: "ga-3475", name: "Pinot crni", color: "C", active: true, sortable: true},
//            {id: "sp-9980", name: "Graševina", color: "B", active: true},
//            {id: "wi-0650", name: "Škrlet", color: "B", active: true},
//            {id: "ga-34752", name: "Pinot crni", color: "C", active: true, sortable: true},
//            {id: "sp-99802", name: "Graševina", color: "B", active: true},
//            {id: "wi-06502", name: "Škrlet", color: "B", active: true},
//            {id: "ga-34753", name: "Pinot crni", color: "C", active: true, sortable: true},
//            {id: "sp-99803", name: "Graševina", color: "B", active: true},
//            {id: "wi-06503", name: "Škrlet", color: "B", active: true},
//            {id: "ga-34754", name: "Pinot crni", color: "C", active: true, sortable: true},
//            {id: "sp-99840", name: "Graševina", color: "B", active: true},
//            {id: "wi-06504", name: "Škrlet", color: "B", active: true},
//            {id: "ga-34755", name: "Pinot crni", color: "C", active: true, sortable: true},
//            {id: "sp-99805", name: "Graševina", color: "B", active: true},
//            {id: "wi-06505", name: "Škrlet", color: "B", active: true},
//            {id: "ga-34756", name: "Pinot crni", color: "C", active: true, sortable: true},
//            {id: "sp-99806", name: "Graševina", color: "B", active: true},
//            {id: "wi-06506", name: "Škrlet", color: "B", active: true}
//        ];
//        this.table = new Y.DataTable({
//            columns: [
//                {key: 'name', label: "Name", width: '325px'},
//                {key: 'color', label: "Color", width: '125px'},
//                {key: 'active', label: "Active", allowHTML: true, // to avoid HTML escaping
//                    width: '125px',
//                    formatter: '<input type="checkbox" checked/>',
//                    emptyCellValue: '<input type="checkbox"/>'}
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
//        return this;
//    }
//});
//
//
//
//
