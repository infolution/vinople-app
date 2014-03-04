V.Start = Marionette.ItemView.extend({
    template: window.JST['/start/startView.hbs'],
    initialize: function () {

    },
    onRender: function () {
        var months = ["Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj", "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"];
        this.d3 = d3.select(this.el);

        var svg = this.d3.append("svg").attr("width", "100%").attr("height", "100%");
        this.d3.selectAll("div").data(months).enter().append("div");


    }
});





