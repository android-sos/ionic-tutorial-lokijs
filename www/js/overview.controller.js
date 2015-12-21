var v, bs;
(function() {
    angular.module('starter')
        .controller('OverviewController', ['$scope', '$ionicModal', '$ionicPlatform', 
            'BirthdayService','$timeout', OverviewController]);

    function OverviewController($scope, $ionicModal, $ionicPlatform, birthdayService,$timeout) {
        var vm = this;
        v = vm;
        bs = birthdayService;
        vm.online = true;
        vm.fb = birthdayService.getBdArray();
        vm.isSync = isSync;
        vm.emulateFb = emulateFb;
        vm.emu = [];
        // $ionicPlatform.ready(function() {

        //     // Initialize the database.
        //     birthdayService.initDB();

        //     // Get all birthday records from the database.
        //     birthdayService.getAllBirthdays()
        //         .then(function(birthdays) {
        //             vm.birthdays = birthdays;
        //         });
        // });

        vm.fb.$loaded()
            .then(function(res) {
                console.info('loaded from controlller');

                $timeout(function(){
                    console.info('timeout');
                    vm.emu = res;
                }, 2000);
                
            })

        function isSync(key) {
            if (birthdayService.getTempById(key)) {
                return true;
            } else {
                return false;
            }

        }

        function emulateFb(lokiObj) {
            if (lokiObj.fbVal) {
                console.log('lokiObj', lokiObj);
                lokiObj.fbVal.$id = lokiObj.fbKey;
            }
        }


        function activate() {
            birthdayService.getBirthdays()
                .then(function(birthdays) {
                    console.log('birthday received');
                    vm.birthdays = birthdays;
                    vm.emu=birthdays;
                });

            birthdayService.getTemp()
                .then(function(temp) {
                    vm.temp = temp;
                });
        }

        activate();

        // Initialize the modal view.
        $ionicModal.fromTemplateUrl('add-or-edit-birthday.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });

        vm.showAddBirthdayModal = function() {
            $scope.birthday = {};
            $scope.action = 'Add';
            $scope.isAdd = true;
            $scope.modal.show();
        };

        vm.showEditBirthdayModal = function(birthday) {
            $scope.birthday = birthday;
            $scope.action = 'Edit';
            $scope.isAdd = false;
            $scope.modal.show();
        };

        vm.setOnline = function(online) {
            if (online) {
                Firebase.goOnline();
            } else {
                Firebase.goOffline();
            }
        };

        $scope.saveBirthday = function() {
            if ($scope.isAdd) {
                birthdayService.addBirthday($scope.birthday);
            } else {
                birthdayService.updateBirthday($scope.birthday);
            }
            $scope.modal.hide();
        };

        $scope.deleteBirthday = function() {
            birthdayService.deleteBirthday($scope.birthday);
            $scope.modal.hide();
        };

        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });

        return vm;
    }
})();
