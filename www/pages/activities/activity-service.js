(function () {
  'use strict';
  angular
    .module('activities')
    .factory('activityService', activityService);

  activityService.$inject = ['$location', '$http', '$q', 'sharedService', '$rootScope', 'authService'];

  function activityService($location, $http, $q, sharedService, $rootScope, authService) {

    var origin = 'http://resultp.jumar.io';
    $rootScope.isAuthenticated = authService.isAuthenticated();

    // add a new record for user
    activityService.addRecord = function (userId, typeId, record, eventId) {
      var deferred = $q.defer();


      var data = {
        "user_id": userId,
        "type_id": typeId,
        "event_id": eventId
      };


      if (typeId === 1) {
        data.payload = { "distance": record };
      }


      if (typeId === 2) {
        data.payload = { "pushups": record };
      }


      if (typeId === 3) {
        data.payload = { "situps": record };
      }

      if (typeId === 4) {
        data.payload = { "standingjump": record };
      }

      if (typeId === 5) {
        data.payload = { "pullups": record };
      }

      if (typeId > 5) {
        data.payload = { "answer": record };
      }

      $http({
        method: 'POST',
        url: $rootScope.apiUrl + '/record/',
        data: data
      }).then(function (response) {
        if (response.status === 200) {
          if (typeId <= 5) {
            sessionStorage.removeItem('pickedTest');
          }
          deferred.resolve(response);
        };
      });

      return deferred.promise;
    };

    // validate record
    activityService.validateRecord = function (record) {
      var deferred = $q.defer();
      record.validated_user_id = localStorage.getItem('id');
      $http({
        method: 'PATCH',
        url: $rootScope.apiUrl + '/record/',
        data: record
      }).then(function (response) {
        if (response.status === 200) {
          deferred.resolve(true);
        };
      });

      return deferred.promise;
    };

    // get tests
    activityService.getTests = function () {
      var deferred = $q.defer();

      var results = {
        data: [
          {
            typeId: 1, name: "Cooper-testi", measurement: "Metrejä", description: "Juokse 12-minuuttia."
          },
          {
            typeId: 2, name: "60 sekunnin punnerrus-testi", measurement: "Toistoja", description: "Tee punnerruksia 60 sekuntia."
          },
          {
            typeId: 3, name: "60 Sekunnin vatsalihas-testi", measurement: "Toistoja", description: "Tee vatsoja 60 sekuntia."
          },
          {
            typeId: 4, name: "Vauhditon pituushyppy", measurement: "cm", description: "Hyppää pitkälle ilman vauhtia."
          },
          {
            typeId: 5, name: "Leuanveto", measurement: "Toistoja", description: "Tee niin monta leuanvetoa kuin pystyt."
          }
        ]
      };

      /* TODO: Activate when schema has more precise data.
      activityService.getSchema().then(function (result) {
          //deferred.resolve(result.filter(i => i.category_id == 1));
      }); */

      deferred.resolve(results);
      return deferred.promise;
    };

    activityService.setTest = function (test) {
      sessionStorage.setItem('pickedTest', angular.toJson(test));
    };

    activityService.getPickedTest = function () {
      return angular.fromJson(sessionStorage.getItem('pickedTest'));
    };

    // get records for user
    activityService.getCooperPercentage = function (id) {
      var deferred = $q.defer();

      // API call
      $http({
        method: 'GET',
        url: $rootScope.apiUrl + '/test/cooperstest/compstat?user_id=' + id
      }).then(function successCallback(response) {
        if (response.status === 200) {
          deferred.resolve(response.data.result.quantile);
        }
      }, function errorCallback(response) {
        // TODO: handle errors
      });

      return deferred.promise;
    };


    // get records for user
    activityService.getPushupPercentage = function (id) {
      var deferred = $q.defer();

      // API call
      $http({
        method: 'GET',
        url: $rootScope.apiUrl + '/test/pushup60test/compstat?user_id=' + id
      }).then(function successCallback(response) {
        if (response.status === 200) {
          deferred.resolve(response.data.result.quantile);
        }
      }, function errorCallback(response) {
        // TODO: handle errors
      });
      return deferred.promise;
    };

    // get the schema from backend
    activityService.getSchema = function () {

      var deferred = $q.defer();

      $http({
        method: 'GET',
        url: $rootScope.apiUrl + '/schema'
      }).then(function (response) {
        if (response.status === 200) {
          deferred.resolve(response.data.result);
        } else {
          deferred.resolve();
        }
      });

      return deferred.promise;
    };


    // get all user activities
    activityService.getUserActivities = function (id) {
      var deferred = $q.defer();
      $http({
        method: 'GET',
        url: $rootScope.apiUrl + '/record?user_id=' + id
      }).then(function (response) {
        var result = response.data.result.filter(function (item) {
          return item.type_id < 6;
        });

        result.forEach(function (record) {
          record.recordTypeText = sharedService.getRecordTypeText(record.type_id);
        });
        deferred.resolve(result);
      });

      return deferred.promise;
    };

    return activityService;
  }
})();
