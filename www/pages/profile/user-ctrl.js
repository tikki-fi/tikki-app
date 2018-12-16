(function () {
'use strict';

  angular
    .module('user', [])
    .controller('userCtrl', userCtrl);

  userCtrl.$inject = ['$location', '$scope', '$rootScope', 'userService', 'activityService', '$ionicModal', '$state', '$ionicHistory', 'authService', 'sharedService', '$ionicPopover', 'eventService', 'modalService', '$ionicPopup'];

  function userCtrl($location, $scope, $rootScope, service, activityService,
    $ionicModal, $state, $ionicHistory, authService, sharedService,
    $ionicPopover, eventService, modalService, $ionicPopup) {
    // modals
    $scope.infoModal = function (event) {
      modalService
        .init('shared/modals/event-info.html', $scope, event)
        .then(function (modal) {
          modal.show();
        });
    };

    $scope.questionModal = function (event) {
      modalService.init('shared/modals/questions.html', $scope, event)
        .then(function (modal) {
          modal.show();
        });
    };

    function showPopup() {
      $scope.data = {};
      // popup for questionnaires
      var myPopup = $ionicPopup.show({ // TODO-DEBUG, Never used
        template: 'Vastaamalla kyselyyn voit auttaa reservin toimintakyvyn mittaamisessa ilman kuntotestiäkin!',
        title: 'Haluatko vastata kyselyyn?',
        scope: $scope,
        buttons: [
          {
            text: 'Kyllä',
            type: 'button-positive',
            onTap: function(e) {
              $scope.startAskingQuestions();
            }
          },
          {
            text: 'Ei'
          }
        ]
      });
    }

    $scope.startAskingQuestions = function () {
      $scope.modaldata = {};
      service.getQuestion().then(function (result) {
        $scope.modaldata.question = result;
        $scope.questionModal();
      });
    };

    // close and save the current question
    $scope.closeQuestionModal = function (question) {
      $scope.openQuestion = question;
      localStorage.setItem('question', angular.toJson(question));
      $scope.modal.hide();
    };


    $scope.openQuestion = localStorage.getItem('question');
    $scope.didSurvey = localStorage.getItem('didSurvey');

    // check if we user answered all questions
    if (!$scope.openQuestion && !$scope.didSurvey) {
      showPopup();
    }

    // confirm answer and go next
    $scope.confirmAnswer = function (question, answer) {
      if (answer) {
        if (question.schema.format === "integer") {
          answer = parseInt(answer);
        } else if (question.schema.format === "float") {
          answer = parseFloat(answer);
        }


        // send the answer to backend
        activityService.addRecord($rootScope.user.id, question.id, answer).then(function () {
          console.log('läpi meni');
        });

        // get new question
        service.getQuestion(question, answer).then(function (result) {
          // if we got question
          if (result) {
            $scope.modaldata.question = result;
          } else {
            // when we answer the last question do stuff
            $scope.modaldata.question = false;
            $scope.modaldata.finished = true;
            $scope.openQuestion = false;
            // set flag
            localStorage.setItem('didSurvey', "1");
            localStorage.removeItem('question');
            // hide modal after couple secs
            setTimeout(function () {
              $scope.modal.hide();
            }, 2500);
          }
        });
      }
    };

    // init
    activate();

    function activate() {
      var id = localStorage.getItem('id');
      service.getUserProfile(id);

      $scope.$on('notify', function () {
        $scope.notifications = eventService.getEvents();
      });
      $rootScope.isAuthenticated = authService.isAuthenticated();

      $scope.ui = {};
      $scope.ui.activityLimitSize = 5;
      $scope.ui.notificationLimit = 1;
      $scope.ui.notificationIndex = 0;
      $scope.showNotifications = true;

      eventService.getEvents().then(function (result) {
        $scope.notifications = result;
      });

      $rootScope.socialProfile = service.getSocialProfileFromStorage();

      activityService.getPushupPercentage(id).then(function (pushupQuantile) {
        pushupQuantile *= 100;
        $scope.pushupChartData = [pushupQuantile, 0, 100 - pushupQuantile];
        $scope.pushupQuantile = pushupQuantile.toFixed(2);
      });

      activityService.getCooperPercentage(id).then(function (cooperQuantile) {
        cooperQuantile *= 100;
        $scope.cooperChartData = [cooperQuantile, 0, 100 - cooperQuantile];
        $scope.cooperQuantile = cooperQuantile.toFixed(2);
      });
    };

    $scope.changeLimit = function (direction) {
      if (direction === 'more') {
        $scope.ui.activityLimitSize += 5;
      } else {
        $scope.ui.activityLimitSize = 5;
      }
    };

    $scope.nextNotification = function () {
      $scope.ui.notificationIndex += 1;
      if (angular.isUndefined($scope.notifications[$scope.ui.notificationIndex])
      && $scope.notifications[$scope.ui.notificationIndex] == null) {
        $scope.hideNotifications();
      }
    };

    $scope.previousNotification = function () {
      if ($scope.ui.notificationIndex > 0) {
        $scope.ui.notificationIndex -= 1;
      }
    };

    $scope.hideNotifications = function () {
      $scope.showNotifications = false;
    };

    // get activity texts
    $scope.getActivityText = function (text) {
      return sharedService.getActivityText(text);
    };

    $scope.getActivityMeasurement = function (text) {
      return sharedService.getActivityMeasurement(text);
    };

    // pie chart settings
    $scope.labelsForCharts = ["Muut", '', "Sijoituksesi"];

    // bar chart settings
    $scope.colors = ['#45b7cd', '#ff6384', '#ff8e72'];
  }
})();
