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

V.Login = Marionette.ItemView.extend({
    template: window.JST['/start/login.hbs'],
    events: {
        'submit #loginForm': 'login'
    },
    initialize: function () {

    },
    onRender: function () {
        var clientid = this.clientid = window.localStorage.clientid;
        if (typeof clientid === 'undefined') {

        } else {
            this.$('.firstlogin').hide();
        }

    },
    login: function (e) {
        e.preventDefault();
        if (typeof this.clientid !== 'undefined') {
            var data = $(e.currentTarget).serializeObject();

            //Radi lokalni login
            var user = new V.LoginUser({username: data.username});
            user.getModel().then(function (model) {

                if (model != null) {
                    //Check password
                    if (data.password === model.get('password')) {
                        this.$('#status').html('Logging in...');
                        //Mark logged in
                        window.sessionStorage.apikey = "1";
                        location.reload();
                    } else {
                        this.$('#status').html('Wrong username or password');
                    }
                }

            }).catch(function (error) {
                    this.$('#status').html('Wrong username or password');
                }).done();
        } else {
            //Radi login preko servera
            var data = $('#loginForm').serialize();
            var password = $('#password').val();
            var salt = "vatapi";
            var mypbkdf2 = new PBKDF2(password, salt, 1, 64);
            var status_callback = function (percent_done) {
                $('#status').html('<img src="/img/ajax-loader.gif" alt="ajax loader" /> Logging in... ');
            };
            var result_callback = function (key) {
                data = data.replace("password=" + password, "password=" + key);
                //$('#status').html("The derived key is: " + key);
                $.ajax({
                        url: V.App.apiurl + '/login/',
                        data: data,
                        success: function (res) {
                            console.log('Response received. ' + res);
                            window.localStorage.clientid = res.clientid;
                            window.sessionStorage.session = res.session;

                        },
                        dataType: "jsonp",
                        jsonp: "callback"

                    }
                );
            };
            mypbkdf2.deriveKey(status_callback, result_callback);
        }

    }

});
V.Logout = Marionette.ItemView.extend({
    template: window.JST['/start/logout.hbs'],

    initialize: function () {
        delete window.sessionStorage.apikey;
        $('body').html(this.render().el);
    },
    onRender: function () {
        V.App.removeRegion('header');
        V.App.removeRegion('container');

//        V.App.header.reset();

    }

});





