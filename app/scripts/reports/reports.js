V.Reports = V.Reports || {};
V.Reports.Base = Marionette.ItemView.extend({
    events: {
        'click #printBtn': 'print',
        'click #pdfBtn': 'download'
    },
    print: function(e) {
        window.print();
        e.preventDefault();
    },
    download: function(e) {
        window.print();
        e.preventDefault();
    }
});
V.Reports.UlazPremaPartneru = V.Reports.Base.extend({
    template: window.JST['/reports/ulazPremaPartneru.hbs']

});
V.Reports.UlazPremaSorti = V.Reports.Base.extend({
    template: window.JST['/reports/ulazPremaSorti.hbs']

});

