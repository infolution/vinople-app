/* global describe, it */

(function() {
    'use strict';

    describe('Test DAO', function() {
        var foo = false;
        before(function(done) {
            console.log('before every test');
            var schema = V.VinopleSchema;
//        indexedDB.deleteDatabase(schema.datastore);
            var db = new V.IndexedDB();
            db.update(schema, function() {
                console.log("IndexedDB schema updated to version: " + schema.version);
            });
            var sampleData = V.SampleData;

            window.FileSync.syncObject(sampleData, schema);
// simulate async call w/ setTimeout

            setTimeout(function(){
                foo = true;
                done();
            }, 150);
//            var schema = V.VinopleSchema;
//            var db = new V.IndexedDB();
//           db.deleteStore(schema, function() {
//                console.log("IndexedDB schema deleted! ");
//            });
            //Update db;
//            indexedDB.deleteDatabase(schema.datastore);
//            db.update(schema, function() {
//                console.log("IndexedDB schema updated to version: " + schema.version);
//            });
        });
        after(function() {
            console.log('after every test');
            var schema = V.VinopleSchema;
//            indexedDB.deleteDatabase(schema.datastore);
           var schema = V.VinopleSchema;
//            var db = new V.IndexedDB();
//            db.deleteStore(schema, function() {
//                console.log("IndexedDB schema deleted! ");
//            });
        });

        describe('find root grupa', function() {
            it("should pass", function(){
                expect(foo).equals(true);
            });
            it('test 1 ', function(done) {
                expect(foo).equals(true);
                var repromaterijal = new V.Grupa({id: '399cb45b-234a-4ba0-8a35-8f45b7840b57'});
                repromaterijal.fetch({success: function(model) {

                    var success= function(grupa) {
                        console.log('fetched root grupa');
                        done();
                        expect(grupa.get('shortName')).to.equal('E');
                    };
                    model.findRootGrupa(success);

                }, error: function(model, error) {
                    console.log(error);
                    done();
                }});

        });

        });



    });
})();