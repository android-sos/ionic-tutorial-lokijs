var db, birthdays, fbA, tm, temp;
(function() {

    angular.module('starter')
        .factory('BirthdayService', ['$q', 'Loki', '$firebaseArray', '$timeout',
            '$interval', '$ionicPlatform', BirthdayService
        ]);

    function BirthdayService($q, Loki, $firebaseArray, $timeout, $interval, $ionicPlatform) {


        var _db;
        var _birthdays;
        var _alreadyLoad = null;
        var _temp;
        var _ref = new Firebase("https://scm-loki.firebaseio.com/");
        var _bdRef = _ref.child('birthdays');
        var _bd = $firebaseArray(_bdRef);
        var wait = null;
        var loading = null;

        _bd.$loaded()
            .then(function(res) {
                console.log('array loaded', res);
            })
            .catch(function(err) {
                console.log('cant loaded info from fb', err);
            });

        fbA = _bd;

        /* tm = $timeout(function() {
            console.log('timeout fn', tm);
            tm = null;
            console.log('timeout fn', tm);
        }, 5000);
*/

        // console.log('asignado tm', tm);

        function initDB() {


            var options = {
                autosave: true,
                autosaveInterval: 1000
            };


            if (ionic.Platform.isAndroid() || ionic.Platform.isIOS()) {
                var fsAdapter = new LokiCordovaFSAdapter({
                    "prefix": "loki"
                });
                options.adapter = fsAdapter;
            }
            _db = new Loki('birthdaysDB', options);
            db = _db;
        }


        function isDbLoad() {
            return $q(function(resolve, reject) {
                if (_alreadyLoad) {
                    resolve();
                } else {
                    if (loading) {
                        validateLoadDb(resolve, reject);
                    } else {
                        loading = true;
                        $ionicPlatform.ready()
                            .then(function() {
                                console.info('platform ready');
                                initDB();
                                return true;
                            })
                            .then(function() {
                                _db.loadDatabase(options, function() {
                                    _alreadyLoad = true;
                                    loading = false;
                                    validateBirthDayCollection();
                                    validateTempCollection();
                                    resolve();
                                });
                            }).catch(function(err) {
                                console.error('cant load db', err);
                                reject(err);
                            });

                    }
                    var options = {
                        birthdays: {
                            proto: Object,
                            inflate: function(src, dst) {
                                var prop;
                                for (prop in src) {
                                    if (prop === 'Date') {
                                        dst.Date = new Date(src.Date);
                                    } else {
                                        dst[prop] = src[prop];
                                    }
                                }
                            }
                        }
                    };

                }


            });
        }

        function validateLoadDb(resolve, reject) {
            if (_alreadyLoad) {
                resolve();
            } else {
                $timeout(validateLoadDb, 20, false, resolve, reject);
            }

        }

        function validateBirthDayCollection() {
            _birthdays = _db.getCollection('birthdays');
            if (!_birthdays) {
                _birthdays = _db.addCollection('birthdays', {
                    indices: ['fbKey'],
                    clone: true
                });
                _birthdays.ensureUniqueIndex('fbKey');
            }

            var isEnabled = true;
            _birthdays.setChangesApi(isEnabled);
            birthdays = _birthdays;
        }

        function validateTempCollection() {
            _temp = _db.getCollection('temp');



            if (!_temp) {
                _temp = _db.addCollection('temp', {
                    indices: ['fbKey'],
                    clone: true
                });
                _temp.ensureUniqueIndex('fbKey');

                //ejemplo de como obtener el registro
                // temp.by('fbKey',"-K5fLRn_P7GM1VceDQTa")
            }

            temp = _temp;
            trySync();
        }

        function trySync() {
            _temp.data.forEach(function(obj, i) {
                console.log(obj, i);
                _bdRef.child(obj.fbKey).set(obj.fbVal, syncCb(obj.fbKey));
            });
        }

        function syncCb(fbKey) {

            function cbFb(error) {
                if (error) {
                    console.error('error');
                } else {

                    console.log('inserted  to sync', fbKey);

                    /* $timeout(function() {
                         removeTempbyId(fbKey);
                     }, 100);*/

                    $timeout(removeTempbyId, 100, true, fbKey);
                    // removeTempbyId(fbKey);

                }
            }

            return cbFb;
            // body...
        }

        function getBirthdays() {
            return isDbLoad()
                .then(dbOK);

            function dbOK() {
                return _birthdays.data;
            }
        }

        function getTemp() {
            return isDbLoad()
                .then(dbOK);

            function dbOK() {
                return _temp.data;
            }
        }



        function getAllBirthdays() {
            return $q(function(resolve, reject) {

                var options = {
                    birthdays: {
                        proto: Object,
                        inflate: function(src, dst) {
                            var prop;
                            for (prop in src) {
                                if (prop === 'Date') {
                                    dst.Date = new Date(src.Date);
                                } else {
                                    dst[prop] = src[prop];
                                }
                            }
                        }
                    }
                };

                _db.loadDatabase(options, function() {
                    _birthdays = _db.getCollection('birthdays');
                    _temp = _db.getCollection('temp');

                    if (!_birthdays) {
                        _birthdays = _db.addCollection('birthdays');
                    }

                    if (!_temp) {
                        _temp = _db.addCollection('temp', {
                            indices: ['fbKey']
                        });
                        _temp.ensureUniqueIndex('fbKey');

                        //ejemplo de como obtener el registro
                        // temp.by('fbKey',"-K5fLRn_P7GM1VceDQTa")
                    }
                    var isEnabled = true;
                    _birthdays.setChangesApi(isEnabled);
                    birthdays = _birthdays;
                    temp = _temp;

                    resolve(_birthdays.data);
                });
            });
        };



        function addBirthday(birthday) {


            var before = _bd.length - 1;
            var o = _bd.$add(birthday)
                .then(oK)
                .catch(eR);


            console.log(_bd);
            //TODO puedo asumir que el que ingreso siempre sera el ultimo???


            validateIndex(before, birthday);


        };

        function validateIndex(before, birthday) {
            var lastIndex = _bd.length - 1;
            console.log('lastIndex', lastIndex, 'before', before, 'birthday', birthday);
            if (lastIndex > before) {
                console.log('ejecutada');
                validateInserted(lastIndex, birthday);
            } else {
                console.log('otro timeout');
                var tm = $timeout(validateIndex, 5, false, before, birthday);
            }
        }

        function validateInserted(lastIndex, birthday) {
            //TODO, POR QUE recien ccreado no me cogio el valor del array sera que necesita un timeuout??
            var key = _bd.$keyAt(lastIndex);

            birthday.$id = key;
            // var birthday = _bd.$getRecord(key);
            var newObj = {
                fbKey: key,
                fbVal: birthday
            };
            console.log(lastIndex, _bd[lastIndex], key, newObj);
            _birthdays.insert(newObj);
            _temp.insert(newObj);
        }

        function oK(ref) {
            var fbKey = ref.key();
            console.log('ok', fbKey, ref);
            removeTempbyId(fbKey);
        }

        function eR(error) {
            console.error(error);
        }

        function updateBirthday(birthday) {
            _birthdays.update(birthday);
        };

        function deleteBirthday(birthday) {
            _birthdays.remove(birthday);
        };

        function getBdArray() {
            return _bd;
        }

        function removeTempbyId(fbKey) {
            _temp.removeWhere({
                'fbKey': fbKey
            });
        }


        function syncFb() {

        }

        function getTempById(key) {

            // $timeout(function() {
            var obj = temp.by('fbKey', key);
            // console.log('obj', obj);
            return obj;
            // }, 200);

        }

        return {
            initDB: initDB,
            getAllBirthdays: getAllBirthdays,
            addBirthday: addBirthday,
            updateBirthday: updateBirthday,
            deleteBirthday: deleteBirthday,
            getBdArray: getBdArray,
            getBirthdays: getBirthdays,
            getTemp: getTemp,
            getTempById: getTempById

        };
    }
})();
