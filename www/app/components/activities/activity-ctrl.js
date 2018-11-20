(function () {
    'use strict';
    angular
        .module('activities', ['shared'])
        .controller('activityCtrl', activityCtrl);

    activityCtrl.$inject = ['$state','$location', '$scope', 'activityService', '$stateParams', '$rootScope', '$ionicHistory', 'userService', 'sharedService', 'eventService'];

    function activityCtrl($state, $location, $scope, service, $stateParams, $rootScope, $ionicHistory, userService, sharedService, eventService) {

        activate();

        function activate() {
            $scope.uistatus = {};
            initEvent();
            if(angular.isUndefined($rootScope.socialProfile)) {
                $rootScope.socialProfile = userService.getSocialProfileFromStorage();
            }

            eventService.getEvents().then(function (response) {
                sharedService.filterEvents(response);
                initEvent();
            });

            if(angular.isUndefined($rootScope.user) && $rootScope.socialProfile !== null) {
                $rootScope.user = sharedService.mapSocialProfileData();
            }
            var id = localStorage.getItem('id');
            $scope.test = service.getPickedTest();
        };

        service.getTests().then(function (result) {
            $scope.tests = result.data;
        });
        
        $scope.setTest = function (test) {
            service.setTest(test);
            $scope.test = service.getPickedTest();
            $state.go('activitiesadd');
        }

        $scope.setEvent = function (event) {
            sessionStorage.setItem('currentEvent', angular.toJson(event));
            $scope.tests = event.payload.tests;
            $scope.uistatus.event = event;
            $scope.uistatus.inEvent = false;
            $scope.uistatus.header = $scope.uistatus.event.name;
        };

        $scope.removeEvent = function () {
            sessionStorage.removeItem('currenteEvent');
            $scope.uistatus.event = null;
            $scope.uistatus.header = "Lisää suoritus";
            service.getTests().then(function (result) {
                $scope.tests = result.data;
            });
            $scope.uistatus.inEvent = false;
        }

        $scope.addRecord = function (userId, typeId, record) {
            console.log($rootScope.user);
            service.addRecord(userId, typeId, record, $scope.uistatus.event.id).then(function () {
                 service.getUserActivities($rootScope.user.id).then(function (activities) {

                        $rootScope.user.activities = activities;

                        $ionicHistory.nextViewOptions({
                            disableBack: true
                        });

                        $state.go('profile');

                    }); 
            });
        };

        function initEvent() {
            var event = angular.fromJson(sessionStorage.getItem('currentEvent'));
            if(!angular.isUndefined(event) && event != null) {
                $scope.tests = event.payload.tests;
                $scope.uistatus.event = event;
                $scope.uistatus.header = event.name;
            } else {
                $scope.uistatus.header = "Lisää suoritus";
                $scope.uistatus.event = {};
                $scope.uistatus.event.id = null;
            }
        }
    }
})();