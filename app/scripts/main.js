'use strict';
//V - Vinople
var V = V || {};
V.Reports = V.Reports || {};
var lang = window.localStorage.lang;
if (typeof lang !== 'undefined' && lang !== '') {
    V.Lang = V.Lang[lang];
} else {
    V.Lang = V.Lang.en;
}
var vinarija = V.Lang['LBL_vinarija'];

Handlebars.registerHelper("i18n", function (key) {
    var result = window.V.Lang[key];
    return new Handlebars.SafeString(result);
});

var DateFormats = {
    short: "DD.MM.YYYY"
};
Handlebars.registerHelper("formatDate", function (datetime, format) {
    if (moment) {
        var f = DateFormats[format];
        return moment(datetime).format(f);
    }
    else {
        return datetime;
    }
});
Handlebars.registerHelper('percent', function (number) {
    return number * 100 + '% ';
});


Backbone.Marionette.Renderer.renderTemplate = function (template, data) {
    template(data);
};

_.extend(Backbone.Marionette.ItemView.prototype, {
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


V.Communicator = Backbone.Marionette.Controller.extend({
    initialize: function (options) {
        console.log("initialize a Communicator");

        // create a pub sub
        this.mediator = new Backbone.Wreqr.EventAggregator();

        //create a req/res
        this.reqres = new Backbone.Wreqr.RequestResponse();

        // create commands
        this.command = new Backbone.Wreqr.Commands();
    }
});

$(document).foundation();


V.App = new Backbone.Marionette.Application();

/* Add application regions here */
V.App.addRegions({
    header: '#header',
    container: '#container'
});


V.RouterController = {
    homeView: function () {
//        var topBar = new V.TopBar();
//        var template = JST['/core/topBar.hbs'];
//        document.body.innerHTML = template(V.Lang);
        var startView = new V.Start();
        V.App.container.show(startView);
    },
    vinarijaView: function () {
        var vinarijaView = new V.Vinarija();
        V.App.container.show(vinarijaView);
    },
    vinogradiView: function () {
        var view = new V.VinogradView();
        V.App.container.show(view);
    },
    tvrtkaView: function () {
        var view = new V.Tvrtka();
        V.App.container.show(view);
    },
    skladisteView: function () {
        var view = new V.Skladiste();
        V.App.container.show(view);
    },
    tankoviView: function () {
        var view = new V.Tanks();
        V.App.container.show(view);
    },
    ljudiView: function () {
        var view = new V.Ljudi();
        V.App.container.show(view);
    },
    partneri: function () {
        var view = new V.Partneri();
        V.App.container.show(view);
    },
    lokacijeView: function () {
        var view = new V.Lokacije();
        V.App.container.show(view);
    },
    sorte: function () {
        var view = new V.Sorte();
        V.App.container.show(view);
    },
    vinogradi: function () {
        var view = new V.Vinogradi();
        V.App.container.show(view);
    },
    ulazView: function () {
        var view = new V.Ulaz();
        V.App.container.show(view);
    },
    preradaPanel: function (id) {
        var preradaId = id;
        var model = new V.Prerada({id: preradaId});
        var view = new V.PreradaPanel({model: model});
        V.App.container.show(view);

    },
    postavke: function () {
        var view = new V.Postavke();
        V.App.container.show(view);
    },
    vino: function () {
        var view = new V.Vina({vrsta: 'V'});
        V.App.container.show(view);
    },
    most: function () {
        var view = new V.Vina({vrsta: 'MO'});
        V.App.container.show(view);
    },
    masulj: function () {
        var view = new V.Vina({vrsta: 'MA'});
        V.App.container.show(view);
    },
    grozde: function () {
        var view = new V.Vina({vrsta: 'G'});
        V.App.container.show(view);
    },
    punjenje: function () {
        var view = new V.Punjenje();
        V.App.container.show(view);
    },
    punjenjePanel: function (id) {
        var model = new V.Lot({id: id});
        var view = new V.PunjenjePanel({model: model});
        V.App.container.show(view);

    },
    enosredstva: function () {
        var view = new V.Enosredstva();
        V.App.container.show(view);
    },
    repromaterijal: function () {
        var view = new V.Repromaterijal();
        V.App.container.show(view);
    },
    gotovaroba: function () {
        var view = new V.GotovaRoba();
        V.App.container.show(view);
    },
    vinoPanel: function (vrsta, id) {
        var posudaId = id;
        var model = new V.Posuda({id: posudaId});
        var view = new V.VinoPanel({model: model});
        V.App.container.show(view);
    },
    primka: function (primkaId) {
        var model = new V.Primka({id: primkaId});
        var view = new V.PrimkaPanel({model: model});
        V.App.container.show(view);
    },
    katalog: function () {
        var view = new V.Katalog();
        V.App.container.show(view);
    },


    //Reports
    ulazPremaPartneru: function () {
        var view = new V.Reports.UlazPremaPartneru();
        V.App.container.show(view);
    },
    ulazPremaSorti: function () {
        var view = new V.Reports.UlazPremaSorti();
        V.App.container.show(view);
    }

};

V.Router = Backbone.Marionette.AppRouter.extend({
    controller: V.RouterController,
    appRoutes: {
        '': 'homeView'
    }
});


/* Add initializers here */
V.App.addInitializer(function () {
    var router = new V.Router();
    router.appRoute(V.Lang['URL_vinarija'] + '/', 'vinarijaView');
    router.appRoute(V.Lang['URL_vinograd'] + '/', 'vinogradiView');
    router.appRoute(V.Lang['URL_tvrtka'] + '/', 'tvrtkaView');
    router.appRoute(V.Lang['URL_skladiste'] + '/', 'skladisteView');

    //Vinarija routes
    router.appRoute(V.Lang['URL_vinarija'] + '/' + V.Lang['URL_ulaz'] + '/', 'ulazView');
    router.appRoute(V.Lang['URL_vinarija'] + '/' + V.Lang['URL_ulaz'] + '/' + V.Lang['URL_prerada'] + '/' + ':id' + '/', 'preradaPanel');
    router.appRoute(V.Lang['URL_vinarija'] + '/' + V.Lang['URL_ulaz'] + '/' + V.Lang['URL_prerada'] + '/' + '/', 'preradaPanel');
    router.appRoute(V.Lang['URL_vinarija'] + '/' + V.Lang['URL_vino'] + '/', 'vino');
    router.appRoute(V.Lang['URL_vinarija'] + '/' + V.Lang['URL_most'] + '/', 'most');
    router.appRoute(V.Lang['URL_vinarija'] + '/' + V.Lang['URL_masulj'] + '/', 'masulj');
    router.appRoute(V.Lang['URL_vinarija'] + '/' + V.Lang['URL_grozde'] + '/', 'grozde');
    router.appRoute(V.Lang['URL_vinarija'] + '/' + V.Lang['URL_punjenje'] + '/', 'punjenje');
    router.appRoute(V.Lang['URL_vinarija'] + '/' + ':vrsta' + '/' + V.Lang['URL_posuda'] + '/' + ':id' + '/', 'vinoPanel');
    router.appRoute(V.Lang['URL_vinarija'] + '/' + V.Lang['URL_punjenje'] + '/' + ':id' + '/', 'punjenjePanel');
    router.appRoute(V.Lang['URL_vinarija'] + '/' + V.Lang['URL_punjenje'] + '/' + '/', 'punjenjePanel');

    //Tvrtka routes
    router.appRoute(V.Lang['URL_tvrtka'] + '/' + V.Lang['URL_tankovi'] + '/', 'tankoviView');
    router.appRoute(V.Lang['URL_tvrtka'] + '/' + V.Lang['URL_partneri'] + '/', 'partneri');
    router.appRoute(V.Lang['URL_tvrtka'] + '/' + V.Lang['URL_ljudi'] + '/', 'ljudiView');
    router.appRoute(V.Lang['URL_tvrtka'] + '/' + V.Lang['URL_lokacije'] + '/', 'lokacijeView');


    //Vinograd routes
    router.appRoute(V.Lang['URL_vinograd'] + '/' + V.Lang['URL_vinogradi'] + '/', 'vinogradi');
    router.appRoute(V.Lang['URL_vinograd'] + '/' + V.Lang['URL_sorte'] + '/', 'sorte');

    //Skladiste routes
    router.appRoute(V.Lang['URL_skladiste'] + '/' + V.Lang['URL_enosredstva'] + '/', 'enosredstva');
    router.appRoute(V.Lang['URL_skladiste'] + '/' + V.Lang['URL_repromaterijal'] + '/', 'repromaterijal');
    router.appRoute(V.Lang['URL_skladiste'] + '/' + V.Lang['URL_gotovaroba'] + '/', 'gotovaroba');
    router.appRoute(V.Lang['URL_skladiste'] + '/' + V.Lang['URL_primka'] + '/' + ':id' + '/', 'primka');
    router.appRoute(V.Lang['URL_skladiste'] + '/' + V.Lang['URL_primka'] + '/' + '/', 'primka');
    router.appRoute(V.Lang['URL_skladiste'] + '/' + V.Lang['URL_katalog'] + '/', 'katalog');

    //Postavke routes
    router.appRoute(V.Lang['URL_postavke'] + '/', 'postavke');

    //Print routes
    router.appRoute(V.Lang['URL_print'] + '/' + V.Lang['URL_ulaz_prema_partneru'] + '/', 'ulazPremaPartneru');
    router.appRoute(V.Lang['URL_print'] + '/' + V.Lang['URL_ulaz_prema_sorti'] + '/', 'ulazPremaSorti');
//    Backbone.history.start();

//Update db;
    var schema = V.VinopleSchema;
    var db = new V.IndexedDB();
    db.update(schema, function() {
        console.log("IndexedDB schema updated to version: " + schema.version);
    });
//    window.socket.onopen = function () {
//        //Sync db;
//        var objectstores = schema.objectstores;
//        var method = 'read';
//        var options = {};
//        options.success = function (json) {
////            console.log('Update success: ' + json.id);
//        };
//        options.error = function (e) {
//            console.log(e);
//        };
////        db.open(this.root, function() {
//        for (var i = 0, j = objectstores.length; i < j; ++i) {
//            var model = {};
//            model.storeName = objectstores[i].storename;
//            model.url = objectstores[i].storename.toLowerCase();
//            model.add = function (model) {
//
//            };
//            window.VinopleSync.syncServer(method, model, options, null);
//        }
////        });
//
//    };


});

function syncServer() {
    var schema = V.VinopleSchema;
    var db = new V.IndexedDB();
    //Sync db;
    var objectstores = schema.objectstores;

    var options = {};
    options.success = function (json) {
//            console.log('Update success: ' + json.id);
    };
    options.error = function (e) {
        console.log(e);
    };
//        db.open(this.root, function() {
    var models = [];
    for (var i = 0, j = objectstores.length; i < j; ++i) {
        var model = {};
        model.storeName = objectstores[i].storename;
        model.url = objectstores[i].storename.toLowerCase();
//        model.add = function (model) {
//
//        };
        models.push(model);

    }
    window.VinopleSync.syncServer(models, options);
//        });


}

function connectWebsocket() {
    var host = 'ws://socket.vinople.local:8000';
    var socket = window.socket = new WebSocket(host);
    return socket;
}

function connectSocketIO() {
    var host = 'http://localhost:8000';
    var socket = window.socket = io.connect(host);
    return socket;
}

V.App.on('initialize:before', function () {

    Handlebars.registerPartial('sortaView', window.JST['/controls/sortaView.hbs']);
    Handlebars.registerPartial('posudaControl', window.JST['/controls/posudaControl.hbs']);
    Handlebars.registerPartial('reportMenu', window.JST['/reports/reportMenu.hbs']);

});

V.App.on('initialize:after', function () {
    if (Backbone.history) {
        Backbone.history.start();
    }
    var topBar = new V.TopBar();
//    var vinarijaView = new V.Vinarija();
    V.App.header.show(topBar);
    var socket = connectSocketIO();
    socket.on('connect', function () {
        console.log('socket open');
        topBar.serverOnline();
        socket.emit('hello', {hello: 'Hello world'});

        syncServer();
    });
    socket.on('disconnect', function () {
        console.log('socket close');
        topBar.serverOffline();
    });
    socket.on('vinople.db',function(data) {
        console.log('Sync: received response for resource: ' + data.resource);
        var options = {};
        options.success = function (json) {
//            console.log('Update success: ' + json.id);
        };
        options.error = function (e) {
            console.log(e);
        };
        window.VinopleSync.handleMsg(data, options);
    });
//    if (typeof window.socket !== 'undefined') {
//        if (window.socket.readyState === 0) {
//            topBar.serverOffline();
//        }
//
//        if (window.socket.readyState > 0) {
//            topBar.serverOnline();
//        }
//    }
//    V.App.container.show(vinarijaView);


});
V.App.start();
Foundation.init();

//var schema = V.VinopleSchema;
//indexedDB.deleteDatabase(schema.datastore);