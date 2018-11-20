(function () {
    'use strict';
    angular
        .module('notifications', [])
        .controller('notificationCtrl', notificationCtrl);

    notificationCtrl.$inject = ['$location', '$scope', '$rootScope', 'notificationService', '$timeout'];

    function notificationCtrl($location, $scope, $rootScope, service, $timeout) {

       activate()

       function activate() {
           $scope.ui = {};      
           $scope.$on('notify', function (event, notification) {
            $scope.ui.currentNotification = notification;
            $timeout(function () {
                $scope.ui.currentNotification = null;
            }, 2500);
           });
       } 

       /*$scope.setNotification = function (notification) {
        $scope.ui.currentNotification = notification;
        $timeout(function () {
            $scope.ui.currentNotification = null;
        }, 2500)
       };
       $scope.ui.currentNotification = {
           positive: true,
           content: 'Tapahtuma lisätty',
           error: false
       };*/ 
        // init
       console.log('toimii');
       
    }
})();