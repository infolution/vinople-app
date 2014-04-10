V.VinogradView = Marionette.ItemView.extend({
    template: window.JST['/vinogradi/vinogradView.hbs']
});
V.Sorte = Marionette.ItemView.extend({
    template: window.JST['/vinogradi/sorte.hbs'],
    initialize: function() {
        this.sorteList = new V.SortaList();
        this.table = new Backgrid.Grid({
            columns: [
                {name: 'naziv', label: "Naziv", cell: 'string'},
                {name: 'vrsta', label: "Vrsta", cell: 'string'},
                {name: 'active', label: "Active", cell: 'boolean'}
            ],
            collection: this.sorteList
        });
    },
    onRender: function() {
        this.$el.hide();
        _.defer(_.bind(this.transitionIn_, this));

        var render = this.table.render().el;
        this.$("#table").append(render);
        var self = this;
        this.sorteList.fetch();
    }
});
V.VinogradWidget = function(config) {
    var width = config.canvasWidth - config.canvasPadding, height = 130, padding = 10, margin = 10, lineheight= 25,
        sortaWidth = 150;

    function control(vinograd) {
        vinograd.on("mouseover", function() {
            d3.select(this).select(".box").classed("selected",true)
            ;
        }).on("mouseout", function() {
                d3.select(this).select(".box").classed("selected",false)
            });
        vinograd.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("class", "box");
        var polozaj = vinograd.append("text")   //položaj
            .attr("x", padding)
            .attr("y", padding)
            .attr("dy",".71em")
            .attr("class","polozaj")
            .text(function(d) {return d.polozaj});
//            var bbox = polozaj[0][0].getBBox();  //Vraća mi 0
        var bbox = {width: 150, x : 0};
        vinograd.append("text")   //površina
            .attr("x", padding*6 + bbox.x+bbox.width)
            .attr("y", padding+lineheight/2)

            .attr("text-anchor", "middle")
            .attr("class","bold")
            .text(function(d) {return d.povrsina});
        vinograd.append("text")   //jedinica
            .attr("x", padding*6 + bbox.x+bbox.width)
            .attr("y", padding+lineheight/1.5)
            .attr("dy",".71em")
            .attr("text-anchor", "middle")
            .text(function(d) {return d.jedinica});
        vinograd.append("text")   //arkod
            .attr("x", padding*20 + bbox.x+bbox.width)
            .attr("y", padding+lineheight/2)

            .attr("text-anchor", "middle")
            .attr("class","bold")
            .text(function(d) {return d.arkod});
        vinograd.append("text")   //arkod tekst
            .attr("x", padding*20 + bbox.x+bbox.width)
            .attr("y", padding+lineheight/1.5)
            .attr("dy",".71em")
            .attr("text-anchor", "middle")
            .text("Arkod");
        vinograd.append("text")   //partner
            .attr("x", padding*30 + bbox.x+bbox.width)
            .attr("y", padding+lineheight/2)
            .attr("class","bold")
            .text(function(d) {
                return d.partnerId.naziv}
        );
        vinograd.append("text")   //sortaTekst
            .attr("x", padding)
            .attr("y", padding+lineheight*2)
            .attr("dy",".32em")
            .text("Sorte");
        vinograd.selectAll("g")
            .data(function(d) { return d.sorte; })
            .enter().append("g")
            .attr("transform", function (d, i) {
                return "translate(" + i * (300+margin) + ",0)";
            })
            .call(function (s) {
                s.append("text")   //sorta
                    .attr("x", padding+sortaWidth)
                    .attr("y", padding+lineheight*3)
                    .attr("text-anchor", "middle")
                    .attr("class","bold")
                    .text(function(d) {return d.sortaId.naziv});
                s.append("text")   //komada
                    .attr("x", padding+sortaWidth)
                    .attr("y", padding+lineheight*3+10)
                    .attr("dy",".71em")
                    .attr("class","bold")
                    .text(function(d) {return d.komada});
            });
    }
    control.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return control;
    };
    control.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return control;
    };
    return control;

};
V.Vinogradi = Marionette.ItemView.extend({
    template: window.JST['/controls/loading.hbs'],
    templatereal: window.JST['/vinogradi/vinogradi.hbs'],
    initialize: function() {
        var self = this;
        this.vinogradiList = new V.VinogradList();
        this.vinogradiList.fetch({success: function(list) {
            self.tryRender();
        }});
    },
    tryRender: function () {
        this.template = this.templatereal;
        this.realRender = true;
        this.render();

    },
    onRender: function() {
        this.$el.hide();
        _.defer(_.bind(this.transitionIn_, this));
        if (this.realRender) {
            var vinogradiList = this.vinogradiList.toJSON();
            this.d3(vinogradiList);
        }
    },
    d3: function(vinogradiList) {
            var canvasWidth = 800, canvasHeight = 400, canvasPadding = 20, margin = 10;
        var canvas = d3.select(this.el).select("#vinogradi").append("svg")
            .attr("width", canvasWidth).attr("height", canvasHeight);
        var vinogradWidget = new V.VinogradWidget({canvasWidth: canvasWidth, canvasPadding: canvasPadding});
        var vinogradWidth = vinogradWidget.width;
        var vinogradHeight = vinogradWidget.height();

        canvasHeight = vinogradiList.length * (vinogradHeight + margin);
        canvas.attr("height", canvasHeight);
        canvas.selectAll("g").data(vinogradiList)
            .enter().append("g")
            .attr("class", "vinograd-widget")
            .attr("transform", function (d, i) {

                return "translate("+canvasPadding+", " + i * (vinogradHeight+margin) + ")";
            })
            .call(vinogradWidget);
    }
});


//Y.Vinograd = Y.Base.create('Vinograd', Y.View, [], {
//    template: 'vinogradView',
//    resources: Y.Intl.get("vinogradi"),
//    initializer: function() {
//
//    },
//    render: function() {
//        var template = Handlebars.templates[this.template];
//        this.get('container').setHTML(template(this.resources));
//        ;
//
//        return this;
//    }
//});
//
//Y.Vinogradi = Y.Base.create('Vinogradi', Y.View, [], {
//    template: 'vinogradi',
//    resources: Y.Intl.get("vinogradi"),
//    initializer: function() {
//        var vinogradList = new Y.VinogradList();
//
//        this.set('model', vinogradList);
//        var self = this;
//        vinogradList.on('load', function(e) {
//            var parent = self.get('container').one('#vinogradi');
//            parent.setHTML('');
//            var vinogradList = self.get('model');
////            for (var i = 0, j=2; i < j; ++i) {
////                var model = vinogradList.item(i);
////                  var vinogradWidget = new Y.VinogradWidget({model: model});
////                parent.append(vinogradWidget.render().get('container'));
////            }
//            vinogradList.each(function(model) {
//                var vinogradWidget = new Y.VinogradWidget({model: model});
//                parent.append(vinogradWidget.render().get('container'));
//            });
//        });
////        var data = vinogradList.toJSON();
//    },
//    render: function() {
//        var template = Handlebars.templates[this.template];
//        this.get('container').setHTML(template(this.resources));
//        this.get('model').load();
//        this.get('container').one('#vinogradi').setHTML('<p><img src="/images/ajax-loader.gif" alt="ajax-loader" /> Loading...</p>');
//
////        for (var i = 0; this.da i < 26; ++i) {
////            var vinogradWidget = new Y.VinogradWidget();
////            parent.append(vinogradWidget.render().get('container'));
////        }
//
//
//        return this;
//    },
//    add: function() {
//
//    }
//});
//Y.Sorte = Y.Base.create('sorte', Y.View, [], {
//    template: 'sorte',
//    resources: Y.Intl.get("vinogradi"),
//    events: {
//        '#saveForm': {submit: 'save'},
//        '#deleteBtn': {click: 'deleteRecord'},
//        '#newBtn': {click: 'newRecord'}
//    },
//    initializer: function() {
//        var sortaList = new Y.SortaList();
//        sortaList.load();
//        var data = sortaList;
//        this.table = new Y.DataTable({
//            columns: [
//                {key: 'naziv', label: "Name", width: '325px'},
//                {key: 'vrsta', label: "Color", width: '125px'},
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
//            e.currentTarget.selectedRecord = rec;
//            if (!last_tr) {
//
//            } else {
//                last_tr.removeClass("myhilite");
//            }
//            tr.addClass("myhilite");
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
//    },
//    save: function(e) {
//        var result = Y.QueryString.parse(Y.IO.stringify(e.currentTarget));
//        result.username = result.email;
//        this.ljudiList.create(result);
//        e.preventDefault();
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
//    }
//});
//
//Y.VinogradWidget = Y.Base.create('VinogradWidget', Y.View, [], {
//    template: 'vinogradWidget',
//    resources: Y.Intl.get("vinogradi"),
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
//
//

