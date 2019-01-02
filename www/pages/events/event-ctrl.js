(function () {
  'use strict';
  angular
    .module('events', [])
    .controller('eventCtrl', eventCtrl);

  eventCtrl.$inject = ['$state','$location', '$scope', '$stateParams',
    '$rootScope', '$ionicHistory','activityService', 'eventService',
    '$ionicModal', 'modalService', 'sharedService', '$ionicPopup'];

  function eventCtrl($state, $location, $scope, $stateParams, $rootScope,
    $ionicHistory, activityService, service, $ionicModal, modalService,
    sharedService, $ionicPopup) {
    $scope.showConfirm = function (record) {
      $scope.record = record;
      var confirmPopup = $ionicPopup.confirm({
        scope: $scope,
        title: 'Vahvista tulos',
        templateUrl: 'pages/events/validatepopup.html',
      });

      confirmPopup.then(function (res) {
        if (res) {
          activityService.validateRecord(record).then(function (data) {
            // TODO-DEBUG, data is not used?
            $scope.initValidateView(angular.fromJson('eventToValidate'));
          });
        }
      });
    };


    $scope.infoModal = function (event) {
      modalService
        .init('shared/modals/event-info.html', $scope, event)
        .then(function (modal) {
          modal.show();
        });
    };

    $scope.confirmModal = function (event) {
      modalService
        .init('pages/events/confirm.html', $scope, event)
        .then(function (modal) {
          modal.show();
        });
    };


    activate();

    function activate() {
      $scope.eventToValidate = angular.fromJson(sessionStorage.getItem('eventToValidate'));
      service.getEvents().then(function (response) {
        sharedService.filterEvents(response);
      });

      $scope.ui = {};

      initEvent();

      $scope.params = $stateParams;

      var id = localStorage.getItem('id');

      $scope.addTestToEvent = function (test) {
        if (angular.isUndefined($scope.event.payload)) {
          $scope.event.payload = { tests: [] };
        }
        var index = $scope.event.payload.tests.indexOf(test);
        if (index > -1) {
          $scope.event.payload.tests.splice(index, 1);
        } else {
          $scope.event.payload.tests.push(test);
        }
      };
    };

    $scope.addOrRemoveEvent = function (event) {
      initEvent();
      $state.go('events');
      service.postEvent(event).then(function (response) {
        service.getEvents().then(function (response) { // TODO-debug, response usage?
          sharedService.filterEvents(response);
        });
        $scope.confirmModal.hide();
        $state.go('events');
      });
    };

    $scope.getEvents = function () {
      service.getEvents().then(function (events) { // TODO-debug, events used?
        sharedService.filterEvents($rootScope.events);
      });
    };

    $scope.validateEventBasicData = function (event) {
      return service.validateEventBasicData(event);
    };

    // validate timestamp input
    $scope.validateEventTimeStamp = function (event) {
      return service.validateEventTimeStamp(event);
    };

    // submit validation
    $scope.disableEventAdd = function (event) {
      // TODO: add validation logic to event adding
      // console.log(service.validateEvent(event));
      return service.validateEvent(event);
    };

    // check if user has attended the event to show checkmark
    $scope.userAttendedEvent = function (event) {
      return (event.participants.indexOf(localStorage.getItem('id')) > -1);
    };


    // init event object
    function initEvent() {
      $scope.data = {};
      activityService.getTests().then(function (result) {
        $scope.data.testList = result.data;
      });
      service.getInitiators().then(function (result) {
        $scope.data.initiators = result;
        $scope.event.organization = result[0];
      });
      $scope.event = {};
      $scope.currentTime = new Date();
      if (angular.isUndefined($scope.event.event_at)) {
        $scope.event.event_at = {
          year: $scope.currentTime.getFullYear().toString()
        };
      } else {
        $scope.event.event_at.year = $scope.currentTime.getFullYear().toString();
      }
    };

    // init validation window

    $scope.initValidateView = function (event) {
      service.getRecordsForEvent(event.id).then(function (response) {
        $rootScope.eventRecords = response;
      });
      sessionStorage.setItem('eventToValidate', angular.toJson(event));
      $rootScope.eventToValidate = event;
    };

    if (!angular.isUndefined($scope.eventToValidate) && $scope.eventToValidate != null) {
      $scope.initValidateView($scope.eventToValidate);
    }

    // users own event
    $scope.isOwnEvent = function (event) {
      return (event.user_id === localStorage.getItem('id'));
    };

    // get minutes to show in double digit format
    $scope.getMinutes = function (date) {
      return (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    };
  }
})();
