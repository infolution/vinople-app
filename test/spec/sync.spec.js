/* global describe, it */

(function() {
    'use strict';

    describe('Test Vinople Sync', function() {
        before(function() {
            console.log('before every test');
            var schema = V.VinopleSchema;
            var db = new V.IndexedDB();
//           db.deleteStore(schema, function() {
//                console.log("IndexedDB schema deleted! ");
//            });
            //Update db;
            indexedDB.deleteDatabase(schema.datastore);
            db.update(schema, function() {
                console.log("IndexedDB schema updated to version: " + schema.version);
            });
        });
        after(function() {
            console.log('after every test');
//           var schema = V.VinopleSchema;
//            var db = new V.IndexedDB();
//            db.deleteStore(schema, function() {
//                console.log("IndexedDB schema deleted! ");
//            });
        });
        describe.skip('Read', function() {

            it('LoginUser', function(done) {
                var list = new V.LoginUserList();
                list.fetch();
                list.on('sync', function(model) {
                    expect(list.length).to.equal(0);
                    done();
                });
            });
        });
        describe.skip('Write than Read', function() {
            var lu = {fullName: 'Mislav Kašner', email: 'mislav@emgd.hr', password: 'soad6ff', active: true};
            var model = new V.LoginUser(lu);

            it('LoginUser', function(done) {
                model.save();
                var list = new V.LoginUserList();
                list.fetch();
                list.on('sync', function(model) {
                    expect(list.length).to.equal(1);
                    done();
                });
            });
        });
        
    });
})();