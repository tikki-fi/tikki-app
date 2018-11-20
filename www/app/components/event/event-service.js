(function () {
    'use strict';
    angular
        .module('events')
        .factory('eventService', eventService);

    eventService.$inject = ['$location', '$http', '$q', 'sharedService', '$rootScope', 'authService', '$state', 'notificationService', 'userService' ,'$ionicPopup'];

    function eventService($location, $http, $q, sharedService, $rootScope, authService, $state, notificationService, userService, $ionicPopup) {

       var origin = 'http://resultp.jumar.io';
	   $rootScope.isAuthenticated = authService.isAuthenticated();

       // post event to tikki
       eventService.postEvent = function (event) {

        var deferred = $q.defer();
        var userId = localStorage.getItem('id');

        var organizations = [
            "Muu kuin aluetoimisto",
            "Etelä-Savon aluetoimisto",
            "Hämeen aluetoimisto",
            "Kaakkois-Suomen aluetoimisto",
            "Keski-Suomen aluetoimisto",
            "Lapin aluetoimisto",
            "Lounais-Suomen aluetoimisto",
            "Pirkanmaan aluetoimisto",
            "Pohjanmaan aluetoimisto",
            "Pohjois-Karjalan aluetoimisto",
            "Pohjois-Pohjanmaan ja Kainuun aluetoimisto",
            "Pohjois-Savon aluetoimisto",
            "Uudenmaan aluetoimisto"
        ];

        event.user_id = userId;
        event.event_at = createDateString(event.event_at);
        event.organization_id = organizations.indexOf(event.organization);

        $http({
            method: 'POST',
            data: event,
            url: $rootScope.apiUrl + '/event'
        }).then(function (response) {
            if(response.status == 200) {
                deferred.resolve(true);
            };
        });

        return deferred.promise;
       };

       // get events from tikki
       eventService.getEvents = function () {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: $rootScope.apiUrl + '/event'
        }).then(function (response) {
            if(response.status == 200) {
                response.data.result.forEach(function (event) {
                    event.js_date = new Date(event.event_at)
                });
                deferred.resolve(response.data.result);
            }
        });

        return deferred.promise;

       };

       // get records for a certain event
       eventService.getRecordsForEvent = function (event_id) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: $rootScope.apiUrl + '/record?event_id=' + event_id
        }).then(function (response) {
            if(response.status == 200) {
                var records = angular.fromJson(response.data.result);
                records.forEach(function (record, index) {
                    userService.getUserProfile(record.user_id).then(function (result) {
                        record.fullName = result.payload.firstName + ' ' + result.payload.lastName;
                        if(records.length-1 == index) {
                            deferred.resolve(records);
                        }
                    });
                });

            }
        });
        return deferred.promise;
       };


       // delete event
       eventService.deleteEvent = function (event_id) {
        var deferred = $q.defer();
        $http({
            method: 'DELETE',
            url: $rootScope.apiUrl + '/event?id=' + event_id
        }).then(function (response) {
            if(response.status == 200) {
                notificationService.notify('Tapahtuma poistettu', false);
                deferred.resolve(true);
            }
        });
        return deferred.promise;
       };

       // post user attendation to backend
       eventService.attendEvent = function (event) {
        var deferred = $q.defer();

        var data = {
            user_id: localStorage.getItem('id'),
            event_id: event.id
        };

        $http({
            method: 'POST',
            url: $rootScope.apiUrl + '/user-event-link',
            data: data
        }).then(function (response) {
            if(response.status == 200) {
                notificationService.notify('Ilmoittauduttu tapahtumaan', true);
                deferred.resolve(true);
            };
        });
        return deferred.promise;
       };

       // validate basic info
       eventService.validateEventBasicData = function (event) {
            if(event.name && event.address && (!angular.isUndefined(event.postal_code) && event.postal_code.length == 5)) {
                return true;
            } else {
                return false;
            }
        };


        // validate timestamp of event
        eventService.validateEventTimeStamp = function (event) {
            if(!angular.isUndefined(event) && !angular.isUndefined(event.event_at)) {
                var timestamp = event.event_at;
                if(Object.keys(timestamp).length == 5) {
                    if(timestamp.day.length >= 1 && timestamp.month.length >= 1 && timestamp.year.length == 4 && timestamp.hour.length == 2 && timestamp.minute.length == 2) {
                        return true;
                    }  else {
                        return false;
                    }
                }
            };
            return false;
        };

        // call all validators
        eventService.validateEvent = function (event) {
            if(eventService.validateEventBasicData(event) && (!angular.isUndefined(event.payload)) && eventService.validateEventTimeStamp(event)) {
                return false;
            }
            return true;
        };


        // get organizations
        eventService.getInitiators = function () {
            var deferred = $q.defer();
            var result = [
                "Muu kuin aluetoimisto",
                "Etelä-Savon aluetoimisto",
                "Hämeen aluetoimisto",
                "Kaakkois-Suomen aluetoimisto",
                "Keski-Suomen aluetoimisto",
                "Lapin aluetoimisto",
                "Lounais-Suomen aluetoimisto",
                "Pirkanmaan aluetoimisto",
                "Pohjanmaan aluetoimisto",
                "Pohjois-Karjalan aluetoimisto",
                "Pohjois-Pohjanmaan ja Kainuun aluetoimisto",
                "Pohjois-Savon aluetoimisto",
                "Uudenmaan aluetoimisto"
            ];
            deferred.resolve(result);
            return deferred.promise;
        };

        // helpers to create datestring from parts
        function createDateString(event_at) {
            for(var prop in event_at) {
                if(event_at.hasOwnProperty(prop)) {
                    event_at[prop] = parseInt(event_at[prop]);
                };
            }
            var dateObj = new Date(event_at.year, event_at.month-1, event_at.day, event_at.hour, event_at.minute, 0, 0);
            var momentObj = moment(dateObj).format();
            return momentObj;
        };

        // redundant guid generator
        function guid() {
            function s4() {
              return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
              s4() + '-' + s4() + s4() + s4();
        };

       return eventService;
    }
})();
