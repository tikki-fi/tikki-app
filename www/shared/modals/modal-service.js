(function () {
  'use strict';

  angular
    .module('modal', [])
    .factory('modalService', modalService);

  modalService.$inject = ['$ionicModal', '$rootScope', 'eventService'];

  function modalService($ionicModal, $rootScope, eventService) {
    var init = function(tpl, $scope, event = null) {

      var promise;
      $scope = $scope || $rootScope.$new();
      if (event !== null) {
        $scope.event = event;
        $scope.isOwner = false;
        if (event.user_id === localStorage.getItem('id')) {
          $scope.isOwner = true;
        }
      }

      $scope.deleteEvent = function (event) {
        eventService.deleteEvent(event.id).then(function (result) {
          eventService.getEvents().then(function (response) {
            sharedService.filterEvents(response.data.result);
          });
        });
      }

      $scope.attendEvent = function (event) {
        eventService.attendEvent(event).then(function (result) {
          eventService.getEvents().then(function (response) {
            sharedService.filterEvents(response.data.result);
          });
        });
      };

      $scope.getRecordsForEvent = function (event) {
        evenService.getRecordsForEvent(event.id).then(function (result) {
          console.log(result);
        })
      };

      $scope.userAttendedEvent = function (event) {
        return (event.participants.indexOf(localStorage.getItem('id')) > -1);
      };

      promise = $ionicModal.fromTemplateUrl(tpl, {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modal = modal;
        return modal;
      });

      $scope.openModal = function () {
        $scope.modal.show();
      };
      $scope.closeModal = function () {
        $scope.modal.hide();
      };
      $scope.$on('$destroy', function () {
        $scope.modal.remove();
      });
      return promise;
    };
    return {
      init: init
    };
  }
})();
