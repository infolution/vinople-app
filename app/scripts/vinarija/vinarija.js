V.Vinarija = Marionette.ItemView.extend({
    template: window.JST['/vinarija/vinarijaView.hbs']

});
V.PreradaControl = Marionette.ItemView.extend({
    template: window.JST['/vinarija/preradaControl.hbs'],
    className: 'left',
    initialize: function () {
        var model = this.model;
        var self = this;
        if (model.get('vrsta') === 'G') {
            model.set('vrsta', V.Lang['LBL_grozde']);
            if (model.get('polozaj') == null) {
                var grozdeList = new V.GrozdeList();
                grozdeList.fetch({conditions: {preradaId: self.model.get('id')},
                    success: function (fetchedList) {
                        if (fetchedList.length > 0) {
                            var grozde = fetchedList.models[0];
                            grozde.fetch({success: function (grozdeFetched) {
                                var vinograd = new V.Vinograd({id: grozdeFetched.get('vinogradId')});
                                vinograd.fetch({success: function (vinogradFetched) {
                                    self.model.set('polozaj', vinogradFetched.get('polozaj'));
                                    self.render();
                                } });
                            }})
                        }
                    }});
//                this.fetchPolozaj(grozdeList);
            }
        } else if (model.get('vrsta') === 'MO') {
            model.set('vrsta', V.Lang['LBL_most']);
        } else if (model.get('vrsta') === 'MA') {
            model.set('vrsta', V.Lang['LBL_masulj']);
        } else if (model.get('vrsta') === 'V') {
            model.set('vrsta', V.Lang['LBL_vino']);
        }
        if (model.get('sortaNaziv') == null) {
            var sorta = new V.Sorta({id: this.model.get('sortaId')});
            sorta.fetch({success: function (sortaFetched) {
                self.model.set('sortaNaziv', sortaFetched.get('naziv'));
                self.render();
            }});
        }
        if (model.get('primka') == null) {
            var primka = new V.Primka({id: this.model.get('primkaId')});
            primka.fetch({success: function (primkaFetched) {
                self.model.set('primka', primkaFetched.toJSON());
                self.render();
            }});
        }

    },
    fetchPolozaj: function (list) {
        list.fetch({conditions: {preradaId: this.model.get('id')},
            success: function (fetchedList) {
                if (fetchedList.length > 0) {
                    var grozde = fetchedList.models[0];
                    grozde.fetch({success: function (grozdeFetched) {
                        var vinograd = new V.Vinograd({id: grozdeFetched.get('vinogradId')});
                        vinograd.fetch({success: function (vinogradFetched) {
                            self.model.set('polozaj', vinogradFetched.get('polozaj'));
                            self.render();
                        } });
                    }})
                }
            }});
    },
    onRender: function () {//Ovo sam morao overrideati jer inače koristim el.hide, pa sam to morao maknuti iz ovog poziva

    }, tryRender: function () {

        this.template = this.templatereal;
        this.render();
        this.realRender = true;

    }
});
V.Ulaz = Marionette.CompositeView.extend({
    template: window.JST['/vinarija/ulazView.hbs'],
    itemView: V.PreradaControl,
    itemViewContainer: '#prerade',
    events: {
        'click .prerada-control': 'viewPreradaPanel',
        'click #noviBtn': 'viewPreradaPanel',
        'click #izvjestajPartnerBtn': 'izvjestajPartner',
        'click #izvjestajSortaBtn': 'izvjestajSorta'
    },
    initialize: function () {
        this.startDate = moment();
        this.currentDate = this.startDate;
        var preradaList = new V.PreradaList();
        preradaList.comparator = function (model) {
            return -model.get('datum');
        };
        this.collection = new V.PreradaList();
//        this.collection = preradaList;
//        this.collection.sort();

        var self = this;
        preradaList.fetch({
            success: function (list) {
//                list.sort();

                preradaList.sort();
                self.collection.add(preradaList.models);
//                self.collection.trigger('reset');
                self.fillSummary();
//                self.renderModel();
                console.log('Prerade fetched');

            }
        });
    },
    fillMonths: function () {

        var months = [];
        this.renderList = new Backbone.Collection();
        for (var i = 0; i < 6; ++i) {
            var title = this.currentDate.format('MMMM YYYY');
            var filteredPrerade = new V.PreradaList(this.preradaList.fromMonth(this.currentDate.month(), this.currentDate.year()));

//            months.push({
//                title: title,
//                content: filteredPrerade
//            });
            months.push(filteredPrerade);
            this.currentDate.subtract('months', 1);
        }
        this.renderList.set(months);
        var filteredPreradaList = new V.PreradaList(months);
//        var cronoView = new V.PreradaListView({
//            collection: filteredPreradaList
//        });
//        var render = cronoView.render().el;
//        this.$('#prerade').append(render);
        this.collection = filteredPreradaList;


    },
    onRender: function () {
//        this.$el.hide();
//        _.defer(_.bind(this.transitionIn_, this));

    },
    viewPreradaPanel: function (e) {
        var id = e.currentTarget.dataset['id'];

        document.location.hash = '#/' + V.Lang['URL_vinarija'] + '/' + V.Lang['URL_ulaz'] + '/' + V.Lang['URL_prerada'] + '/' + id + '/';
        //        this.fire('viewPrerada', {id: id});
        e.preventDefault();
    },
    izvjestajPartner: function (e) {
        document.location.hash = '#/' + V.Lang['URL_print'] + '/' + V.Lang['URL_ulaz_prema_partneru'] + '/';
        e.preventDefault();
    },
    izvjestajSorta: function (e) {
        document.location.hash = '#/' + V.Lang['URL_print'] + '/' + V.Lang['URL_ulaz_prema_sorti'] + '/';
        e.preventDefault();
    },
    fillSummary: function () {
        this.$('#brojPrimki .value').html(this.collection.length);
    }
});

V.PunjenjeControl = Marionette.ItemView.extend({
    template: window.JST['/vinarija/punjenjeControl.hbs'],
    className: 'left',
    initialize: function () {

    },
    onRender: function () {//Ovo sam morao overrideati jer inače koristim el.hide, pa sam to morao maknuti iz ovog poziva

    }
});
V.PunjenjeListView = Marionette.CollectionView.extend({
    itemView: V.PunjenjeControl,
    initialize: function () {
        //         this.collection = new V.PreradaList();

    },
    onRender: function () {

    }
});
V.PreradaPanel = Marionette.ItemView.extend({
    template: window.JST['/controls/loading.hbs'],
    templatereal: window.JST['/vinarija/preradaPanel.hbs'],
    events: {
        'click #partner .button': 'choosePartner',
        'click #vinograd .button': 'chooseVinograd',
        'click #sorta .button': 'chooseSorta',
        'submit #zaprimanjeForm': 'saveZaprimanjeEventHandler',
        'change #zaprimanjeKolicina': 'calculateCijena',
        'change #zaprimanjeCijena': 'calculateCijena'
    },
    initialize: function () {

        if (typeof this.model.get('id') !== 'undefined') {
            this.fetchData();
        } else {
            //Kreiram novi model
            var novaPrerada = this.model = new V.Prerada({datum: new Date()});
            novaPrerada.set('id', uuid.v4());
            novaPrerada.set('vrsta', 'G');
            this.stages = 1;
            this.progress = 1;
            this.tryRender();
        }

        V.App.vent.on("sorta:selected", function (data) {
            $('#modal').foundation('reveal', 'close');
            $('#sorta input').val(data.get('naziv') || '');
            $('#sorta').data('id', data.get('id'));
        });
        V.App.vent.on("partner:selected", function (data) {
            $('#modal').foundation('reveal', 'close');
            $('#partner input').val(data.get('naziv') || '');
            $('#partner').data('id', data.get('id'));
        });
        V.App.vent.on("vinograd:selected", function (data) {
            $('#modal').foundation('reveal', 'close');
            $('#vinograd input').val(data.get('polozaj') || '');
            $('#vinograd').data('id', data.get('id'));
        });
    },
    fetchData: function () {

        this.stages = 1;
        //Number of things to load
        this.progress = 0;
        //Loading progress
        var preradaId = this.model.get('id');
        var self = this;
        if (typeof preradaId !== 'undefined' && preradaId !== null) {
            var prerada = new V.Prerada({
                id: preradaId
            });
            this.model = prerada;
            this.model.fetch({
                success: function (model) {
                    console.log('Success fetch');
                    if (model.get('primka') !== null) {
                        self.progress++;
                        self.tryRender();
                    } else {
                        var primkaId = model.get('primkaId');
                        var primka = new V.Primka({id: primkaId});
                        primka.fetch({success: function (primkaModel) {
                            var primkaJson = primkaModel.toJSON();
                            model.set('primka', primkaJson);
                            self.progress++;
                            self.tryRender();
                        }});
                    }

                },
                error: function () {
                    console.log('Error fetching model');
                }
            });
        }
    },
    tryRender: function () {
        if (this.progress === this.stages) {
            this.template = this.templatereal;
            this.render();
            this.realRender = true;
        }
    },
    onRender: function () {
        var node1 = this.$('#zaprimanjeDate')[0];
        this.zaprimanjeDatePicker = new Pikaday({
            field: node1,
            format: 'DD.MM.YYYY'
        });
        if (this.realRender) {
            this.refresh();
        }

        this.$el.hide();
        _.defer(_.bind(this.transitionIn_, this));
        Foundation.init();
    },
    onShow: function () {

        Foundation.init();
    },
    refresh: function () {
        this.fillSummary();
    },
    choosePartner: function (e) {

        this.$('#modalTitle').html('Partner');
        var partnerSelector = new V.PartnerSelector();
        var render = partnerSelector.render().el;
        this.$('#modalContent').html(render);
        this.$('#modal').foundation('reveal', 'open');
        e.preventDefault();
    },
    chooseSorta: function (e) {
        this.$('#modalTitle').html('Sorta');
        var sortaSelector = new V.SortaSelector();
        var render = sortaSelector.render().el;
        this.$('#modalContent').html(render);
        this.$('#modal').foundation('reveal', 'open');
        e.preventDefault();
    },
    chooseVinograd: function (e) {
        this.$('#modalTitle').html('Vinograd');
        var selector = new V.VinogradSelector();
        var render = selector.render().el;
        this.$('#modalContent').html(render);
        this.$('#modal').foundation('reveal', 'open');
        e.preventDefault();
    },
    saveZaprimanjeEventHandler: function (e) {
        var data = $(e.currentTarget).serializeObject();
        data.vinogradId = $('#vinograd').data('id');
        data.partnerId = $('#partner').data('id');
        data.sortaId = $('#sorta').data('id');
        data.datum = this.zaprimanjeDatePicker.getMoment().valueOf();
        data.iznos = $('#zaprimanjeIznos').html();
        this.saveZaprimanje(data);

        this.fillSummary();
    },
    fillSummary: function () {
        var summary = {};
        summary.vrsta = 'Grožđe';
        summary.sorta = this.$('#sorta input').val();
        summary.partner = this.$('#partner input').val();
        summary.kolicina = this.$('#zaprimanjeKolicina').val();
        var template = window.JST['/vinarija/preradaSummary.hbs'];
        var render = template(summary);
        this.$('#summary').html(render);
    },
    saveZaprimanje: function (data, callback) {
        var self = this;
        var primka = {};

        primka.partnerId = data.partnerId;
        primka.datum = data.datum;
        primka.napomena = data.napomena;
        primka.kolicina = data.kolicinaNetto;
        primka.cijena = data.cijena;
        primka.iznos = data.iznos;
        var primkaModel;
        if (this.model.get('primkaId') !== null) {
            primka.id = this.model.get('primkaId');
        } else {
            primka.id = uuid.v4();
        }
        primkaModel = new V.Primka(primka);
        primkaModel.save();

        var prerada = {};
        if (this.model.get('id') !== null) {
            prerada.id = this.model.get('id');
        } else {
            prerada.id = uuid.v4();
        }
        prerada.broj = data.broj;
        prerada.datum = data.datum;
        prerada.primkaId = primkaModel.get('id');
        prerada.sortaId = data.sortaId;
        var preradaModel;
        if (this.model !== null) {
            preradaModel = this.model;
            preradaModel.set(prerada);
        } else {
            preradaModel = new V.Prerada(prerada);
        }
        if (preradaModel !== null) {
            preradaModel.save();
        }
        //        var primka = JSON.stringify(formArray);
        var grupaId, grupaSystem;  //Ovisno o tome koja grupa taj ću system value dohvaćat i pokrenut daljnji postupak spremanja primke

        if (data.vrsta === 'G') {
            grupaSystem = new V.System({key: 'GRUPA_GROZDE'});
        } else if (data.vrsta === 'MO') {
            grupaSystem = new V.System({key: 'GRUPA_MOST'});

        } else if (data.vrsta === 'MA') {
            grupaSystem = new V.System({key: 'GRUPA_MASULJ'});

        } else if (data.vrsta === 'V') {
            grupaSystem = new V.System({key: 'GRUPA_VINO'});

        }

        grupaSystem.fetch({success: function (model) {
            //Pronađena grupa
            grupaId = grupaSystem.get('value');
            //Treba mi naziv sorte
            var sorta = new V.Sorta({id: data.sortaId});
            sorta.fetch({success: function (sortaFetched) {
                //Tražim artikl tog naziva sorte i godine
                data.sorta = sortaFetched.toJSON();
                //Sada tražim artikl
                var artiklList = new V.ArtiklList();
                artiklList.fetch({conditions: {grupaId: grupaId}, success: function (artiklListFetched) {
                    var artikl = self.findArtikl(artiklListFetched, grupaId, data);
                    var stavka = {};
                    stavka.primkaId = primkaModel.get('id');
                    stavka.grupaId = grupaId;
                    stavka.artikl = artikl.toJSON();
                    stavka.kolicina = data.kolicinaNetto;
                    stavka.cijena = data.cijena;
                    stavka.iznos = data.iznos;
                    var stavke = [];
                    stavke[0] = stavka;
                    primkaModel.set('stavke', stavke);
                    primkaModel.save();

                    if (data.vrsta === 'G') {
                        var grozde = new V.Grozde({godinaBerbe: data.godinaBerbe,
                            preradaId: prerada.id,
                            sortaId: data.sortaId,
                            vinogradId: data.vinogradId,
                            primkaId: primka.id});
                        grozde.save();
                    } else if (data.vrsta === 'MO') {
                        var most = new V.Most({godinaBerbe: data.godinaBerbe,
                            preradaId: preradaModel.get('id'),
                            sortaId: data.sortaId,
                            vinogradId: data.vinogradId,
                            primkaId: primkaModel.get('id')});
                        most.save();

                    } else if (data.vrsta === 'MA') {
                        var masulj = new V.Masulj({godinaBerbe: data.godinaBerbe,
                            preradaId: preradaModel.get('id'),
                            sortaId: data.sortaId,
                            vinogradId: data.vinogradId,
                            primkaId: primkaModel.get('id')});
                        masulj.save();

                    } else if (data.vrsta === 'V') {
                        var vino = new V.Vino({godinaBerbe: data.godinaBerbe,
                            preradaId: preradaModel.get('id'),
                            sortaId: data.sortaId,
                            vinogradId: data.vinogradId,
                            primkaId: primkaModel.get('id')});
                        vino.save();

                    }
                    callback();

                }, error: function (model, error) {
                    console.log('Error fetching artikle za grupu: ', error);

                }});
            }, error: function (model, error) {
                console.log('Error fetching sorta: ', error);

            }});


        }, error: function (model, error) {
            console.log('Error fetching grupaGrozde: ', error);

        }});

    },
    findArtikl: function (artiklListFetched, grupaId, data) {
        //Tražim artikl tog naziva sorte i godine
        var nazivSaGodinom = data.sorta.naziv + ' ' + data.godinaBerbe;
        var postojeciArtikl = null;
        for (var i = 0, j = artiklListFetched.length; i < j; ++i) {
            var a = artiklListFetched.models[i];
            if (a.get('naziv') === nazivSaGodinom) {
                postojeciArtikl = a;
            }
        }
        //Provjeravamo da li smo uspjeli naći artikl i ako nismo kreiramo novi
        if (!postojeciArtikl) {
            var noviArtikl = new V.Artikl({grupaId: grupaId, naziv: nazivSaGodinom,
                jm: data.jm });
            noviArtikl.save();
            postojeciArtikl = noviArtikl;
        }
        return postojeciArtikl;

    },
    calculateCijena: function (e) {
        var kolicina = this.$('#zaprimanjeKolicina').val();
        var cijena = this.$('#zaprimanjeCijena').val();
        var iznos = kolicina * cijena;
        this.$('#zaprimanjeIznos').html(iznos);
    }
});

V.Vina = Marionette.ItemView.extend({
    template: window.JST['/controls/loading.hbs'],
    templatereal: window.JST['/vinarija/vinaView.hbs'],
    events: {
        'click .posuda-control': 'viewVinoPanel'
    },
    initialize: function () {
        this.model = new Backbone.Model();
        var self = this;
        var stanjeList = new V.StanjeList();
        var posudaList = this.posudaList = new V.PosudaList();
        this.sortaList = new V.SortaList();
        this.sortaList.comparator = function (model) {
            return model.get('naziv');
        };
        this.sortaList.fetch({success: function (sortaList) {
            stanjeList.fetch({
                conditions: {
                    vrsta: self.options.vrsta
                },
                success: function (list) {
//                //            alert('fetched stanje');
//                self.stages = 1;
//                self.progress = 0;
//                for (var i = 0, j = list.length; i < j; ++i) {
//                    var stanje = list.models[i];
//
//                    if (stanje.get('sortaId') !== null) {
//                        var sorta = new V.Sorta({
//                            id: stanje.get('sortaId')
//                        });
//                        //                    sorta.set('title', sorta.get('id'));
//                        if (!self.sortaList.contains(sorta)) {
//                            sorta.set('content', []);
//                            sorta.set('posude', {});
//                            self.sortaList.add(sorta);
//
//                        }
//
//                        var posuda = new V.Posuda({
//                            id: stanje.get('posudaId')
//                        });
//                        var sortaFromList = self.sortaList.get(sorta.id);
//                        var posude = sortaFromList.get('posude');
//                        if (typeof posude[posuda.get('id')] !== 'undefined') {
//                            if (posude[posuda.get('id')].get('datum') < stanje.get('datum')) {
//                                posuda.set('datum', stanje.get('datum'));
//                                posuda.set('stanje', stanje.get('stanje'));
//                                posuda.set('vrsta', self.options.vrsta);
//                                posude[posuda.get('id')] = posuda;
//
//                            }
//                        } else {
//                            posuda.set('datum', stanje.get('datum'));
//                            posuda.set('stanje', stanje.get('stanje'));
//                            posuda.set('vrsta', self.options.vrsta);
//                            posude[posuda.get('id')] = posuda;
//                        }
//                    }
//
//                }
//                self.fetchSorta();
                    var promises = [];
                    for (var i = 0, j = list.length; i < j; ++i) {
                        var stanje = list.models[i];
                        if (stanje.get('sortaId') !== null && stanje.get('stanje') > 0) {
                            var posuda = new V.Posuda({
                                id: stanje.get('posudaId')
                            });
                            var sorta = sortaList.get(stanje.get('sortaId'));
                            if (!self.posudaList.contains(posuda)) {
                                posuda.set('datum', stanje.get('datum'));
                                posuda.set('stanje', stanje.get('stanje'));
                                posuda.set('vrsta', self.options.vrsta);
                                posuda.set('sortaId', stanje.get('sortaId'));

                                posuda.set('sortaNaziv', sorta.get('naziv'));
                                if (sorta.get('vrsta') === 'B') {
                                    posuda.set('boja', 'white');
                                } else if (sorta.get('vrsta') === 'C') {
                                    posuda.set('boja', 'red');
                                } else {
                                    posuda.set('boja', 'white');
                                }
                                var promise = self.fetchData(posuda);

                                promises.push(promise);
                                posudaList.add(posuda);
                            } else {
                                if (posudaList.get(posuda).get('datum') < stanje.get('datum')) {
                                    var staraPosuda = posudaList.get(posuda);
                                    staraPosuda.set('datum', stanje.get('datum'));
                                    staraPosuda.set('stanje', stanje.get('stanje'));
                                    staraPosuda.set('vrsta', self.options.vrsta);
                                    staraPosuda.set('sortaId', stanje.get('sortaId'));
                                    staraPosuda.set('sortaNaziv', sorta.get('naziv'));
                                    if (sorta.get('vrsta') === 'B') {
                                        staraPosuda.set('boja', 'white');
                                    } else if (sorta.get('vrsta') === 'C') {
                                        staraPosuda.set('boja', 'red');
                                    } else {
                                        staraPosuda.set('boja', 'white');
                                    }
                                }
                            }

                        }
                    }
                    Q.all(promises).then(function () {
                        self.tryRender();
                    });

                },
                error: function (list, error) {
                    console.log('error fetching stanje: ' + error);
                }
            });
        }
        });

    },
    viewVinoPanel: function (e) {
        var id = e.currentTarget.dataset['id'];
        var oldUrl = document.location.hash
        document.location.hash = oldUrl + V.Lang['URL_posuda'] + '/' + id + '/';
        e.preventDefault();
    },
    fetchData: function (posuda) {

        var deferred = Q.defer();
        posuda.fetch({success: function (model) {
            deferred.resolve(model);
        }});
        return deferred.promise;
    },
    tryRender: function () {
        this.template = this.templatereal;
        this.render();
        var posude = this.posudaList.toJSON();
        this.d3vina(posude);
    },
    d3vina: function (posudaList) {
        var nestedList = d3.nest()
            .key(function (d) {
                return d.sortaNaziv
            })
            .sortKeys(d3.ascending)
            .entries(posudaList);
        var canvasWidth = window.innerWidth, canvasHeight = 400, canvasPadding = 20, margin = 10;
        var canvas = d3.select(this.el).select("#container").append("svg")
            .attr("width", canvasWidth).attr("height", canvasHeight);


        //Moram procijeniti koliko ih ide u red
        var posudaURed = Math.floor(canvasWidth / (200 + margin));
        var posudaCounter = 0, sortaCounter = 0;
        var red = 0, stupac = 0;
        var posudaControl = new PosudaControl();
        //Prvo moram postaviti upisivanje sorti
        canvas.selectAll("g").data(nestedList)
            .enter().append("g")
            .attr("transform", function (d, i) {
                return "translate(" + canvasPadding + "," + sortaCounter++ * (300 + margin) + ")";
            })
            .call(function (sortaContainer) {
                sortaContainer.append("text")
                    .text(function (d) {
                        return d.key;
                    })
                    .attr('x', 0)
                    .attr('y', 30);
                var posudaContainer = sortaContainer.append("g")
                    .attr("transform", function (d, i) {
                        return "translate(0, 40)";
                    });
                posudaCounter = 0;
                red = 0;
                stupac = 0;
                posudaContainer.selectAll("g").data(function (d) {
                    //Proračunaj height za svaku sortacontainer
                    var brojPosuda = d.values.length;
                    var brojRedova = Math.ceil(brojPosuda / posudaURed);

                    canvasHeight += brojRedova * (250 + margin);
                    canvas.attr("height", canvasHeight);
                    return d.values;
                })
                    .enter().append("g")
                    .attr("data-id", function (d) {
                        return d.id
                    })
                    .attr("class", "posuda-control")
                    .attr("transform", function (d, i) {
                        posudaCounter++;
                        stupac = i;
                        if (stupac >= posudaURed) {
                            red++;
                            stupac = 0;
                            posudaCounter = 0;
                        }
                        return "translate(" + stupac++ * (200 + margin) + "," + red * (250 + margin) + ")";

                    })
                    .call(posudaControl);

            });
    }

});

V.Punjenje = Marionette.ItemView.extend({
    template: window.JST['/controls/loading.hbs'],
    templatereal: window.JST['/vinarija/punjenje.hbs'],
    events: {
        'click .prerada-control': 'viewPunjenjePanel',
        'click #noviBtn': 'viewPunjenjePanel'
    },
    initialize: function () {
        this.startDate = moment();
        this.currentDate = this.startDate;
        var lotList = this.lotList = new V.LotList();
        var self = this;
        lotList.fetch({
            success: function () {
                self.fillMonths();
            }
        });
    },
    fillMonths: function () {

        var months = [];
        var self = this;
        this.renderList = new Backbone.Collection();
        for (var i = 0; i < 6; ++i) {
            var title = this.currentDate.format('MMMM YYYY');
            var filteredPunjenje = new V.LotList(this.lotList.fromMonth(this.currentDate.month(), this.currentDate.year()));
            this.fillData(filteredPunjenje, function () {
                var punjenjeListView = new V.PunjenjeListView({
                    collection: filteredPunjenje
                });
                var render = punjenjeListView.render().el;
                months.push({
                    title: title,
                    content: render.innerHTML
                });
                self.currentDate.subtract('months', 1);
                if (i === 5) {
                    self.renderList.set(months);
                    self.tryRender();
                }
            });

        }


    },
    fillData: function (list, callback) {
        if (list.length === 0) {
            callback();
        } else {
            for (var i = 0, j = list.length; i < j; ++i) {
                var model = list.models[i];
                this.updateModel(model);
            }
            callback();
        }


    },
    updateModel: function (model) {
        if (model.get('stavke').length > 0) {
            var artiklId = model.get('stavke')[0].stavkaId;
            var artikl = new V.Artikl({id: artiklId});
            artikl.fetch({success: function (artiklModel) {
                model.set('naziv', artiklModel.get('naziv'));
                model.save();
            }});
        }
    },
    tryRender: function () {

        this.template = this.templatereal;
        this.realRender = true;
        this.render();
        var cronoView = new V.CronoView({
            collection: this.renderList
        });
        var render = cronoView.render().el;
        this.$('#punjenje').append(render);


    },
    viewPunjenjePanel: function (e) {
        var id = e.currentTarget.dataset['id'];

        document.location.hash = '#/' + V.Lang['URL_vinarija'] + '/' + V.Lang['URL_punjenje'] + '/' + id + '/';
        //        this.fire('viewPrerada', {id: id});
        e.preventDefault();
    }
});
V.PunjenjePanel = Marionette.ItemView.extend({
    template: window.JST['/controls/loading.hbs'],
    templatereal: window.JST['/vinarija/punjenjePanel.hbs'],
    initialize: function () {
        this.tryRender();
    },
    tryRender: function () {

        this.template = this.templatereal;
        this.realRender = true;
        this.render();


    },
    onRender: function () {
        this.$el.hide();
        _.defer(_.bind(this.transitionIn_, this));
        if (this.realRender) {
            Foundation.init();
        }
    },
    onShow: function () {
        Foundation.init();
    }
});
V.VinoPanel = Marionette.ItemView.extend({
    template: window.JST['/controls/loading.hbs'],
    templatereal: window.JST['/vinarija/vinoPanel.hbs'],
    events: {
        'click .prerada-control': 'viewNalog'
    },
    initialize: function () {
        var self = this;

        this.model.fetch({success: function (model) {
            var stanjeList = new V.StanjeList();
            stanjeList.fetch({conditions: {posudaId: model.get('id')},
                success: function (list) {
                    var stanje;
                    var maxStanje = self.stanje || new V.Stanje();
                    for (var i = 0, j = list.length; i < j; ++i) {
                        stanje = list.models[i];

                        if (stanje.get('datum') > maxStanje.get('datum')) {
                            maxStanje = stanje;
                        }

                    }
                    self.stanje = maxStanje;
                    self.model.set('stanje', maxStanje.get('stanje'));
                    self.model.set('vrsta', maxStanje.get('vrsta'));
                    var sorta = new V.Sorta({id: self.stanje.get('sortaId')});
                    sorta.fetch({success: function (sortaModel) {
                        self.model.set('sorta', sortaModel.toJSON());
                        self.tryRender();
                    }});

                }});


        }
        });
    },
    tryRender: function () {

        this.template = this.templatereal;
        this.realRender = true;
        this.render();


    },
    onRender: function () {
        var self = this;
        if (this.realRender) {
            var posudaControl = new V.PosudaControl({model: this.model}).render().el;
            this.$('#posuda-placer').html(posudaControl);

            //Moram dohvatiti naloge od svih faza vino mošt masulj grožđe
            var vrsta = this.model.get('vrsta');
            var vinoNalozi, mostNalozi, masuljNalozi, primke;
            switch (vrsta) {
                case 'V':
                    this.processVinoNalog('V', this.stanje.get('vrstaId'), 'nalogContainer');
                    break;

                case 'MO':
                    this.processMostNalog('MO', this.stanje.get('vrstaId'), 'nalogContainer');
                    break;
                case 'MA':
                    this.processMasuljNalog('MA', this.stanje.get('vrstaId'), 'nalogContainer');
                    break;

            }

            Foundation.init();

        }
    },
    processVinoNalog: function (vrsta, vrstaId, containerId) {
        var self = this;
        var nalogList = new V.NalogList();
        nalogList.fetch({conditions: {vrstaId: vrstaId},

            success: function (list) {
                //Dohvaćam naloge od prve vrste
                var nalogVrsta = new V.NalogVrsta({model: new Backbone.Model({vrsta: vrsta}), collection: nalogList});
                self.$('#' + containerId).append(nalogVrsta.render().el);
                //Tražim da li je to vino nastalo od mošta
                var vino = new V.Vino({id: vrstaId}).fetch({success: function (vinoModel) {
                    var mostId = vinoModel.get('mostId');

                    if (mostId) {
                        self.processMostNalog('MO', mostId, containerId);
                    }
                    //Provjeravam za combo
                    if (typeof vinoModel.get('combos') !== 'undefined' && vinoModel.get('combos').length > 0) {
                        for (var i = 0, j = vinoModel.get('combos').length; i < j; ++i) {
                            var comboVino = vinoModel.get('combos')[i];
                            comboVino.currentColor = i;
                            self.processCombo('V', comboVino, containerId);
                        }
                    }
                },
                    error: function (model, error) {
                        console.log('Error fetching vino: ' + error);
                    }
                });
            }
        });
    },
    processCombo: function (vrsta, combo, containerId) {
        var comboModel = new Backbone.Model(combo);
        var comboContainer = new V.ComboContainer({model: comboModel});
        self.$('#' + containerId).append(comboContainer.render().el);
        switch (vrsta) {
            case 'V':
                this.processVinoNalog('V', comboModel.get('parentId'), comboModel.get('id'));
                break;

            case 'MO':
                this.processMostNalog('MO', comboModel.get('parentId'), comboModel.get('id'));
                break;
            case 'MA':
                this.processMasuljNalog('MA', comboModel.get('parentId'), comboModel.get('id'));
                break;

        }
//        this.renderCombo('V', comboModel.get('parentId'), comboModel.get('id'));
    },
    processMostNalog: function (vrsta, vrstaId, containerId) {

        var nalogList = new V.NalogList();
        nalogList.fetch({conditions: {vrstaId: vrstaId},

            success: function (list) {
                //Dohvaćam naloge od prve vrste
                var nalogVrsta = new V.NalogVrsta({model: new Backbone.Model({vrsta: vrsta}), collection: nalogList});
                self.$('#' + containerId).append(nalogVrsta.render().el);
                //Tražim da li je to vino nastalo od mošta
                var vino = new V.Most({id: vrstaId}).fetch({success: function (mostModel) {

                }
                });
            }
        });
    },
    processMasuljNalog: function (vrsta, vrstaId, containerId) {

        var nalogList = new V.NalogList();
        nalogList.fetch({conditions: {vrstaId: vrstaId},

            success: function (list) {
                //Dohvaćam naloge od prve vrste
                var nalogVrsta = new V.NalogVrsta({model: new Backbone.Model({vrsta: vrsta}), collection: nalogList});
                self.$('#' + containerId).append(nalogVrsta.render().el);
                //Tražim da li je to vino nastalo od mošta
                var vino = new V.Most({id: vrstaId}).fetch({success: function (mostModel) {

                }
                });
            }
        });
    },
    viewNalog: function (e) {
        var id = e.currentTarget.dataset['id'];
        this.$('#modalTitle').html('Nalog');
        var nalog = new V.Nalog({id: id});
        var nalogDialog = new V.NalogDialog({model: nalog});
        var render = nalogDialog.render().el;
        this.$('#modalContent').html(render);
        this.$('#modal').foundation('reveal', 'open');
        e.preventDefault();
    },
    renderCombo: function (vrsta, vrstaId, containerId) {
        var self = this;
        var nalogList = new V.NalogList();
        nalogList.fetch({conditions: {vrstaId: vrstaId},

            success: function (list) {
                //Dohvaćam naloge od prve vrste
                var nalogVrsta = new V.NalogVrsta({model: new Backbone.Model({vrsta: vrsta}), collection: nalogList});
                self.$('#' + containerId).append(nalogVrsta.render().el);
                //Tražim da li je to vino nastalo od mošta
                var vino = new V.Vino({id: vrstaId}).fetch({success: function (vinoModel) {
                    var mostId = vinoModel.get('mostId');

                    if (mostId) {
                        self.processMostNalog('MO', mostId, containerId);
                    }
                    //Provjeravam za combo
//                    if (typeof vinoModel.get('combos') !== 'undefined' && vinoModel.get('combos').length > 0) {
//                        for (var i = 0, j = vinoModel.get('combos').length; i < j; ++i) {
//                            var comboVino = vinoModel.get('combos')[i];
//                            comboVino.currentColor = i;
//                            self.processCombo('V', comboVino);
//                        }
//                    }
                },
                    error: function (model, error) {
                        console.log('Error fetching vino: ' + error);
                    }
                });
            }
        });
    },
    onShow: function () {
        Foundation.init();
    }
});
V.ComboContainer = Marionette.ItemView.extend({
    template: window.JST['/vinarija/comboContainer.hbs'],
    colors: ["#C9DBD1", "#D7D7E8", "#CED7E8", "#E8C6C6", "#ECECA8", "#ECCAA8", "#BDCEE8", "#DBECA8", "#DBA8A8", "#CECED7"],
    initialize: function () {
        var color = this.getNextColor(this.model.get('currentColor'));
        this.model.set('color', color);
    },
    onRender: function () {


    },

    getNextColor: function (currentColor) {
        return this.colors[currentColor];   //Dohvaća sljedeću boju i povećava index
    }
});
//Y.Ulaz = Y.Base.create('Ulaz', Y.View, [], {
//    template: 'ulazView',
//    resources: Y.Intl.get("vinarija"),
//    events: {
//        '.prerada-control': {click: 'viewPreradaPanel'},
//        '#noviBtn': {click: 'viewPreradaPanel'}
//    },
//    initializer: function() {
//        var preradaList = new Y.PreradaList();
//
//        this.set('model', preradaList);
//        var self = this;
//        preradaList.on('load', function(e) {
//            self.cronoView = new Y.CronoView({model: self.get('model')});
//            var container = self.get('container').one('#prerade');
//            var control = self.cronoView.render().get('container');
//            container.setHTML(control);
//        });
//
//
//    },
//    render: function() {
////        var kategorijaList = this.get('model');
////        var kategorijaData = kategorijaList.toJSON();
//        var template = Handlebars.templates[this.template];
//        var container = this.get('container');
//        container.setHTML(template(this.resources));
//        this.get('model').load();
//        this.get('container').one('#prerade').setHTML('<p><img src="/images/ajax-loader.gif" alt="ajax-loader" /> Loading...</p>');
////        var control = this.preradaControl.render().get('container');
////        container.append(control);
//
//
//        return this;
//    },
//    viewPreradaPanel: function(e) {
//        var id = e.currentTarget.getData('id');
//        this.fire('viewPrerada', {id: id});
//        e.stopPropagation();
//    }
//
//
//}, {
//    // Specify attributes and static properties for your View here.
//
////    ATTRS: {
//    // Override the default container attribute.
////        container: {
////            valueFn: function() {
////                return Y.Node.create('<div />');
////            }
////        }
////    }
//});
//
//Y.Vina = Y.Base.create('Vina', Y.View, [], {
//    template: 'vinaView',
//    resources: Y.Intl.get("vinarija"),
//    events: {
//        '.posuda-control': {click: 'viewVinoPanel'}
//    },
//    initializer: function() {
//        var vrsta = this.get('vrsta');
//        items = [];
//        if (vrsta === 'V') {
//            items = JSON.parse(window.localStorage["Vino"]);
//        } else if (vrsta === 'MO') {
//            items = JSON.parse(window.localStorage["Most"]);
//        } else if (vrsta === 'MA') {
//            items = JSON.parse(window.localStorage["Masulj"]);
//        } else if (vrsta === 'G') {
//            items = JSON.parse(window.localStorage["Grozde"]);
//        }
//        var vinaList = new Y.PosudaList({
//            items: items
//        });
//        var json = vinaList.toJSON();
//        this.set('model', vinaList);
//        this.sortaView = new Y.SortaView({model: this.get('model'), vrsta: vrsta});
//        this.publish('viewVino', {preventable: false});
////        var vrsta = this.get('vrsta');
//
//    },
//    render: function() {
//        var template = Handlebars.templates[this.template];
//        var container = this.get('container');
//        var vrsta = this.get('vrsta');
//        var context = {};
//        switch (vrsta) {
//            case 'V':
//                context.vrsta = this.resources.LBL_vino;
//                break;
//            case 'MO':
//                context.vrsta = this.resources.LBL_most;
//                break;
//            case 'MA':
//                context.vrsta = this.resources.LBL_masulj;
//                break;
//            case 'G':
//                context.vrsta = this.resources.LBL_grozde;
//                break;
//        }
//        mergeInto(context, this.resources);
//        container.setHTML(template(context));
////        var control = this.preradaControl.render().get('container');
////        container.append(control);
//        control = this.sortaView.render().get('container');
//        container.append(control);
//
//        return this;
//    },
//    viewVinoPanel: function(e) {
//        var id = e.currentTarget.getData('id');
//        this.fire('viewVino', {id: id});
//        e.stopPropagation();
//    }
//}, {
//    ATTRS: {
//        vrsta: {}
//    }
//});
//
//Y.PreradaControl = Y.Base.create('PreradaControl', Y.View, [], {
//    template: 'preradaControl',
//    initializer: function() {
//
//    },
//    render: function() {
//        var posudaId = this.get('posudaId');
//        var template = Handlebars.templates['preradaControl'];
//
//        this.get('container').setHTML(template(this.get('model').toJSON()));
//
//        return this;
//    }
//});
//
//Y.VinoPanel = Y.Base.create('VinoPanel', Y.View, [], {
//    template: 'vinoPanel',
//    resources: Y.Intl.get("vinarija"),
//    initializer: function() {
////        this.sortaView = new Y.SortaView({model: this.get('model'), vrsta: this.get('vrsta')});
////        var vrsta = this.get('vrsta');
//
//    },
//    render: function() {
//        var context = {};
//        context.posudaId = this.get('posudaId');
//        mergeInto(context, this.resources);
//        var template = Handlebars.templates[this.template];
//        var container = this.get('container');
//        container.setHTML(template(context));
////        var control = this.preradaControl.render().get('container');
////        container.append(control);
////        control = this.sortaView.render().get('container');
////        container.append(control);
//        return this;
//    }
//}, {
//    ATTRS: {
//        posudaId: {}
//    }
//});
//
//Y.PreradaPanel = Y.Base.create('PreradaPanel', Y.View, [], {
//    template: 'preradaPanel',
//    resources: Y.Intl.get("vinarija"),
//    initializer: function() {
////        this.sortaView = new Y.SortaView({model: this.get('model'), vrsta: this.get('vrsta')});
////        var vrsta = this.get('vrsta');
//
//    },
//    render: function() {
//        var context = {};
//        context.preradaId = this.get('preradaId');
//        mergeInto(context, this.resources);
//        var template = Handlebars.templates[this.template];
//        var container = this.get('container');
//        container.setHTML(template(context));
//        var node1 = container.one('#zaprimanjeDate').getDOMNode();
//        var picker1 = new Pikaday({field: node1,
//            format: 'DD.MM.YYYY'
//        });
////        var control = this.preradaControl.render().get('container');
////        container.append(control);
////        control = this.sortaView.render().get('container');
////        container.append(control);
//        return this;
//    }
//}, {
//    ATTRS: {
//        preradaId: {}
//    }
//});
//
//Y.Pretok = Y.Base.create('Pretok', Y.View, [], {
//    template: 'pretok',
//    resources: Y.Intl.get("vinarija"),
//    initializer: function() {
////        this.sortaView = new Y.SortaView({model: this.get('model'), vrsta: this.get('vrsta')});
////        var vrsta = this.get('vrsta');
//
//    },
//    render: function() {
//        var context = {};
//
////        mergeInto(context, this.resources);
//        var template = Handlebars.templates[this.template];
//        var container = this.get('container');
//        container.setHTML(template(context));
////        var control = this.preradaControl.render().get('container');
////        container.append(control);
////        control = this.sortaView.render().get('container');
////        container.append(control);
//        return this;
//    }
//}, {
//    ATTRS: {
//    }
//});

