(function () {
  'use strict';

  angular
    .module('shared', [])
    .factory('sharedService', sharedService);
  sharedService.$inject = ['$location', '$http', '$q', '$timeout','$rootScope'];

  function sharedService($location, $http, $q, $timeout, $rootScope) {
    // make use of record ep to save feedbacks for now.
    sharedService.sendFeedback = function (feedback) {
      var deferred = $q.defer();

      // feedback goes into payload
      var data = {
        user_id: $rootScope.user.id,
        type_id: 9999,
        payload: {
          "feedback:": feedback
        }
      };

      $http({
        method: 'POST',
        url: $rootScope.apiUrl + '/record',
        data: data
      }).then(function (result) {
        if (result.status === 200) {
          deferred.resolve(true);
        } else {
          deferred.resolve(false);
        }
      });

      return deferred.promise;
    };

    sharedService.getRecordTypeText = function (typeId) {
      if (typeId === 1) {
        return 'Cooper-testi';
      }
      if (typeId === 2) {
        return 'Punnerrus';
      }
      if (typeId === 3) {
        return 'Vatsalihas';
      }
      if (typeId === 4) {
        return 'Vauhditon pituushyppy';
      }
      if (typeId === 5) {
        return 'Leuanveto';
      }
    };

    sharedService.getActivityText = function (text) {
      if (text === 'distance') {
        return 'Cooper-testi';
      }
      if (text === 'pushups') {
        return 'Punnerrus';
      }
      if (text === 'situps') {
        return 'Vatsalihas';
      }
      if (text === 'standingjump') {
        return 'Vauhditon pituushyppy';
      }
      if (text === 'pullups') {
        return 'Leuanveto';
      }
    };

 sharedService.getActivityMeasurement = function (text) {
      if (text === 'distance') {
        return 'm';
      }
      if (text === 'pushups') {
        return 'toistoa';
      }
      if (text === 'situps') {
        return 'toistoa';
      }
      if (text === 'standingjump') {
        return 'cm';
      }
      if (text === 'pullups') {
        return 'toistoa';
      }
    };

    sharedService.parseDateToFinnishFormat = function (date) {
      if (!typeof date.getMonth === 'function') {
        date = new Date(date);
      }
      var day = date.getDate();
      var monthIndex = date.getMonth();
      var year = date.getFullYear();
      var result = day + '.' + (monthIndex + 1) + '.' + year;
      return result;
    };

    sharedService.calculateAge = function (birthday) { // birthday is a date
      var dates = birthday.split('.');
      var formattedDate = new Date(dates[2] + '-' + dates[1] + '-' + dates[0]);
      var ageDifMs = Date.now() - formattedDate.getTime();
      var ageDate = new Date(ageDifMs); // miliseconds from epoch

      return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    sharedService.getMaxValues = function (array) {
      var maxValues = {
        distance: 0,
        standingjump: 0,
        situps: 0,
        pushups: 0,
        pullups: 0
      };

      var results = array.map(function (currentItem) { // TODO-DEBUG never used

      });


      array.forEach(function (currentItem) {
        for (var key in currentItem.payload) {
          if (currentItem.payload[key] > maxValues[key]) {
            maxValues[key] = currentItem.payload[key];
          }
        }
      });

      return maxValues;
    };

    sharedService.sortByDate = function (array) {
      return array.sort(function (a, b) {
        return new Date(b.created_at) - new Date(a.created_at);
      });
    };


    $http.get('node_modules/countries-cities/data.json').then(function (res) {
      sharedService.cities = res.data.countries.Finland;
    });

    sharedService.searchCities = function (searchFilter) {
      var deferred = $q.defer();
      var matches = sharedService.cities.filter(function (city) {
        if (city.toLowerCase().indexOf(searchFilter.toLowerCase()) !== - 1) return true;
      });

      $timeout(function () {
        deferred.resolve(matches);
      }, 100);
      return deferred.promise;
    };

    sharedService.mapSocialProfileData = function () {
      var socialProfile = angular.fromJson(localStorage.getItem('socialProfile'));
      var result = {
        id: localStorage.getItem('id'),
        social_id: socialProfile.sub,
        firstName: socialProfile.given_name,
        lastName: socialProfile.family_name,
        gender: socialProfile.gender
      };
      return result;
    };

    sharedService.filterEvents = function (events) {
      $rootScope.events = angular.fromJson(events);
      $rootScope.upcomingEvents = [];
      $rootScope.ongoingEvents = [];
      $rootScope.pastEvents = [];

      $rootScope.upcomingEvents = $rootScope.events.filter(function (item) {
        var event_at = new Date(item.event_at);
        if (event_at > new Date()) {
          return true;
        }
        return false;
      });

      $rootScope.ongoingEvents = $rootScope.events.filter(function (item) {
        var event_at = new Date(item.event_at);
        var event_at_threshold = moment(event_at).add(6, 'h').toDate();
        if (event_at_threshold > new Date() && event_at < new Date()) {
          return true;
        }
        return false;
      });

      $rootScope.pastEvents = $rootScope.events.filter(function (item) {
        var event_at = new Date(item.event_at);
        var event_at_threshold = moment(event_at).add(6, 'h').toDate();
        if (event_at_threshold < new Date()) {
          return true;
        }
        return false;
      });
    }

    return sharedService;
  }
})();
