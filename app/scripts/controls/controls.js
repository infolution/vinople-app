V.CronoModel = Backbone.Model.extend({
});
V.CronoView  = Marionette.CollectionView.extend({
    itemView: V.PreradaControl,
    initialize: function () {
        var a = 12;
        //         this.collection = new V.PreradaList();

    },
    onRender: function () {

    }
});
V.MonthView = Marionette.CompositeView.extend({
    className: 'crono',
    template: window.JST['/controls/cronoView.hbs'],
    itemViewContainer: '.content',
    itemView: V.PreradaControl,
    events: {
        'click .more': 'showMore'
    },
    initialize: function() {
//        moment.lang('hr');
//        this.startDate = moment();
//        this.currentDate = this.startDate;
////        this.fillMonths();
//        var months = [];
//        for (var i = 0; i < 6; ++i) {
//            var title = this.currentDate.format('MMMM YYYY');
//            months.push({title: title});
//            this.currentDate.subtract('months', 1);
//        }
//        this.collection = new Backbone.Collection(months);
    },
    onRender: function() {
//        this.$el.hide();
//        _.defer(_.bind(this.transitionIn_, this))
//        //        tjo
//        var cronoView = new V.CronoView();
//        var render = cronoView.render().el;
//        this.$("#prerade").html(render);
        var el = this.el;
    },
    showMore: function(e) {
        this.fillMonths();
    }
});
// Suppose you want to highlight the entire row when an editable field is focused
V.FocusableRow = Backgrid.Row.extend({
    highlightColor: "lightYellow",
    events: {
        click: "rowFocused",
        focusout: "rowLostFocus"
    },
    rowFocused: function() {
        this.el.style.backgroundColor = this.highlightColor;
    },
    rowLostFocus: function() {
        delete this.el.style.backgroundColor;
    }
});

V.PartnerSelector = Marionette.ItemView.extend({
    template: window.JST['/controls/partnerSelector.hbs'],
    events: {
        'click #modal-choose': 'choose'
    },
    initialize: function() {
        this.partnerList = new V.PartnerList();
        this.table = new Backgrid.Grid({
            columns: [
                {name: '', label: "", cell: 'select-row', editable: false, headerCell: 'select-all'},
                {name: 'naziv', label: "Naziv", cell: 'string', editable: false}
            ],
            collection: this.partnerList
        });
    },
    onRender: function() {
        var render = this.table.render().el;
        this.$("#table").append(render);
        var filter = new Backgrid.Extension.ClientSideFilter({
            collection: this.partnerList,
            fields: ['naziv']
        });
        // Render the filter
        this.$("#search-row").html(filter.render().el);
        this.partnerList.fetch();
    },
    choose: function() {
        var selectedModels = this.table.getSelectedModels();
        var model = selectedModels[0] || null;
        V.App.vent.trigger('partner:selected', model);
        
    }
});
V.SortaSelector = Marionette.ItemView.extend({
    template: window.JST['/controls/sortaSelector.hbs'],
    events: {
        'click #modal-choose': 'choose'
    },
    initialize: function() {
        this.sorteList = new V.SortaList();


        this.table = new Backgrid.Grid({
//            row: V.FocusableRow, // <-- Tell the Body class to use FocusableRow to render rows.
            columns: [
                {name: '', label: "", cell: 'select-row', editable: false, headerCell: 'select-all'},
                {name: 'naziv', label: "Naziv", cell: 'string', editable: false},
                {name: 'vrsta', label: "Vrsta", cell: 'string', editable: false}
            ],
            collection: this.sorteList
        });
    },
    onRender: function() {
        var render = this.table.render().el;
        this.$("#table").append(render);
        // Initialize a client-side filter to filter on the client
// mode pageable collection's cache.
        var filter = new Backgrid.Extension.ClientSideFilter({
            collection: this.sorteList,
            fields: ['naziv']
        });
        // Render the filter
        this.$("#search-row").html(filter.render().el);
        this.sorteList.fetch();
    },
    choose: function() {
        var selectedModels = this.table.getSelectedModels();
        var model = selectedModels[0] || null;
        V.App.vent.trigger('sorta:selected', model);
        
    }
});
V.VinogradSelector = Marionette.ItemView.extend({
    template: window.JST['/controls/vinogradSelector.hbs'],
    events: {
        'click #modal-choose': 'choose'
    },
    initialize: function() {
        this.vinogradiList = new V.VinogradList();
        this.table = new Backgrid.Grid({
            columns: [
                {name: '', label: "", cell: 'select-row', editable: false, headerCell: 'select-all'},
                {name: 'polozaj', label: "Položaj", cell: 'string', editable: false}

            ],
            collection: this.vinogradiList
        });

    },
    onRender: function() {
        var render = this.table.render().el;
        this.$("#table").append(render);
        var filter = new Backgrid.Extension.ClientSideFilter({
            collection: this.vinogradiList,
            fields: ['polozaj']
        });
        // Render the filter
        this.$("#search-row").html(filter.render().el);
        this.vinogradiList.fetch();
    },
    choose: function() {
        var selectedModels = this.table.getSelectedModels();
        var model = selectedModels[0] || null;
        V.App.vent.trigger('vinograd:selected', model);
        
    }
});
V.PosudaControl = Marionette.ItemView.extend({
    template: window.JST['/controls/posudaControl.hbs'],
    initialize : function() {
//                var model = this.model.toJSON();
//        model.set('vrsta') this.get('vrsta');   //Postavljamo da li je vino, mošt, masulj, grožđe

    },
    onRender: function() {
         var model = this.model.toJSON();
          //Calculate fill
        var stanje = model.stanje;
        var volumen = model.volumen;
        var popunjenost = Math.round((stanje / volumen) * 100);
        var full = this.$('.full');
        full.css('height', popunjenost + '%');
        //Set wine color
        var vrstaVina = model.sorta.vrsta;
        if (vrstaVina === 'B') {
            full.addClass('white');
        } else if (vrstaVina === 'C') {
            full.addClass('red');
        }
    }
});
function PosudaControl() {
    var width = 200, height = 250, padding = 10, emptyHeight = height-padding* 2,
        emptyWidth = 40;

    function control(posuda) {
        posuda.on("mouseover", function() {
            d3.select(this).select(".box").classed("selected",true)
            ;
        }).on("mouseout", function() {
                d3.select(this).select(".box").classed("selected",false)
            });
        posuda.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("class", "box");
        posuda.append("text")
            .text(function (d) {
                return d.oznaka;
            })
            .attr('x', padding)
            .attr('y', 30);
        posuda.append("text")
            .text(function (d) {
                return d.sortaNaziv;
            })
            .attr('x', padding)
            .attr('y', 60);
        posuda.append("text")
            .text(function (d) {
                return d.vrsta;
            })
            .attr('x', padding)
            .attr('y', 90)
            .attr("class", "volumen");
        posuda.append("text")
            .text(function(d) {return d.stanje;})
            .attr("x", padding)
            .attr("y", 150)
            .attr("class", "stanje");
        posuda.append("text")
            .text(function(d) {return d.volumen;})
            .attr("x", padding)
            .attr("y", 200)
            .attr("class", "volumen");
        posuda.append("rect")
            .attr("style","fill: #EBEBEB;")
            .attr("width", 40)
            .attr("height", emptyHeight)
            .attr("x", width-padding-emptyWidth)
            .attr("y", padding);


        posuda.append("rect")
            .attr("class",function(d) {return d.boja})
            .attr("width", emptyWidth)
            .attr("height", function(d) {
                var fullHeight = d.stanje/ d.volumen * emptyHeight;
                if (fullHeight > emptyHeight) {
                    fullHeight = emptyHeight
                }
                return fullHeight;
            })
            .attr("x", width-padding-emptyWidth)
            .attr("y", function(d) {
                var fullHeight = d.stanje/ d.volumen * emptyHeight;
                if (fullHeight > emptyHeight) {
                    fullHeight = emptyHeight
                }
                return padding + emptyHeight - fullHeight;
            } );
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

}
V.NalogControl = Marionette.ItemView.extend({
    template: window.JST['/controls/nalogControl.hbs'],
    initialize : function() {

    }
});
V.NalogListView = Marionette.CollectionView.extend({
    itemView: V.NalogControl,
    initialize: function () {

        //         this.collection = new V.PreradaList();

    },
    onRender: function () {

    }
});
V.NalogVrsta = Marionette.CompositeView.extend({
   template: window.JST['/controls/nalogVrsta.hbs'],
    itemView: V.NalogControl,
    itemViewContainer: '.nalozi',
    initialize : function() {
        var vrstaKey = 'VRSTA_' + this.model.get('vrsta');
        this.model.set('vrsta', V.Lang[vrstaKey]);

    }
});
V.NalogDialog = Marionette.ItemView.extend({
    template: window.JST['/controls/loading.hbs'],
    templatereal: window.JST['/controls/nalogDialog.hbs'],
    events: {
        'click #modal-choose': 'choose'
    },
    initialize: function() {
        var self = this;
        this.model.fetch({success: function() {
            self.tryRender();
        }})

    },
    tryRender : function() {
        this.template = this.templatereal;
        this.realRender = true;
        this.render();
    },
    onRender: function() {

    },
    choose: function() {


    }
});
V.RadnjaControl = Marionette.ItemView.extend({
    template: window.JST['/controls/loading.hbs'],
    templatereal: window.JST['/controls/nalogDialog.hbs'],
    initialize: function() {

    }
});

/////**
// * Kronološki pregled po mjesecima
// * @type @exp;Y@pro;Base@call;create
// */
//Y.CronoView = Y.Base.create('cronoView', Y.View, [], {
//    template: 'cronoView',
//    resources: Y.Intl.get("controls"),
//    events: {
//        '.more': {click: 'showMore'}
//    },
//    initializer: function() {
//        moment.lang('hr');
//        this.startDate = moment();
//        this.currentDate = this.startDate;
//    },
//    render: function() {
//
//
//        this.fillMonths();
//        return this;
//    },
//    showMore: function(e) {
//        this.fillMonths();
//    },
//    fillMonths: function() {
//        var moreLink = Y.one('.more');
//        if (moreLink) {
//            moreLink.remove(true);
//        }
//        var template = Handlebars.templates[this.template];
//        var output = [];
//        this.preradaList = this.get('model');
//        for (var i = 0; i < 6; ++i) {
////            var preradaControl = new Y.PreradaControl();
////            var control = preradaControl.render().get('container'),
//            content = [];
//            //Filtriraj modele po mjesecima
//            if (this.preradaList) {
//                var filteredPrerade = this.preradaList.fromMonth(this.currentDate.month(), this.currentDate.year());
//                for (var x = 0, y = filteredPrerade.length; x < y; ++x) {
//                    var preradaControl = new Y.PreradaControl({model: filteredPrerade[x]});
//                    var control = preradaControl.render().get('container').getHTML();
//                    content.push({item: control});
//                }
//            }
////            filteredPrerade.each(function(model) {
////
////                var preradaControl = new Y.PreradaControl({model: model});
////                var control = preradaControl.render().get('container').getHTML();
////                content.push({item: control});
////            });
////                var data = {title: this.currentDate.format('MMMM YYYY'), content: [{item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()},
////                {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()},
////                {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()},
////                {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()},
////                {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()},
////                {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()},
////                {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()},
////                {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()},
////                {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}
////                ]};
//            var data = {};
//            data.title = this.currentDate.format('MMMM YYYY');
//            data.content = content;
//            output.push(template(data));
//            this.currentDate.subtract('months', 1);
//        }
//        output.push('<a href="#" class="more" onclick="return false;">More</a>');
//        output = output.join('');
//        var node = Y.Node.create(output);
//        this.get('container').append(node);
//        this.attachEvents();
//    }
//
//}, {
//// Specify attributes and static properties for your View here.
//
//    ATTRS: {
//// Override the default container attribute.
//        container: {
//            valueFn: function() {
//                return Y.Node.create('<div class="crono"/>');
//            }
//        }
//    }
//});
///**
// * Popis vina po sorti
// * @type @exp;Y@pro;Base@call;create
// */
//Y.SortaView = Y.Base.create('sortaView', Y.View, [], {
//    template: 'sortaView',
//    resources: Y.Intl.get("controls"),
//    initializer: function() {
//        moment.lang('hr');
//        this.startDate = moment();
//        this.currentDate = this.startDate;
////        var vrsta = this.get('vrsta');
//    },
//    render: function() {
//        var posudaList = this.get('model');
//        var sortaContainer = {};
//        var sorte = [];
//        var vrsta = this.get('vrsta');
//        if (posudaList) {
//            posudaList.each(function(model) {
//                var json = model.toJSON();
//                var currentSorta = json.sorta.id;
//                if (typeof sortaContainer[currentSorta] === 'undefined') {
//                    sortaContainer[currentSorta] = {};
//                    sortaContainer[currentSorta].title = json.sorta.naziv;
//                    sortaContainer[currentSorta].content = [];
//                    sorte.push(sortaContainer[currentSorta]);
//                }
//                var posudaControl = new Y.PosudaControl({model: model, vrsta: vrsta});
//                var control = posudaControl.render().get('container').getHTML();
//                sortaContainer[currentSorta].content.push({item: control});
//            });
////        var data = {sorta: [{title: 'Škrlet', content: [{item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}]},
////                {title: 'Graševina', content: [{item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}]},
////                {title: 'Cabernet Sauvignon', content: [{item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}]},
////                {title: 'Pinot crni', content: [{item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}, {item: control.getHTML()}]}
////            ]};
//        }
//        var data = {};
//        data.sorta = sorte;
//        var template = Handlebars.templates[this.template];
//        var output = template(data);
////        var node = Y.Node.create(output);
//        this.get('container').append(output);
//        return this;
//    }
//}, {
//    // Specify attributes and static properties for your View here.
//
//    ATTRS: {
//        // Override the default container attribute.
//        container: {
//            valueFn: function() {
//                return Y.Node.create('<div class="sorta"/>');
//            }
//        },
//        //Vino, mošt, masulj, grožđe
//        vrsta: {}
//    }
//});
//Y.PosudaControl = Y.Base.create('PosudaControl', Y.View, [], {
//    template: 'posudaControl',
//    initializer: function() {
//
//    },
//    render: function() {
//        var model = this.get('model').toJSON();
//        model.vrsta = this.get('vrsta');   //Postavljamo da li je vino, mošt, masulj, grožđe
//        var template = Handlebars.templates[this.template];
//        this.get('container').setHTML(template(model));
//        //Calculate fill
//        var stanje = model.stanje;
//        var volumen = model.volumen;
//        var popunjenost = Math.round((stanje / volumen) * 100);
//        var full = this.get('container').one('.full');
//        full.setStyle('height', popunjenost + '%');
//        //Set wine color
//        var vrstaVina = model.sorta.vrsta;
//        if (vrstaVina === 'B') {
//            full.addClass('white');
//        } else if (vrstaVina === 'C') {
//            full.addClass('red');
//        }
//        return this;
//    }
//
//
//}, {
//    ATTRS: {
//        vrsta: {}
//    }
//});
//
//Y.NalogControl = Y.Base.create('NalogControl', Y.View, [], {
//    template: 'nalogControl',
//    initializer: function() {
//
//    },
//    render: function() {
//        var template = Handlebars.templates['nalogControl'];
//        this.get('container').setHTML(template(this.get('model').toJSON()));
//        return this;
//    }
//});
//
//var animations = {}, /* Animation rules keyed by their name */
//		div = '<div>',
//		Node = Y.Node;
//var Spinner = Y.Base.create('Spinner', Y.Widget, [], {
//    initializer: function() {
//        this.get('contentBox').setStyles({position: 'relative'}).setAttribute('aria-role', 'progressbar');
//    },
//    render: function() {
//        this._lines();
//    },
//    _lines: function() {
//        var seg,
//                el = this.get('contentBox'),
//                i = 0,
//                pre = this._getVendorPrefix(),
//                color = this.get('color'),
//                length = this.get('length'),
//                lines = this.get('lines'),
//                opacity = this.get('opacity'),
//                radius = this.get('radius'),
//                speed = this.get('speed'),
//                trail = this.get('trail'),
//                width = this.get('width');
//
//
//        for (; i < lines; i++) {
//
//            seg = Node.create(div).setStyles({
//                position: 'absolute',
//                top: 1 + ~(width / 2) + 'px',
//                transform: 'translate3d(0,0,0)',
//                opacity: opacity
//            });
//
//            seg.setStyle(pre + 'animation', this._addAnimation(opacity, trail, i, lines) + ' ' + 1 / speed + 's linear infinite');
//            seg.appendChild(this._fill(i, length, width, color, lines, radius));
//            el.appendChild(seg);
//        }
//    },
//    _fill: function(i, length, width, color, lines, radius) {
//
//        var node = Node.create(div).setStyles({
//            position: 'absolute',
//            width: (length + width) + 'px',
//            height: width + 'px',
//            background: color,
//            boxShadow: '0 0 1px rgba(0,0,0,.1)',
//            transformOrigin: 'left',
//            transform: 'rotate(' + ~~(360 / lines * i) + 'deg) translate(' + radius + 'px' + ',0)',
//            borderRadius: (width >> 1) + 'px'
//        });
//
//        return node;
//    },
//    _getVendorPrefix: function() {
//        var pre;
//
//        if (Y.UA.webkit) {
//            pre = '-webkit-';
//        }
//        else if (Y.UA.opera) {
//            pre = '-o-';
//        }
//        else if (Y.UA.gecko) {
//            pre = '-moz-';
//        }
//        else {
//            pre = '-ms-';
//        }
//
//        return pre;
//    },
//    _addAnimation: function(alpha, trail, i, lines) {
//        var name = ['opacity', trail, ~~(alpha * 100), i, lines].join('-'),
//                start = 0.01 + i / lines * 100,
//                z = Math.max(1 - (1 - alpha) / trail * (100 - start), alpha),
//                pre = this._getVendorPrefix();
//
//        if (!animations[name]) {
//            var css =
//                    '@' + pre + 'keyframes ' + name + '{' +
//                    '0%{opacity:' + z + '}' +
//                    start + '%{opacity:' + alpha + '}' +
//                    (start + 0.01) + '%{opacity:1}' +
//                    (start + trail) % 100 + '%{opacity:' + alpha + '}' +
//                    '100%{opacity:' + z + '}' +
//                    '}';
//            Y.StyleSheet(css);
//            animations[name] = 1;
//        }
//
//        return name;
//    }
//},
//{
//    ATTRS: {
//        // The number of lines to draw
//        lines: {
//            value: 12
//        },
//        // The length of each line
//        length: {
//            value: 7
//        },
//        // The line thickness
//        width: {
//            value: 4
//        },
//        // The radius of the inner circle
//        radius: {
//            value: 15
//        },
//        // #rgb or #rrggbb
//        color: {
//            value: '#666'
//        },
//        // Rounds per second
//        speed: {
//            value: 1
//        },
//        // Afterglow percentage
//        trail: {
//            value: 100
//        },
//        // Opacity of the trail
//        opacity: {
//            value: 0.25
//        }
//    }
//});
//
//Y.Spinner = Spinner;
