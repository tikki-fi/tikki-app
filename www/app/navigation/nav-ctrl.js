(function () {
  angular
    .module('kko')
    .controller('navCtrl', navCtrl);

  navCtrl.$inject = ['$location', '$scope', '$rootScope', 'userService',
    'activityService', '$ionicModal', '$state', '$ionicHistory', 'authService',
    'sharedService', '$ionicPopover'];

  function navCtrl($location, $scope, $rootScope, service, activityService,
    $ionicModal, $state, $ionicHistory, authService, sharedService, $ionicPopover) {
    $ionicPopover.fromTemplateUrl('app/navigation/popover.html', {
      scope: $scope
    }).then(function (popover) {
      $scope.popover = popover;
    });

    $scope.openPopover = function ($event) {
      $scope.popover.show($event);
    };
    $scope.closePopover = function () {
      $scope.popover.hide();
    };
    // TODO
    // Cleanup the popover when we're done with it!
    $scope.$on('$destroy', function () {
      $scope.popover.remove();
    });
    // Execute action on hidden popover
    $scope.$on('popover.hidden', function () {
      // Execute action
    });
    // Execute action on remove popover
    $scope.$on('popover.removed', function () {
      // Execute action
    });
    $scope.test = function () {
      // TODO-DEBUG, remove this?
    };
  }
})();
