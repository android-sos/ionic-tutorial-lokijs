(function() {

    angular.module('starter').factory('BirthdayService', ['$q', 'Loki', BirthdayService]);

    function BirthdayService($q, Loki) {
        var _db;
        var _birthdays;

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
        };

        function updateBirthday(birthday) {
            _birthdays.update(birthday);
        };

        function deleteBirthday(birthday) {
            _birthdays.remove(birthday);
        };

        return {
            initDB: initDB,
            getAllBirthdays: getAllBirthdays,
            addBirthday: addBirthday,
            updateBirthday: updateBirthday,
            deleteBirthday: deleteBirthday
        };
    }
})();
