V.CronoModel = Backbone.Model.extend({
});
V.CronoView = Marionette.CollectionView.extend({
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
    initialize: function () {
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
    onRender: function () {
//        this.$el.hide();
//        _.defer(_.bind(this.transitionIn_, this))
//        //        tjo
//        var cronoView = new V.CronoView();
//        var render = cronoView.render().el;
//        this.$("#prerade").html(render);
        var el = this.el;
    },
    showMore: function (e) {
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
    rowFocused: function () {
        this.el.style.backgroundColor = this.highlightColor;
    },
    rowLostFocus: function () {
        delete this.el.style.backgroundColor;
    }
});

V.PartnerSelector = Marionette.ItemView.extend({
    template: window.JST['/controls/partnerSelector.hbs'],
    events: {
        'input #search': 'filter',
        'click #selector-items li': 'choose'
    },
    initialize: function () {
        this.partnerList = new V.PartnerList();
//        this.table = new Backgrid.Grid({
//            columns: [
//                {name: '', label: "", cell: 'select-row', editable: false, headerCell: 'select-all'},
//                {name: 'naziv', label: "Naziv", cell: 'string', editable: false}
//            ],
//            collection: this.partnerList
//        });
    },
    onRender: function () {
//        var render = this.table.render().el;
//        this.$("#table").append(render);
//        var filter = new Backgrid.Extension.ClientSideFilter({
//            collection: this.partnerList,
//            fields: ['naziv']
//        });
//        // Render the filter
//        this.$("#search-row").html(filter.render().el);

        var self = this;
        this.partnerList.fetch({success: function (list) {
            self.d3(self.partnerList.toJSON());
        }});
    },
    d3: function (partnerList) {
        var sorted = this.sorted = partnerList.sort(function (a, b) {
            return a.naziv <= b.naziv ? -1 : 1;
        });
        var ul = this.ul = d3.select(this.el).select("#selector-items").append("ul").attr("class", "partneri");
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
    choose: function (e) {
        var model = e.currentTarget.__data__;
        V.App.vent.trigger('partner:selected', model);

    }
});
V.SortaSelector = Marionette.ItemView.extend({
    template: window.JST['/controls/sortaSelector.hbs'],
    events: {
        'input #search': 'filter',
        'click #selector-items li': 'choose'
    },
    initialize: function () {

    },
    onRender: function () {
        var self = this;
        var sortaList = new V.SortaList();
        sortaList.fetch({success: function (list) {
            self.d3(sortaList.toJSON());
        }});
    },
    d3: function (sortaList) {
        var sorted = this.sorted = sortaList.sort(function (a, b) {
            return a.naziv <= b.naziv ? -1 : 1;
        });
        var ul = this.ul = d3.select(this.el).select("#selector-items").append("ul").attr("class", "sorte");
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
    choose: function (e) {
        var model = e.currentTarget.__data__;
        V.App.vent.trigger('sorta:selected', model);

    }
});
V.VinogradSelector = Marionette.ItemView.extend({
    template: window.JST['/controls/vinogradSelector.hbs'],
    events: {
        'input #search': 'filter',
        'click #selector-items li': 'choose'
    },
    initialize: function () {


    },
    onRender: function () {
        var self = this;
        var vinogradList = new V.VinogradList();
        vinogradList.fetch({success: function (list) {
            self.d3(vinogradList.toJSON());
        }});
    },
    d3: function (vinogradList) {
        var sorted = this.sorted = vinogradList.sort(function (a, b) {
            return a.polozaj <= b.polozaj ? -1 : 1;
        });
        var ul = this.ul = d3.select(this.el).select("#selector-items").append("ul").attr("class", "vinogradi");
        ul.selectAll("li").data(sorted)
            .enter().append("li")
            .attr("data-id", function (d) {
                return d.id
            })
            .html(function (d) {
                return d.polozaj
            });
    },
    filter: function (e) {
        var query = e.currentTarget.value.toLowerCase();
        var filtered = this.sorted.filter(function (d) {
            if (d.polozaj.toLowerCase().indexOf(query) > -1) {
                return true;
            }
        });
        var li = this.ul.selectAll("li").data(filtered)
            .attr("data-id", function (d) {
                return d.id
            })
            .html(function (d) {
                return d.polozaj
            });
        li.enter().append("li")
            .attr("data-id", function (d) {
                return d.id
            })
            .html(function (d) {
                return d.polozaj
            });
        li.exit()
            .attr("data-id", function (d) {
                return d.id
            })
            .html(function (d) {
                return d.polozaj
            })
            .remove();
    },
    choose: function (e) {
        var selectedModel = e.currentTarget.__data__;
        V.App.vent.trigger('vinograd:selected', selectedModel);
    }
});
//V.PosudaControl = Marionette.ItemView.extend({
//    template: window.JST['/controls/posudaControl.hbs'],
//    initialize : function() {
////                var model = this.model.toJSON();
////        model.set('vrsta') this.get('vrsta');   //Postavljamo da li je vino, mošt, masulj, grožđe
//
//    },
//    onRender: function() {
//         var model = this.model.toJSON();
//          //Calculate fill
//        var stanje = model.stanje;
//        var volumen = model.volumen;
//        var popunjenost = Math.round((stanje / volumen) * 100);
//        var full = this.$('.full');
//        full.css('height', popunjenost + '%');
//        //Set wine color
//        var vrstaVina = model.sorta.vrsta;
//        if (vrstaVina === 'B') {
//            full.addClass('white');
//        } else if (vrstaVina === 'C') {
//            full.addClass('red');
//        }
//    }
//});
V.PosudaControl = function () {
    var width = 200, height = 250, padding = 10, emptyHeight = height - padding * 2,
        emptyWidth = 40;

    function control(posuda) {
        posuda.on("mouseover",function () {
            d3.select(this).select(".box").classed("selected", true)
            ;
        }).on("mouseout", function () {
                d3.select(this).select(".box").classed("selected", false)
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
            .text(function (d) {
                return d.stanje;
            })
            .attr("x", padding)
            .attr("y", 150)
            .attr("class", "stanje");
        posuda.append("text")
            .text(function (d) {
                return d.volumen;
            })
            .attr("x", padding)
            .attr("y", 200)
            .attr("class", "volumen");
        posuda.append("rect")
            .attr("style", "fill: #EBEBEB;")
            .attr("width", 40)
            .attr("height", emptyHeight)
            .attr("x", width - padding - emptyWidth)
            .attr("y", padding);


        posuda.append("rect")
            .attr("class", function (d) {
                return d.boja
            })
            .attr("width", emptyWidth)
            .attr("height", function (d) {
                var fullHeight = d.stanje / d.volumen * emptyHeight;
                if (fullHeight > emptyHeight) {
                    fullHeight = emptyHeight
                }
                return fullHeight;
            })
            .attr("x", width - padding - emptyWidth)
            .attr("y", function (d) {
                var fullHeight = d.stanje / d.volumen * emptyHeight;
                if (fullHeight > emptyHeight) {
                    fullHeight = emptyHeight
                }
                return padding + emptyHeight - fullHeight;
            });
    }

    control.width = function (value) {
        if (!arguments.length) return width;
        width = value;
        return control;
    };
    control.height = function (value) {
        if (!arguments.length) return height;
        height = value;
        return control;
    };
    return control;

};
//V.NalogControl = Marionette.ItemView.extend({
//    template: window.JST['/controls/nalogControl.hbs'],
//    initialize: function () {
//
//    }
//});
V.NalogControl = function () {
    var width = 250, height = 150, padding = 10, margin = 10, lineheight = 22;


    function control(nalog) {
        nalog.on("mouseover",function () {
            d3.select(this).select(".box").classed("selected", true)
            ;
        }).on("mouseout", function () {
                d3.select(this).select(".box").classed("selected", false)
            });
        nalog.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("class", "box");
        var primkaText = nalog.append("text")  //broj
            .attr("x", padding)
            .attr("y", padding)
            .attr("dy", ".71em")
            .attr("class", "subtitle")
            .text(function (d) {
                return d.broj
            });
        nalog.append("text")   //datum
            .attr("x", width - padding)
            .attr("y", padding)
            .attr("dy", ".71em")
            .attr("class", "subtitle")
            .attr("text-anchor", "end")
            .text(function (d) {
                return moment(d.datumIzvrsenja).format('DD.MM.YYYY')
            });
        nalog.append("rect")  //titleContainer
            .attr("x", padding)
            .attr("y", padding + lineheight)
            .attr("width", width - padding * 2)
            .attr("height", lineheight * 2)
            .attr("fill", "#BBDDE9");
        nalog.append("text")   //vrsta
            .attr("x", width / 2)
            .attr("y", padding + lineheight * 2)
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .attr("class", "title")
            .text(function (d) {
                return d.nalogVrsta
            });

    }

    control.width = function (value) {
        if (!arguments.length) return width;
        width = value;
        return control;
    };
    control.height = function (value) {
        if (!arguments.length) return height;
        height = value;
        return control;
    };
    return control;

};
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
    initialize: function () {
        var vrstaKey = 'VRSTA_' + this.model.get('vrsta');
        this.model.set('vrsta', V.Lang[vrstaKey]);

    }
});
V.RadnjaAnaliza = function () {
    var width = 500, height = 250, padding = 10;

    function control(radnja) {
        radnja.append("text")
            .text(function (d) {
                return d.rb;
            })
            .attr('x', padding)
            .attr('y', 30);
        radnja.append("text")
            .text(function (d) {
                return d.tip;
            })
            .attr('x', padding + 30)
            .attr('y', 30);
        radnja.append("text")
            .text(function (d) {
                return d.posuda1.oznaka;
            })
            .attr('x', padding + 130)
            .attr('y', 30);
        radnja.append("text")
            .text(function (d) {
                return d.parametar.naziv;
            })
            .attr('x', padding + 180)
            .attr('y', 30);
        radnja.append("text")
            .text(function (d) {
                return d.kolicina;
            })
            .attr('x', padding + 300)
            .attr('y', 30);
        radnja.append("text")
            .text(function (d) {
                return d.parametar.jedinica;
            })
            .attr('x', padding + 350)
            .attr('y', 30);

    }

    control.width = function (value) {
        if (!arguments.length) return width;
        width = value;
        return control;
    };
    control.height = function (value) {
        if (!arguments.length) return height;
        height = value;
        return control;
    };
    return control;
};
V.RadnjaPretok = function () {
    var width = 500, height = 250, padding = 10;

    function control(radnja) {
        radnja.append("text")
            .text(function (d) {
                return d.rb;
            })
            .attr('x', padding)
            .attr('y', 30);
        radnja.append("text")
            .text(function (d) {
                return d.tip;
            })
            .attr('x', padding + 30)
            .attr('y', 30);
        radnja.append("text")
            .text(function (d) {
                if (typeof d.posuda1 !== 'undefined' && d.posuda1 !== null) {
                    return d.posuda1.oznaka;
                }
                return '';
            })
            .attr('x', padding + 130)
            .attr('y', 30);
        radnja.append("text")
            .text(function (d) {
                if (typeof d.posuda2 !== 'undefined' && d.posuda2 !== null) {
                    return d.posuda2.oznaka;
                }
                return '';
            })
            .attr('x', padding + 230)
            .attr('y', 30);
        radnja.append("text")
            .text(function (d) {
                return d.kolicina;
            })
            .attr('x', padding + 300)
            .attr('y', 30);
    }

    control.width = function (value) {
        if (!arguments.length) return width;
        width = value;
        return control;
    };
    control.height = function (value) {
        if (!arguments.length) return height;
        height = value;
        return control;
    };
    return control;
};
V.RadnjaMuljanje = function () {
    var width = 500, height = 250, padding = 10;

    function control(radnja) {
        radnja.append("text")
            .text(function (d) {
                return d.rb;
            })
            .attr('x', padding)
            .attr('y', 30);
        radnja.append("text")
            .text(function (d) {
                return d.tip;
            })
            .attr('x', padding + 30)
            .attr('y', 30);

    }

    control.width = function (value) {
        if (!arguments.length) return width;
        width = value;
        return control;
    };
    control.height = function (value) {
        if (!arguments.length) return height;
        height = value;
        return control;
    };
    return control;
};
V.RadnjaPresanje = function () {
    var width = 500, height = 250, padding = 10;

    function control(radnja) {
        radnja.append("text")
            .text(function (d) {
                return d.rb;
            })
            .attr('x', padding)
            .attr('y', 30);
        radnja.append("text")
            .text(function (d) {
                return d.tip;
            })
            .attr('x', padding + 30)
            .attr('y', 30);

    }

    control.width = function (value) {
        if (!arguments.length) return width;
        width = value;
        return control;
    };
    control.height = function (value) {
        if (!arguments.length) return height;
        height = value;
        return control;
    };
    return control;
};
V.NalogDialog = Marionette.ItemView.extend({
    template: window.JST['/controls/loading.hbs'],
    templatereal: window.JST['/controls/nalogDialog.hbs'],
    controls: {
        'ANALIZA': V.RadnjaAnaliza(),
        'PRETOK': V.RadnjaPretok(),
        'MULJANJE': V.RadnjaMuljanje(),
        'PRESANJE': V.RadnjaPresanje()
    },
    events: {
        'click #modal-choose': 'choose'
    },
    initialize: function () {
        var self = this;
        this.model.fetch({success: function (model) {
            var radnje = self.model.get('radnje');
            var promises = [];
            for (var i = 0, j = radnje.length; i < j; ++i) {
                var radnja = radnje[i];
                promises.push(self.fetchData(radnja));

            }
            Q.all(promises).then(function () {
                self.tryRender();
            });

        }})

    },
    fetchData: function (radnja) {
        var deferred = Q.defer();
        var promises = [];
        if (typeof radnja.posuda1 !== 'undefined' && radnja.posuda1 !== null) {
            var posuda1 = new V.Posuda({id: radnja.posuda1});

            promises.push(posuda1.getModel());
            promises[promises.length - 1].then(function (result) {
                radnja.posuda1 = result.toJSON();
            });
        }

        if (typeof radnja.posuda2 !== 'undefined' && radnja.posuda2 !== null) {
            var posuda2 = new V.Posuda({id: radnja.posuda2});

            promises.push(posuda2.getModel());
            promises[promises.length - 1].then(function (result) {
                radnja.posuda2 = result.toJSON();
            });
        }

        if (typeof radnja.parametar !== 'undefined' && radnja.parametar !== null) {
            var parametar = new V.Parametar({id: radnja.parametar});

            promises.push(parametar.getModel());
            promises[promises.length - 1].then(function (result) {
                radnja.parametar = result.toJSON();
            });
        }


        return promises;
    },
    tryRender: function () {
        this.template = this.templatereal;
        this.realRender = true;
        this.render();
    },
    onRender: function () {
        if (this.realRender) {
            this.d3(this.model.get('radnje'));
        }
    },
    d3: function (radnje) {
        var self = this;
//        var containerWidth = this.$("#radnje").width();
        var containerWidth = "100%";
        var canvasWidth = containerWidth, canvasHeight = radnje.length * 100, canvasPadding = 20, margin = 10;
        var canvas = this.canvas = d3.select(this.el).select("#radnje").append("svg")
            .attr("width", containerWidth).attr("height", canvasHeight);

        var radnja = canvas.selectAll("g").data(radnje)
            .enter().append("g")
            .attr("class", "radnja")
            .attr("transform", function (d, i) {

                return "translate(0," + i * (50 + margin) + ")";

            });

        canvas.selectAll(".radnja").each(function(d) {
            var tip = d.tip;
            var control = self.controls[tip];
            d3.select(this).append("g").attr("class",tip)
                .call(control);
        });


    },
    choose: function () {


    }
});

V.SredstvoAction = function() {
    var text = 'Sredstvo';
    function control() {

    };
    control.text = function (value) {
        if (!arguments.length) return text;
        text = value;
        return control;
    };
    control.action = function() {
        alert('Dodajem sredstvo');
        d3.event.preventDefault();
    };

    return control;
};
V.AnalizaAction = function() {
    var text = 'Analiza';
    function control() {

    };
    control.text = function (value) {
        if (!arguments.length) return text;
        text = value;
        return control;
    };
    control.action = function() {
        alert('Radim analizu');
        d3.event.preventDefault();
    };

    return control;
};
V.PretokAction = function() {
    var text = 'Pretok';
    function control() {

    };
    control.text = function (value) {
        if (!arguments.length) return text;
        text = value;
        return control;
    };
    control.action = function() {
        alert('Radim pretok');
        d3.event.preventDefault();
    };

    return control;
};
