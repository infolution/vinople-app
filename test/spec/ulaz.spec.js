/* global describe, it */

(function() {
    'use strict';

    describe('Test Ulaz', function() {
        var foo = false;
        before(function(done) {
            console.log('before every test');
            var schema = V.VinopleSchema;
//           var schema = V.VinopleSchema;
//        indexedDB.deleteDatabase(schema.datastore);
            var db = new V.IndexedDB();
//            db.update(schema, function() {
//                console.log("IndexedDB schema updated to version: " + schema.version);
//            });
            var sampleData = V.SampleData;
            var grupaGrozde = new V.System({key: 'GRUPA_GROZDE'});
            grupaGrozde.fetch({error: function(model,error) {
                grupaGrozde.set('value','bd3e1450-2927-4e93-8d11-bce22f914358');
                grupaGrozde.save();
            }});
            var grupaMasulj = new V.System({key: 'GRUPA_MASULJ'});
            grupaMasulj.fetch({error: function(model,error) {
                grupaMasulj.set('value','2b40ae02-5fc2-4a23-b749-149815850ad2');
                grupaMasulj.save();
            }});
            var grupa = new V.System({key: 'GRUPA_MOST'});
            grupa.fetch({error: function(model,error) {
                grupa.set('value','3c3685cc-fe14-4b64-8b20-b596f6c4a32c');
                grupa.save();
            }});
            grupa = new V.System({key: 'GRUPA_VINO'});
            grupa.fetch({error: function(model,error) {
                grupa.set('value','59f62fe7-754f-49f8-a245-9fe1334f1417');
                grupa.save();
            }});
//            window.FileSync.syncObject(sampleData, schema);
// simulate async call w/ setTimeout

            setTimeout(function(){
                foo = true;
                done();
            }, 250);
        });
        after(function() {
            console.log('after every test');
//           var schema = V.VinopleSchema;
//            var db = new V.IndexedDB();
//            db.deleteStore(schema, function() {
//                console.log("IndexedDB schema deleted! ");
//            });
        });
        describe('save Zaprimanje', function() {
            it("should pass", function(){
                expect(foo).equals(true);
            });
            it('Primka ', function(done) {
                var preradaId = null;
                var model = new V.Prerada({id: preradaId});
                var panel = new V.PreradaPanel({model: model});
                expect(model.get('id')).equals(panel.model.get('id'));
                var data = {};
                data.id = uuid.v4();
                data.vinogradId = '063e35b6-df54-4bcb-bbaa-adfa89fa3e81';
                data.partnerId = 'fdb1145f-4227-4cff-b563-93e943a0e322';
                data.sortaId = '5e517ac2-e66a-46e8-8ca2-f1cd49d64647';
                data.datum = moment().valueOf();
                data.kolicinaNetto = 2500;
                data.cijena = 4;
                data.iznos = 10000;
                data.vrsta = 'G';
                data.godinaBerbe = 2013;
                data.jm = 'kg';
                panel.saveZaprimanje(data, function() {
                    done();
                });


        });

        });



    });
})();