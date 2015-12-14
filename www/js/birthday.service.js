(function() {

    angular.module('starter')
        .factory('BirthdayService', ['$q', 'Loki', '$firebaseArray', BirthdayService]);

    function BirthdayService($q, Loki, $firebaseArray) {
        var _db;
        var _birthdays;
        var _ref = new Firebase("https://scm-loki.firebaseio.com/");
        var _bdRef = _ref.child('birthdays');
        var _bd = $firebaseArray(_bdRef);

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

                    if (!_birthdays) {
                        _birthdays = _db.addCollection('birthdays');
                    }

                    resolve(_birthdays.data);
                });
            });
        };

        function addBirthday(birthday) {
            _birthdays.insert(birthday);
            _bd.$add(birthday)
                .then(oK)
                .catch(eR);
        };

        function oK(res) {
            console.log('ok', res);
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

        return {
            initDB: initDB,
            getAllBirthdays: getAllBirthdays,
            addBirthday: addBirthday,
            updateBirthday: updateBirthday,
            deleteBirthday: deleteBirthday,
            getBdArray: getBdArray
        };
    }
})();
