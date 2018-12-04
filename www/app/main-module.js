(function() {
  "use strict";

  // get modules
  angular
    .module("kko", [
      "ionic",
      "environment",
      "main",
      "user",
      "shared",
      "activities",
      "events",
      "notifications",
      "modal",
      "auth",
      "ui.router",
      "ionic-datepicker",
      "chart.js",
      "auth0.auth0"
    ])
    .config(config)
    .run(appRun);

  // inject what we need
  config.$inject = [
    "envServiceProvider",
    "$stateProvider",
    "$urlRouterProvider",
    "ionicDatePickerProvider",
    "ChartJsProvider",
    "angularAuth0Provider",
    "$ionicConfigProvider",
    "$httpProvider"
  ];

  function config(
    envServiceProvider,
    $stateProvider,
    $urlRouterProvider,
    ionicDatePickerProvider,
    ChartJsProvider,
    angularAuth0Provider,
    $ionicConfigProvider,
    $httpProvider
  ) {
    // lets setup runtime check
    envServiceProvider.config({
      domains: {
        local: ["localhost"],
        development: ["dev.tikki.fi"],
        production: ["tikki.fi"],
        test: ["qa.tikki.fi"]
      },
      vars: {
        local: {
//          apiUrl: "http://localhost:5000"
          apiUrl: "https://dev.tikki.fi/api"
        },
        development: {
          apiUrl: "https://dev.tikki.fi/api"
        },
        production: {
          apiUrl: "https://tikki.fi/api"
        }
      }
    });

    envServiceProvider.check();
    // do routing
    $stateProvider
      // login
      .state("login", {
        url: "/login",
        templateUrl: "app/components/login/login.html",
        controller: "mainCtrl"
      })
      // registration
      .state("register", {
        url: "/register",
        templateUrl: "app/components/registration/register.html",
        controller: "mainCtrl"
      })
      // user profile
      .state("profile", {
        url: "/profile",
        templateUrl: "app/components/user/profile-beta.html",
        controller: "userCtrl",
        cache: false
      })
      .state("profilerecords", {
        url: "/profile/records",
        templateUrl: "app/components/user/profile-records.html",
        controller: "userCtrl"
      })
      .state("profilestatistics", {
        url: "/profile/statistics",
        templateUrl: "app/components/user/profile-statistics.html",
        controller: "userCtrl"
      })
      // activities
      .state("activitieslist", {
        url: "/activities",
        templateUrl: "app/components/activities/activities.html",
        controller: "activityCtrl"
      })
      .state("activitiesadd", {
        url: "/activity",
        templateUrl: "app/components/activities/activity.html",
        controller: "activityCtrl",
        cache: false
      })
      // events
      .state("events", {
        url: "/events",
        templateUrl: "app/components/event/events.html",
        controller: "eventCtrl"
      })
      .state("addevent", {
        url: "/events/add",
        templateUrl: "app/components/event/event-add.html",
        controller: "eventCtrl"
      })
      .state("validate", {
        url: "/validate",
        templateUrl: "app/components/event/validate.html",
        controller: "eventCtrl"
      });

    // redirect to login for other urls
    $urlRouterProvider.otherwise("/login");

    // init datepicker
    var datePickerObj = {
      inputDate: new Date(),
      titleLabel: "Valitse päivä",
      setLabel: "Valitse",
      todayLabel: "Today",
      closeLabel: "Sulje",
      mondayFirst: false,
      weeksList: ["S", "M", "T", "K", "T", "P", "L"],
      monthsList: [
        "Tammikuu",
        "Helmikuu",
        "Maaliskuu",
        "Huhtikuu",
        "Toukokuu",
        "Kesäkuu",
        "Heinäkuu",
        "Elokuu",
        "Syyskuu",
        "Lokakuu",
        "Marraskuu",
        "Joulukuu"
      ],
      templateType: "popup",
      from: new Date(1917, 1, 1),
      to: new Date(2017, 8, 1),
      showTodayButton: false,
      dateFormat: "dd MM yyyy",
      closeOnSelect: false,
      disableWeekdays: []
    };

    ionicDatePickerProvider.configDatePicker(datePickerObj);

    var origin = window.location.origin;
    var redirectUri;

    if (envServiceProvider.environment === "local") {
      redirectUri = origin + "/#/profile";
    } else {
      redirectUri = origin + "/app/#/profile";
    }
    // init angular-auth0
    angularAuth0Provider.init({
      clientID: "K25KShIEJtZy9CJ5z6TUmx3CIobyhdF7",
      domain: "tikkifi.eu.auth0.com",
      responseType: "token id_token",
      audience: "https://tikkifi.eu.auth0.com/userinfo",
      redirectUri: redirectUri,
      scope: "openid profile user_metadata app_metadata"
    });

    $ionicConfigProvider.backButton.previousTitleText(false);
    $ionicConfigProvider.backButton.text("");
  }

  // inject what we need for app start
  appRun.$inject = [
    "envService",
    "$rootScope",
    "$state",
    "$ionicHistory",
    "userService",
    "activityService",
    "authService",
    "$ionicModal",
    "$http",
    "eventService",
    "sharedService"
  ];

  // handle authentication results in apprun when we get callback from auth0 api
  function appRun(
    envService,
    $rootScope,
    $state,
    $ionicHistory,
    userService,
    activityService,
    authService,
    $ionicModal,
    $http,
    eventService,
    sharedService
  ) {
    $rootScope.data = {};
    // set apiUrl here
    $rootScope.apiUrl = envService.read("apiUrl");
    // set default auth token
    let tikkiToken = localStorage.getItem('tikki_token');
    if(tikkiToken) {
      $http.defaults.headers.common.Authorization = 'Bearer ' + tikkiToken;
    }
    // set state
    $rootScope.$state = $state;

    // Schedule the token to be renewed
    authService.scheduleRenewal();

    // logout func
    $rootScope.logout = function() {
      userService.logout();
      location.reload();
    };

    $rootScope.deleteUser = function() {
      var id = localStorage.getItem("id");
      var origin = "http://resultp.jumar.io";
      $http({
        method: "DELETE",
        url: "/user/" + id
      }).then(
        function successCallback(response) {
          if (response.status == 200) {
            // set userId to sessionstorage
            console.log(response);
            localStorage.removeItem("id");
            // resolve the user data
          } else {
            alert("Päivityksessä tapahtui virhe");
          }
        },
        function errorCallback(response) {
          alert("Tapahtui virhe");
        }
      );
    };

    // betainfo modal
    $ionicModal
      .fromTemplateUrl("app/shared/templates/version-info.html", {
        scope: $rootScope,
        animation: "slide-in-up"
      })
      .then(function(modal) {
        $rootScope.infoModal = modal;
      });

    $rootScope.openInfoDialog = function() {
      $rootScope.infoModal.show();
    };

    $rootScope.sendFeedback = function(feedback) {
      sharedService.sendFeedback(feedback).then(function(succeed) {
        if (succeed) {
          // thank user and disabled feedback button for 5 minutes with this variable and a timeout func.
          $rootScope.data.feedbackSent = true;
          setTimeout(function() {
            $rootScope.data.feedbackSent = false;
          }, 2500);
        } else {
          // error handling
        }
      });
    };

    $rootScope.closeInfoDialog = function() {
      $rootScope.infoModal.hide();
    };

    $rootScope.stateChange = function(state) {
      $state.go(state);
    };

    // handle callback from hosted login authenticaton page
    authService.handleAuthentication().then(function() {
      // if succesfull connection was made with social platforms
      if (authService.isAuthenticated()) {
        $rootScope.isAuthenticated = authService.isAuthenticated();

        // check if profile is cached
        if (authService.getCachedProfile()) {
          authService.getCachedProfile();
        } else {
          // else just do api call to auth provider.
          authService.getProfile(function(err, profile) {
            userService
              .loginToTikki({ token: localStorage.getItem("id_token") })
              .then(res => {
                if (!res) {
                  userService.getNewUserId().then(function(response) {
                    // go to fill rest of the information required
                    $ionicHistory.nextViewOptions({
                      disableBack: true
                    });
                    $state.go("register");
                  });
                } else {
                  $state.go('profile');
                }
              })
              .catch(err => {
                console.log(err);
              });
          });
        }
      } else {
        // if authentication failed
        $ionicHistory.nextViewOptions({
          disableBack: true
        });

        $state.go("login");
      }
    });
  }
})()
