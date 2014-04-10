'use strict';
//V - Vinople
var V = V || {};
V.VinopleSchema = {
    "version": "16",
    "datastore": "Vinople",
    "objectstores": [
        {"storename": "Artikl", "keys": [
            {"keyname": "grupaId", "unique": false},
            {"keyname": "proizvodId", "unique": false},
            {"keyname": "proizvodacId", "unique": false},
            {"keyname": "sifra", "unique": true},
        ]},
        {"storename": "ArtiklStanje", "keys": [
            {"keyname": "artiklId", "unique": false},
            {"keyname": "sekcijaId", "unique": false}
        ]},
//        {"storename": "Doziranje"},
//        {"storename": "Dozvola"},
        {"storename": "Grozde", "keys": [
            {"keyname": "vinogradId", "unique": false},
            {"keyname": "sortaId", "unique": false},
            {"keyname": "preradaId", "unique": false},
            {"keyname": "godina", "unique": false}
        ]},
//        {"storename": "GrozdeCombo"},
        {"storename": "Grupa", "keys": [
            {"keyname": "parent", "unique": false}
        ]},
        {"storename": "Izdatnica"},
        {"storename": "Kakvoca"},
        {"storename": "LoginUser"},
        {"storename": "Lokacija"},
        {"storename": "Lot"},
        {"storename": "LotRepromaterijal"},
//        {"storename": "LotSljedivost"},
//        {"storename": "LotStavka"},
        {"storename": "Masulj"},
//        {"storename": "MasuljCombo"},
        {"storename": "Most"},
//        {"storename": "MostCombo"},
        {"storename": "Nalog", "keys": [
            {"keyname": "vrstaId", "unique": false},
            {"keyname": "vrsta", "unique": false}
        ]},
        {"storename": "Parametar"},
        {"storename": "Partner"},
//        {"storename": "Plan"},
//        {"storename": "PlanLicense"},
        {"storename": "Posuda"},
        {"storename": "PosudaSekcija"},
//        {"storename": "PovratStavka"},
        {"storename": "Povratnica"},
        {"storename": "Prerada"},
//        {"storename": "PreradaNalog"},
//        {"storename": "PrimjenaSredstvo"},
        {"storename": "Primka"},
//        {"storename": "PrimkaStavka"},
        {"storename": "Proizvod"},
        {"storename": "Proizvodac"},
        {"storename": "Radnja"},
        {"storename": "Sekcija"},
        {"storename": "Sorta"},
//        {"storename": "SortaVinograd"},
        {"storename": "Sredstvo"},
        {"storename": "Stanje", "keys": [
            {"keyname": "posudaId", "unique": false},
            {"keyname": "vrstaId", "unique": false},
            {"keyname": "vrsta", "unique": false}
        ]},
//        {"storename": "Stavka"},
//        {"storename": "Stopa"},
        {"storename": "System", "keys": [
            {"keyname": "key", "unique": "true"}
        ]},
        {"storename": "Trosak"},
//        {"storename": "Uloga"},
//        {"storename": "UlogaDozvola"},
        {"storename": "Client"},
//        {"storename": "UserPlan"},
        {"storename": "Vino"},
//        {"storename": "VinoCombo"},
        {"storename": "Vinograd"},
//        {"storename": "Vrsta"}
    ]
};

var database = {
    id: V.VinopleSchema.datastore,
    description: "The database for the Vinople application",
    migrations: [
        {
            version: 1,
            migrate: function (transaction, next) {
                var objectstores = V.VinopleSchema.objectstores;
                for (var i = 0, j = objectstores.length; i < j; ++i) {
                    var storename = objectstores[i].storename;

                    var store = transaction.db.createObjectStore(storename, {
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

                next();
            }
        },
        {
            version: 16,
            migrate: function (transaction, next) {
                var store = undefined;
                var objectstores = V.VinopleSchema.objectstores;
                for (var i = 0, j = objectstores.length; i < j; ++i) {
                    var storename = objectstores[i].storename;
                    if (transaction.db.objectStoreNames.contains(storename)) {
                        transaction.db.deleteObjectStore(storename);
                    }

                    store = transaction.db.createObjectStore(storename, {
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
                    store.createIndex('syncstatus', 'syncstatus', {unique: false});
                    store.createIndex('clientid', 'clientid', {unique: false});
                    store.createIndex('isdeleted', 'isdeleted', {unique: false});
                    store.createIndex('lastmodified', 'lastmodified', {unique: false});


                }

                next();
            }
        }
    ]
};
V.Artikl = Backbone.Model.extend({
    storeName: 'Artikl',
    database: database,
    url: 'artikl',
    defaults: {
        sifra: null,
        naziv: null,
        proizvodac: null,
        grupaId: null,
        proizvodacId: null,
        jm: null,
        napomena: null,
        stanje: null,
        proizvodId: null,
        godina: null,
        kapacitet: null,
        pakiranje: null,
        userId: null,
        lokacijaStanjeMap: null
    }
});
V.ArtiklList = Backbone.Collection.extend({
    model: V.Artikl,
    url: 'artikl',
    storeName: 'Artikl',
    database: database,
    enoloskaSredstva: function (filteredList, stanje) {
        var self = this;
        var deferred = Q.defer();
        this.fetch({success: function (list) {
            for (var i = 0, j = list.length; i < j; ++i) {
                var artikl = list.models[i];
                self.filterByGrupa(filteredList, artikl, 'E');
                if (stanje) {
                    var stanjeSuccess = function (artikl) {
                        console.log('Updated artikl with stanje: ' + artikl.get('id'));
                    };
                    self.fetchStanje(artikl, stanjeSuccess);
                }

            }
            deferred.resolve(filteredList);
        }});
        return deferred.promise;
    },
    repromaterijal: function (filteredList, stanje) {
        var self = this;
        var deferred = Q.defer();
        this.fetch({success: function (list) {
            for (var i = 0, j = list.length; i < j; ++i) {
                var artikl = list.models[i];
                self.filterByGrupa(filteredList, artikl, 'R');
                if (stanje) {
                    var stanjeSuccess = function (artikl) {
                        console.log('Updated artikl with stanje: ' + artikl.get('id'));
                    };
                    self.fetchStanje(artikl, stanjeSuccess);
                }

            }
            deferred.resolve(filteredList);
        }});
        return deferred.promise;
    },
    gotoviProizvod: function (filteredList, callback, stanje) {
        var self = this;
        var deferred = Q.defer();
        this.fetch({success: function (list) {
            for (var i = 0, j = list.length; i < j; ++i) {
                var artikl = list.models[i];
                self.filterByGrupa(filteredList, artikl, 'G');
                if (stanje) {
                    var stanjeSuccess = function (artikl) {
                        console.log('Updated artikl with stanje: ' + artikl.get('id'));
                    };
                    self.fetchStanje(artikl, stanjeSuccess);
                }

            }
            deferred.resolve(filteredList);
        }});
        return deferred.promise;
    },
    sirovina: function (filteredList, callback, stanje) {
        var self = this;
        var deferred = Q.defer();
        this.fetch({success: function (list) {
            for (var i = 0, j = list.length; i < j; ++i) {
                var artikl = list.models[i];
                self.filterByGrupa(filteredList, artikl, 'S');
                if (stanje) {
                    var stanjeSuccess = function (artikl) {
                        console.log('Updated artikl with stanje: ' + artikl.get('id'));
                    };
                    self.fetchStanje(artikl, stanjeSuccess);
                }
            }
            deferred.resolve(filteredList);
        }});
        return deferred.promise;
    },
    filterByGrupa: function (list, artikl, oznaka) {
        var grupa = new V.Grupa({id: artikl.get('grupaId')});
        grupa.fetch({success: function (fetchedGrupa) {
            var rootGrupaSuccess = function (rootGrupa) {
                if (rootGrupa.get('shortName') === oznaka) {
                    list.add(artikl);
                }
            };
            fetchedGrupa.findRootGrupa(rootGrupaSuccess);
        }});
    },
    fetchStanje: function (artikl, callback) {
        var artiklStanjeList = new V.ArtiklStanjeList();
        artiklStanjeList.fetch({conditions: {artiklId: artikl.get('id')},
            success: function (list) {
                var stanje;
                var maxStanje = self.stanje || new V.ArtiklStanje();
                for (var i = 0, j = list.length; i < j; ++i) {
                    stanje = list.models[i];

                    if (stanje.get('datum') > maxStanje.get('datum')) {
                        maxStanje = stanje;
                    }

                }
                stanje = maxStanje;
                artikl.set('stanje', stanje.get('stanje'));
                callback(artikl);

            }});
    }


});
V.ArtiklStanje = Backbone.Model.extend({
    storeName: 'ArtiklStanje',
    database: database,
    url: 'artiklstanje',
    defaults: {
        artiklId: null,
        kolicina: null,
        stanje: null,
        primkaId: null,
        nalogId: null,
        izdatnicaId: null,
        povratnicaId: null,
        datum: null,
        sekcijaId: null,
        sekcija: null,
        userId: null
    }
});
V.ArtiklStanjeList = Backbone.Collection.extend({
    model: V.ArtiklStanje,
    url: 'artiklstanje',
    storeName: 'ArtiklStanje',
    database: database

});
V.Doziranje = Backbone.Model.extend({
    storeName: 'Doziranje',
    database: database,
    url: 'doziranje',
    defaults: {
        value: null,
        unit: null
    }
});
V.DoziranjeList = Backbone.Collection.extend({
    model: V.Doziranje,
    url: 'doziranje',
    storeName: 'Doziranje',
    database: database

});
V.Dozvola = Backbone.Model.extend({
    storeName: 'Dozvola',
    database: database,
    url: 'dozvola',
    defaults: {
        naziv: null,
        userId: null
    }
});
V.DozvolaList = Backbone.Collection.extend({
    model: V.Dozvola,
    url: 'dozvola',
    storeName: 'Dozvola',
    database: database

});
V.Grozde = Backbone.Model.extend({
    storeName: 'Grozde',
    database: database,
    url: 'grozde',
    defaults: {
        godina: null,
        preradaId: null,
        sortaId: null,
        vinogradId: null,
        primkaId: null,
        primkaStavkaId: null,
        userId: null
    },
    getVinograd: function () {
        var deferred = Q.defer();
        this.fetch({index: {name: 'preradaId', value: this.get('preradaId')},success: function (model) {
            new V.Vinograd({id: model.get('vinogradId')}).fetch({success: function(vinograd) {
                deferred.resolve(vinograd);
            }});

        }, error: function (model, error) {
            deferred.reject(error);
        }});
        return deferred.promise;
    }
});
V.GrozdeList = Backbone.Collection.extend({
    model: V.Grozde,
    url: 'grozde',
    storeName: 'Grozde',
    database: database


});
V.GrozdeCombo = Backbone.Model.extend({
    storeName: 'GrozdeCombo',
    database: database,
    url: 'grozdecombo',
    defaults: {
        grozdeId: null,
        parentId: null,
        udio: null,
        userId: null,
        sortaNaziv: null
    }
});
V.GrozdeComboList = Backbone.Collection.extend({
    model: V.GrozdeCombo,
    url: 'grozdecombo',
    storeName: 'GrozdeCombo',
    database: database

});
V.Grupa = Backbone.Model.extend({
    storeName: 'Grupa',
    database: database,
    url: 'grupa',
    defaults: {
        naziv: null,
        parent: null,
        shortName: null,
        container: {value: false}
    },
    findRootGrupa: function (success) {
        var grupa = this;
//        while (grupa) {
        var parent = grupa.get('parent');
        if (typeof parent === 'undefined' || parent === null) {
            success(grupa);
        } else {
            grupa = new V.Grupa({id: parent});
            grupa.fetch({success: function (model) {
                grupa.findRootGrupa(success);
            }});
        }
//            grupa = new V.Grupa({id: this.get('parentId')});
//        }
//        var grupa = new V.Grupa({id: grupaId});
//        grupa.fetch({success: function(model) {
//
//        }});

    },
    getNaziv: function () {
        var deferred = Q.defer();
        this.fetch({success: function (model) {
            deferred.resolve(model.get('naziv'));
        }, error: function (model, error) {
            deferred.reject(error);
        }});
        return deferred.promise;
    },
    getGrupa: function () {
        var deferred = Q.defer();
        this.fetch({success: function (model) {
            deferred.resolve(model);
        }, error: function (model, error) {
            deferred.reject(error);
        }});
        return deferred.promise;
    }
});
V.GrupaList = Backbone.Collection.extend({
    model: V.Grupa,
    url: 'grupa',
    storeName: 'Grupa',
    database: database

});
V.Izdatnica = Backbone.Model.extend({
    storeName: 'Izdatnica',
    database: database,
    url: 'izdatnica',
    defaults: {
        datum: null,
        partnerId: null,
        napomena: null,
        broj: null
    }
});
V.IzdatnicaList = Backbone.Collection.extend({
    model: V.Izdatnica,
    url: 'izdatnica',
    storeName: 'Izdatnica',
    database: database

});
V.Kakvoca = Backbone.Model.extend({
    storeName: 'Kakvoca',
    database: database,
    url: 'kakvoca',
    defaults: {
        naziv: null,
        kratkiNaziv: null,
        kratica: null
    }
});
V.KakvocaList = Backbone.Collection.extend({
    model: V.Kakvoca,
    url: 'kakvoca',
    storeName: 'Kakvoca',
    database: database

});
V.LoginUser = Backbone.Model.extend({
    storeName: 'LoginUser',
    database: database,
    url: 'loginuser',
    defaults: {
        userId: null,
        fullName: null,
        email: null,
        username: null,
        active: null
    }
});
V.LoginUserList = Backbone.Collection.extend({
    model: V.LoginUser,
    url: 'loginuser',
    storeName: 'LoginUser',
    database: database

});
V.Lokacija = Backbone.Model.extend({
    storeName: 'Lokacija',
    database: database,
    url: 'lokacija',
    defaults: {
        naziv: null,
        adresa: null,
        postBroj: null,
        mjesto: null,
        sekcije: null,
        napomena: null
    }
});
V.LokacijaList = Backbone.Collection.extend({
    model: V.Lokacija,
    url: 'lokacija',
    storeName: 'Lokacija',
    database: database

});
V.Lot = Backbone.Model.extend({
    storeName: 'Lot',
    database: database,
    url: 'lot',
    defaults: {
        broj: null,
        lokacijaId: null,
        posude: null,
        napomena: null,
        nalogId: null,
        kolicina: null,
        datumIzvrsenja: null,
        tip: null
    }
});
V.LotList = Backbone.Collection.extend({
    model: V.Lot,
    url: 'lot',
    storeName: 'Lot',
    database: database,
    fromMonth: function (month, year) {

        return _.filter(this.toJSON(), function (model) {

            var datum = moment(model.datumIzvrsenja);
            return datum.month() === month && datum.year() === year;


        });
    }

});
V.LotRepromaterijal = Backbone.Model.extend({
    storeName: 'LotRepromaterijal',
    database: database,
    url: 'lotrepromaterijal',
    defaults: {
        grupaNaziv: null,
        container: null,
        kolicina: null,
        artiklNaziv: null,
        artiklId: null
    }
});
V.LotRepromaterijalList = Backbone.Collection.extend({
    model: V.LotRepromaterijal,
    url: 'lotrepromaterijal',
    storeName: 'LotRepromaterijal',
    database: database

});
V.LotSljedivost = Backbone.Model.extend({
    storeName: 'LotSljedivost',
    database: database,
    url: 'lotsljedivost',
    defaults: {
        lotBroj: null,
        posudeOznaka: null,
        partnerNaziv: null
    }
});
V.LotSljedivostList = Backbone.Collection.extend({
    model: V.LotSljedivost,
    url: 'lotsljedivost',
    storeName: 'LotSljedivost',
    database: database

});
V.LotStavka = Backbone.Model.extend({
    storeName: 'LotStavka',
    database: database,
    url: 'lotstavka',
    defaults: {
        lotId: null,
        posudaId: null,
        stavkaId: null,
        nalogId: null,
        userId: null
    }
});
V.LotStavkaList = Backbone.Collection.extend({
    model: V.LotStavka,
    url: 'lotstavka',
    storeName: 'LotStavka',
    database: database

});
V.Masulj = Backbone.Model.extend({
    storeName: 'Masulj',
    database: database,
    url: 'masulj',
    defaults: {
        godina: null,
        preradaId: null,
        sortaId: null,
        vrijemeNastanka: null,
        grozdeId: null,
        combo: null,
        combos: null,
        napomena: null,
        userId: null
    }
});
V.MasuljList = Backbone.Collection.extend({
    model: V.Masulj,
    url: 'masulj',
    storeName: 'Masulj',
    database: database

});
V.MasuljCombo = Backbone.Model.extend({
    storeName: 'MasuljCombo',
    database: database,
    url: 'masuljcombo',
    defaults: {
        masuljId: null,
        parentId: null,
        udio: null,
        userId: null
    }
});
V.MasuljComboList = Backbone.Collection.extend({
    model: V.MasuljCombo,
    url: 'masuljcombo',
    storeName: 'MasuljCombo',
    database: database

});
V.Most = Backbone.Model.extend({
    storeName: 'Most',
    database: database,
    url: 'most',
    defaults: {
        godina: null,
        preradaId: null,
        sortaId: null,
        stanje: null,
        masuljId: null,
        grozdeId: null,
        vrijemeNastanka: null,
        combo: null,
        combos: null,
        napomena: null,
        userId: null
    }
});
V.MostList = Backbone.Collection.extend({
    model: V.Most,
    url: 'most',
    storeName: 'Most',
    database: database

});
V.MostCombo = Backbone.Model.extend({
    storeName: 'MostCombo',
    database: database,
    url: 'mostcombo',
    defaults: {
        mostId: null,
        parentId: null,
        udio: null,
        userId: null,
        sortaNaziv: null
    }
});
V.MostComboList = Backbone.Collection.extend({
    model: V.MostCombo,
    url: 'mostcombo',
    storeName: 'MostCombo',
    database: database

});
V.Nalog = Backbone.Model.extend({
    storeName: 'Nalog',
    database: database,
    url: 'nalog',
    defaults: {
        datumIzvrsenja: null,
        datumZadavanja: null,
        potvrdeno: null,
        broj: null,
        vrsta: null,
        vrstaId: null,
        posudaId: null,
        vinoId: null,
        mostId: null,
        grozdeId: null,
        masuljId: null,
        nalogVrsta: null,
        radnje: null
    }
});
V.NalogList = Backbone.Collection.extend({
    model: V.Nalog,
    url: 'nalog',
    storeName: 'Nalog',
    database: database

});
V.Parametar = Backbone.Model.extend({
    storeName: 'Parametar',
    database: database,
    url: 'parametar',
    defaults: {
        naziv: null,
        dugiNaziv: null,
        jedinica: null,
        cijena: null,
        userId: null
    },
    getModel: function () {
        var deferred = Q.defer();
        this.fetch({success: function (model) {
            deferred.resolve(model);
        }, error: function (model, error) {
            deferred.reject(error);
        }});
        return deferred.promise;
    }
});
V.ParametarList = Backbone.Collection.extend({
    model: V.Parametar,
    url: 'parametar',
    storeName: 'Parametar',
    database: database

});
V.Partner = Backbone.Model.extend({
    storeName: 'Partner',
    database: database,
    url: 'partner',
    defaults: {
        naziv: null,
        adresa: null,
        postBroj: null,
        mjesto: null,
        dobavljac: null,
        kupac: null,
        oib: null,
        mibpg: null,
        userId: null
    },
    getNaziv: function () {
        var deferred = Q.defer();
        this.fetch({success: function (model) {
            deferred.resolve(model.get('naziv'));
        }, error: function (model, error) {
            deferred.reject(error);
        }});
        return deferred.promise;
    }
});
V.PartnerList = Backbone.Collection.extend({
    model: V.Partner,
    url: 'partner',
    storeName: 'Partner',
    database: database

});
V.Plan = Backbone.Model.extend({
    storeName: 'Plan',
    database: database,
    url: 'plan',
    defaults: {
        name: null,
        minLitres: null,
        maxLitres: null,
        users: null,
        locations: null,
        order: null


    }
});
V.PlanList = Backbone.Collection.extend({
    model: V.Plan,
    url: 'plan',
    storeName: 'Plan',
    database: database

});
V.PlanLicense = Backbone.Model.extend({
    storeName: 'PlanLicense',
    database: database,
    url: 'planlicense',
    defaults: {
        planId: null,
        license: null,
        status: null
    }
});
V.PlanLicenseList = Backbone.Collection.extend({
    model: V.PlanLicense,
    url: 'planlicense',
    storeName: 'PlanLicense',
    database: database

});
V.Posuda = Backbone.Model.extend({
    storeName: 'Posuda',
    database: database,
    url: 'posuda',
    defaults: {
        oznaka: null,
        volumen: null,
        sekcije: null,
        stanje: null,
        currentSekcija: null,
        sorta: null,
        userId: null
    },
    getModel: function () {
        var deferred = Q.defer();
        this.fetch({success: function (model) {
            deferred.resolve(model);
        }, error: function (model, error) {
            deferred.reject(error);
        }});
        return deferred.promise;
    }
});
V.PosudaList = Backbone.Collection.extend({
    model: V.Posuda,
    url: 'posuda',
    storeName: 'Posuda',
    database: database



});
V.PosudaSekcija = Backbone.Model.extend({
    storeName: 'PosudaSekcija',
    database: database,
    url: 'posudasekcija',
    defaults: {
        posudaId: null,
        sekcijaId: null,
        datum: null,
        userId: null
    }
});
V.PosudaSekcijaList = Backbone.Collection.extend({
    model: V.PosudaSekcija,
    url: 'posudasekcija',
    storeName: 'PosudaSekcija',
    database: database

});
V.PovratStavka = Backbone.Model.extend({
    storeName: 'PovratStavka',
    database: database,
    url: 'povratstavka',
    defaults: {
        povrat: null,
        isporuceno: null,
        izdatnicaStavkaId: null
    }
});
V.PovratStavkaList = Backbone.Collection.extend({
    model: V.PovratStavka,
    url: 'povratstavka',
    storeName: 'PovratStavka',
    database: database

});
V.Povratnica = Backbone.Model.extend({
    storeName: 'Povratnica',
    database: database,
    url: 'povratnica',
    defaults: {
        datum: null,
        partnerId: null,
        napomena: null,
        broj: null,
        izdatnicaId: null,
        userId: null
    }
});
V.PovratnicaList = Backbone.Collection.extend({
    model: V.Povratnica,
    url: 'povratnica',
    storeName: 'Povratnica',
    database: database

});
V.Prerada = Backbone.Model.extend({
    storeName: 'Prerada',
    database: database,
    url: 'prerada',
    defaults: {
        datum: null,
        primkaId: null,
        primka: null,
        nalozi: null,
        broj: null,
        vrsta: null,
        sortaNaziv: null,
        polozaj: null,
        sortaId: null
    }
});
V.PreradaList = Backbone.Collection.extend({
    model: V.Prerada,
    url: 'prerada',
    storeName: 'Prerada',
    database: database,
    fromMonth: function (month, year) {
        return _.filter(this.toJSON(), function (model) {
            var datum = moment(model.datum);
            return datum.month() === month && datum.year() === year;
        });
    }

});
V.PreradaNalog = Backbone.Model.extend({
    storeName: 'PreradaNalog',
    database: database,
    url: 'preradanalog',
    defaults: {
        preradaId: null,
        nalogId: null,
        userId: null
    }
});
V.PreradaNalogList = Backbone.Collection.extend({
    model: V.PreradaNalog,
    url: 'preradanalog',
    storeName: 'PreradaNalog',
    database: database

});
V.PrimjenaSredstvo = Backbone.Model.extend({
    storeName: 'PrimjenaSredstvo',
    database: database,
    url: 'primjenasredstvo',
    defaults: {
        naziv: null,
        doziranje: null,
        kolicina: null,
        primjena: null
    }
});
V.PrimjenaSredstvoList = Backbone.Collection.extend({
    model: V.PrimjenaSredstvo,
    url: 'primjenasredstvo',
    storeName: 'PrimjenaSredstvo',
    database: database

});
V.Primka = Backbone.Model.extend({
    storeName: 'Primka',
    database: database,
    url: 'primka',
    defaults: {
        partnerId: null,
        partner: null,
        datum: null,
        brRacuna: null,
        napomena: null,
        broj: null,
        stavke: null,
        kolicina: null,
        cijena: null,
        iznos: null,
        grupaId: null,
        grupaNaziv: null,
        jm: null,
        userId: null
    }
});
V.PrimkaList = Backbone.Collection.extend({
    model: V.Primka,
    url: 'primka',
    storeName: 'Primka',
    database: database

});
V.PrimkaStavka = Backbone.Model.extend({
    storeName: 'PrimkaStavka',
    database: database,
    url: 'primkastavka',
    defaults: {
        primkaId: null,
        grupaId: null,
        kolicina: null,
        cijena: null,
        iznos: null,
        artikl: null,
        artiklId: null,
        jmStavka: null,
        userId: null
    }
});
V.PrimkaStavkaList = Backbone.Collection.extend({
    model: V.Primka,
    url: 'primkastavka',
    storeName: 'PrimkaStavka',
    database: database

});
V.Proizvod = Backbone.Model.extend({
    storeName: 'Proizvod',
    database: database,
    url: 'proizvod',
    defaults: {
        naziv: null,
        napomena: null,
        userId: null
    }
});
V.ProizvodList = Backbone.Collection.extend({
    model: V.Proizvod,
    url: 'proizvod',
    storeName: 'Proizvod',
    database: database

});
V.Proizvodac = Backbone.Model.extend({
    storeName: 'Proizvodac',
    database: database,
    url: 'proizvodac',
    defaults: {
        naziv: null,
        userId: null
    }
});
V.ProizvodacList = Backbone.Collection.extend({
    model: V.Proizvodac,
    url: 'proizvodac',
    storeName: 'Proizvodac',
    database: database

});
V.Radnja = Backbone.Model.extend({
    storeName: 'Radnja',
    database: database,
    url: 'radnja',
    defaults: {
        tip: null,
        posuda1: null,
        posuda2: null,
        artikl1: null,
        artikl2: null,
        kolicina: null,
        rb: null,
        napomena: null,
        jm: null,
        sredstvoId: null,
        parametarId: null,
        proizvodId: null,
        nalogId: null,
        userId: null
    }
});
V.RadnjaList = Backbone.Collection.extend({
    model: V.Radnja,
    url: 'radnja',
    storeName: 'Radnja',
    database: database

});
V.Sekcija = Backbone.Model.extend({
    storeName: 'Sekcija',
    database: database,
    url: 'sekcija',
    defaults: {
        naziv: null,
        defaultProp: null,
        lokacijaId: null,
        userId: null

    }
});
V.SekcijaList = Backbone.Collection.extend({
    model: V.Sekcija,
    url: 'sekcija',
    storeName: 'Sekcija',
    database: database

});
V.Sorta = Backbone.Model.extend({
    storeName: 'Sorta',
    database: database,
    url: 'sorta',
    defaults: {
        naziv: null,
        vrsta: null,
        active: null,
        userId: null
    }
});
V.SortaList = Backbone.Collection.extend({
    model: V.Sorta,
    url: 'sorta',
    storeName: 'Sorta',
    database: database
});
V.SortaVinograd = Backbone.Model.extend({
    storeName: 'SortaVinograd',
    database: database,
    url: 'sortavinograd',
    defaults: {
        vinogradId: null,
        sortaId: null,
        datum: null,
        userId: null,
        sorta: null
    }
});
V.SortaVinogradList = Backbone.Collection.extend({
    model: V.SortaVinograd,
    url: 'sortavinograd',
    storeName: 'SortaVinograd',
    database: database

});
V.Sredstvo = Backbone.Model.extend({
    storeName: 'Sredstvo',
    database: database,
    url: 'sredstvo',
    defaults: {
        doziranje: null,
        artiklId: null,
        artikl: null,
        doziranjeJm: null,
        userId: null
    }
});
V.SredstvoList = Backbone.Collection.extend({
    model: V.Sredstvo,
    url: 'sredstvo',
    storeName: 'Sredstvo',
    database: database

});
V.Stanje = Backbone.Model.extend({
    storeName: 'Stanje',
    database: database,
    url: 'stanje',
    defaults: {
        posudaId: null,
        vrsta: null,
        vrstaId: null,
        kolicina: null,
        sortaId: null,
        nalogId: null,
        napomena: null,
        vinoId: null,
        mostId: null,
        grozdeId: null,
        masuljId: null,
        datum: null,
        stanje: null,
        userId: null
    }
});
V.StanjeList = Backbone.Collection.extend({
    model: V.Stanje,
    url: 'stanje',
    storeName: 'Stanje',
    database: database

});
V.Stavka = Backbone.Model.extend({
    storeName: 'Stavka',
    database: database,
    url: 'stavka',
    defaults: {
        masterId: null,
        grupaId: null,
        kolicina: null,
        cijena: null,
        iznos: null,
        artikl: null,
        artiklId: null,
        artiklStanjeId: null,
        jmStavka: null,
        userId: null
    }
});
V.StavkaList = Backbone.Collection.extend({
    model: V.Stavka,
    url: 'stavka',
    storeName: 'Stavka',
    database: database

});
V.Stopa = Backbone.Model.extend({
    storeName: 'Stopa',
    database: database,
    url: 'stopa',
    defaults: {
        naziv: null,
        stopa: null,
        userId: null

    }
});
V.StopaList = Backbone.Collection.extend({
    model: V.Stopa,
    url: 'stopa',
    storeName: 'Stopa',
    database: database

});
V.System = Backbone.Model.extend({
    storeName: 'System',
    database: database,
    url: 'system',
    defaults: {
        key: null,
        value: null,
        userId: null
    },
    keys: ['SYNC', 'SETUP', 'DB_VERSION', 'WINERY_LOGO', 'WINERY_PRODUCER', 'WINERY',
        'PUNJENJE', 'OZNACAVANJE', 'PAKIRANJE'],
    selectValue: function () {
        var deferred = Q.defer();
        this.fetch({success: function (model) {
            deferred.resolve(model.get('value'));
        }, error: function (model, error) {
            deferred.reject(error);
        }});
        return deferred.promise;
    }
});
V.SystemList = Backbone.Collection.extend({
    model: V.System,
    url: 'system',
    storeName: 'System',
    database: database

});
V.Trosak = Backbone.Model.extend({
    storeName: 'Trosak',
    database: database,
    url: 'trosak',
    defaults: {
        vrsta: null,
        vrstaId: null,
        kolicina: null,
        iznos: null,
        vinoId: null,
        mostId: null,
        masuljId: null,
        datum: null,
        napomena: null,
        userId: null
    }
});
V.TrosakList = Backbone.Collection.extend({
    model: V.Trosak,
    url: 'trosak',
    storeName: 'Trosak',
    database: database

});
V.Uloga = Backbone.Model.extend({
    storeName: 'Uloga',
    database: database,
    url: 'uloga',
    defaults: {
        naziv: null,
        dozvole: null,
        userId: null
    }
});
V.UlogaList = Backbone.Collection.extend({
    model: V.Uloga,
    url: 'uloga',
    storeName: 'Uloga',
    database: database

});
V.UlogaDozvola = Backbone.Model.extend({
    storeName: 'UlogaDozvola',
    database: database,
    url: 'ulogadozvola',
    defaults: {
        roleId: null,
        permissionId: null,
        userId: null
    }
});
V.UlogaDozvolaList = Backbone.Collection.extend({
    model: V.UlogaDozvola,
    url: 'ulogadozvola',
    storeName: 'UlogaDozvola',
    database: database

});
V.Client = Backbone.Model.extend({
    storeName: 'Client',
    database: database,
    url: 'client',
    defaults: {
        id: null,
        wineryName: null,
        taxNr: null,
        address: null,
        postalCode: null,
        city: null,
        country: null,
        active: null
    }
});
V.ClientList = Backbone.Collection.extend({
    model: V.Client,
    url: 'client',
    storeName: 'Client',
    database: database

});
V.UserPlan = Backbone.Model.extend({
    storeName: 'UserPlan',
    database: database,
    url: 'userplan',
    defaults: {
        userId: null,
        planPriceId: null,
        fromDate: null,
        planLicenseId: null
    }
});
V.UserPlanList = Backbone.Collection.extend({
    model: V.UserPlan,
    url: 'userplan',
    storeName: 'UserPlan',
    database: database

});
V.Vino = Backbone.Model.extend({
    storeName: 'Vino',
    database: database,
    url: 'vino',
    defaults: {
        naziv: null,
        oznaka: null,
        godina: null,
        sortaId: null,
        vrsta: null,
        sortaNaziv: null,
        mostId: null,
        preradaId: null,
        datum: null,
        combo: null,
        combos: null,
        napomena: null,
        userId: null
    }
});
V.VinoList = Backbone.Collection.extend({
    model: V.Vino,
    url: 'vino',
    storeName: 'Vino',
    database: database

});
V.VinoCombo = Backbone.Model.extend({
    storeName: 'VinoCombo',
    database: database,
    url: 'vinocombo',
    defaults: {
        vinoId: null,
        parentId: null,
        udio: null,
        sortaNaziv: null,
        userId: null
    }
});
V.VinoComboList = Backbone.Collection.extend({
    model: V.VinoCombo,
    url: 'vinocombo',
    storeName: 'VinoCombo',
    database: database

});
V.Vinograd = Backbone.Model.extend({
    storeName: 'Vinograd',
    database: database,
    url: 'vinograd',
    defaults: {
        oznaka: null,
        polozaj: null,
        povrsina: null,
        sorte: null,
        arkod: null,
        partnerId: null,
        partner: null,
        jedinica: null,
        userId: null
    }
});
V.VinogradList = Backbone.Collection.extend({
    model: V.Vinograd,
    url: 'vinograd',
    storeName: 'Vinograd',
    database: database


});
V.Vrsta = Backbone.Model.extend({
    storeName: 'Vrsta',
    database: database,
    url: 'vrsta',
    defaults: {
        vrsta: null,
        vrstaId: null,
        sortaId: null

    }
});
V.VrstaList = Backbone.Collection.extend({
    model: V.Vrsta,
    url: 'vrsta',
    storeName: 'Vrsta',
    database: database

});
