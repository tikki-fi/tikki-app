(function () {
  angular
    .module('main', [])
    .controller('mainCtrl', mainCtrl);


    mainCtrl.$inject = ['$state','$location', '$scope', '$rootScope', 'ionicDatePicker', '$timeout', '$ionicHistory', 'userService','sharedService', 'authService', '$ionicModal', '$http'];

  function mainCtrl($state, $location, $scope, $rootScope, ionicDatePicker,
    $timeout, $ionicHistory, userService, sharedService, authService,
      $ionicModal, $http) {


    // check if user has userid
    var idChecked = false;
    var id = localStorage.getItem('id');

    if (id && idChecked) {
      if (authService.isAuthenticated()) {
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        $state.go('profile');
      }
    };
    idChecked = true;

    $scope.authorize = function () {
      if (authService.isAuthenticated()) {
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        $state.go('profile');
      } else {
        authService.authorize();
      }
    };

    var birthDatePicker = {
      callback: function (val) {
        var date = new Date(val);
        var formattedDate = (date.getUTCDate() + 1) + '.' + (date.getUTCMonth() + 1) + '.' + date.getUTCFullYear();
        if (!$rootScope.user) {
          $rootScope.user = {};
          $rootScope.user.id = localStorage.getItem('id');
        };

        $rootScope.user.birthDate = formattedDate;
        console.log('Return value from the datepicker popup is : ' + val, new Date(val)); // TODO-DEBUG
      }
    };

    activate();

    function activate() {
      $scope.ui = {
        cityChosen: false
      };
      if (angular.isUndefined($rootScope.socialProfile)) {
        $rootScope.socialProfile = userService.getSocialProfileFromStorage();
      }

      if (angular.isUndefined($rootScope.user) && $rootScope.socialProfile !== null) {
        $rootScope.user = sharedService.mapSocialProfileData();

        console.log($rootScope.user); // TODO-DEBUG
      }

      $scope.searchCities = function (searchFilter) {
        sharedService.searchCities(searchFilter).then(function (matches) {
          $scope.data = {};
          $scope.data.cities = matches;
        });
      };

      $scope.setUserCity = function (city) {
        if (angular.isUndefined(city)) {
          $scope.ui.cityChosen = false;
        } else {
          $rootScope.user.city = city;
          $scope.ui.cityChosen = true;
        }
      };
    };

    // create new user
    $scope.createUser = function () {
      userService.getNewUserId().then(function (response) {
        $rootScope.user = {};
        $rootScope.user.id = response;
        $state.go('register');
      });
    };


    // toggle genders
    $scope.setGender = function (gender) {
      if ($rootScope.user) {
        if (gender === 1) {
          $rootScope.user.gender = "male";
        }
        if (gender === 2) {
          $rootScope.user.gender = "female";
        }
      };
    };

    $scope.createUserInfo = function (user) {
      if (!user.id) {
        user.id = localStorage.getItem('id');
      }
      userService.createUserInfo(user).then(function (response) { // TODO-DEBUG unused response
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        $state.go('profile');
      });
    };

    // datepicker for birthdate
    $scope.openDatePicker = function () {
      ionicDatePicker.openDatePicker(birthDatePicker);
    };

    $scope.isSubmitDisabled = function (user) {
      if (user) {
        if (user.gender && user.city && user.birthDate && user.firstName && user.lastName) {
          return false;
        }
      }
      return true;
    };
  };
})();
