(function () {
    'use strict';
    angular
        .module('user')
        .factory('userService', userService);

    userService.$inject = ['$rootScope', '$location', '$http', '$q', 'activityService', '$ionicPopup', '$ionicLoading', 'authService', '$ionicHistory', '$state', 'sharedService'];

    function userService($rootScope, $location, $http, $q, activityService, $ionicPopup, $ionicLoading, authService, $ionicHistory, $state, sharedService) {

       var origin = 'http://resultp.jumar.io';

       // authorize user with auth0
       userService.authorize = function () {
        return authService.login();
       };

       userService.loginToTikki = function (data) {
           var deferred= $q.defer();

           $http({
               method: 'POST',
               url: $rootScope.apiUrl + '/login',
               data: data
           }).then(res => {
               if(res) {
                   localStorage.setItem('tikki_token', res.data.result.jwt);
                   $http.defaults.headers.common.Authorization = 'Bearer ' + res.data.result.jwt;
                   $rootScope.user = res.data.result.user.payload;
                   localStorage.setItem('id', res.data.result.user.id);
;               }
                deferred.resolve(res);
           }).catch(err => {
               deferred.resolve(false);
           })

           return deferred.promise;
       }

       // create new user and resolve the newly created user object.
       userService.getNewUserId = function () {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: $rootScope.apiUrl + '/uuid'
            }).then(function successCallback(response) {
                if(response.status = 200) {
                    // set userId to sessionstorage
                    // init user data from social profile info and response
                    $rootScope.user = {
                        id: response.data.result,
                        social_id: $rootScope.socialProfile.sub,
                        firstName: $rootScope.socialProfile.given_name,
                        lastName: $rootScope.socialProfile.family_name,
                        gender: $rootScope.socialProfile.gender
                      };

                      localStorage.setItem("id", response.data.result);
                    // resolve the user data
                    deferred.resolve(response.data.result);
                } else {
                alert('Käyttäjän luonnissa tapahtui virhe');
                };
            }, error => errorCallback(error));

            return deferred.promise;
       };

       // update user payload
       userService.createUserInfo = function (user) {
            var deferred = $q.defer();
            $ionicLoading.show();
            if(!user.id) {
                user.id = localStorage.getItem('id');
            }
            // set request payload
            var data = {
                "id": user.id,
                "token": localStorage.getItem("id_token"),
                "payload": {
                    "firstName": user.firstName,
                    "lastName": user.lastName,
                    "city": user.city,
                    "gender": user.gender,
                    "birthDate": user.birthDate
                }
            };

            $http({
                method: 'POST',
                url: $rootScope.apiUrl + '/user',
                data: data
            }).then(function successCallback(response) {
                if(response.status == 200) {
                    // set userId to sessionstorage
                    localStorage.setItem('tikki_token', response.data.result.jwt);
                    $http.defaults.headers.common.Authorization = 'Bearer ' + response.data.result.jwt;
                    // resolve the user data
                    $ionicLoading.hide();
                    deferred.resolve(response);
                } else {
                alert('Päivityksessä tapahtui virhe');
                };
            }, error => errorCallback(error));

            return deferred.promise;
       };

        userService.deleteProfile = function (id) {
        var deferred = $q.defer();
        $ionicLoading.show(),

        $http({
                method: 'DELETE',
                url: $rootScope.apiUrl + '/user/' + id
            }).then(function successCallback(response) {
                if(response.status == 200) {
                    deferred.resolve(true);
                    $state.go('login');

                }
            }, error => errorCallback(error));

            return deferred.promise;
       };

       // get user object.
       userService.getUserProfile = function (id) {

            var deferred = $q.defer();
            $ionicLoading.show();

            $http({
                method: 'GET',
                url: $rootScope.apiUrl + '/user?id=' + id
            }).then(function successCallback(response) {
                if(response.status == 200) {

                    var userData = response.data.result[0];
                    if(userData) {
                    // get user activities
                        activityService.getUserActivities(id).then(function (activities) {
                            userData.activities = activities.filter(function (item) {
                                if(item.payload) {
                                    return item.payload.category_id != 2;
                                }
                            });

                            $rootScope.user = userData.payload;
                            $rootScope.user.activities = sharedService.sortByDate(userData.activities);
                            $rootScope.user.id = userData.id;
                            $rootScope.user.age = sharedService.calculateAge(userData.payload.birthDate);
                            $rootScope.user.maxValues = sharedService.getMaxValues(userData.activities);
                            userData.activities.forEach(function (activity) {
                                    activity.formattedDate = sharedService.parseDateToFinnishFormat(new Date(activity.created_at));
                                    if(activity.type_id == 1) {
                                        $rootScope.UserDoneCooper = true;
                                    }
                                    if(activity.type_id == 2) {
                                        $rootScope.UserDonePushups = true;
                                    }
                                    if(activity.type_id == 3) {
                                        $rootScope.UserDoneSitups = true;
                                    }
                                    if(activity.type_id == 4) {
                                        $rootScope.UserDoneLongJump = true;
                                    }
                                    if(activity.type_id == 5) {
                                        $rootScope.UserDonePullUps = true;
                                    }
                            });

                            deferred.resolve(userData);
                            $ionicLoading.hide();
                        });
                    } else {
                        deferred.resolve(false);
                        $ionicLoading.hide();
                    }

                }
            }, error => errorCallback(error));

            return deferred.promise;
       };

       // get user object.
       userService.getUserProfileBySocialId = function (social_id) {

            var deferred = $q.defer();
            $ionicLoading.show();

            $http({
                method: 'GET',
                url: $rootScope.apiUrl + '/user?social_id=' + social_id
            }).then(function successCallback(response) {
                if(response.status == 200) {

                    var userData = response.data.result[0];
                    if(userData) {
                    // get user activities
                        activityService.getUserActivities(userData.id).then(function (activities) {
                            userData.activities = activities;
                            deferred.resolve(userData);
                            $ionicLoading.hide();
                        });
                    } else {
                        deferred.resolve(false);
                        $ionicLoading.hide();
                    }

                }
            }, error => errorCallback(error));

            return deferred.promise;
       };

       userService.getSocialProfileFromStorage = function () {
            return angular.fromJson(localStorage.getItem('socialProfile'));
       }

       userService.logout = function () {
            $ionicHistory.nextViewOptions({
                    disableBack: true
                });
            authService.logout();
            $state.go('login');
       }

       userService.setSocialProfile = function (socialProfile) {
           console.log(socialProfile);
           userService.socialProfile = socialProfile;
       }

       // get questions
       userService.getQuestions = function () {

        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: $rootScope.apiUrl + '/schema'
        }).success(function (data) {
            var questions = data.result.filter(i => i.category_id == 2);
            deferred.resolve(questions);
            sessionStorage.setItem('questionsLength', questions.length)
        });

        return deferred.promise;

       };

       // get single question
       userService.getQuestion = function (oldQuestion, answer) {

        var deferred =  $q.defer();

        var questionSavedToStorage = angular.fromJson(localStorage.getItem('question'));
        if(!questionSavedToStorage) {
            userService.getQuestions().then(function (data) {
                // check we got data
                if(data && data.length > 0) {
                    // answer isnt there so lets bring out the first question
                    if(!answer) {
                        var question = data[0];
                    }
                    // got answer so get next q
                    else {
                        var oldIndex;
                        // get old q index from array
                        data.forEach(function (item, index) {
                            if(item.id == oldQuestion.id) {
                                oldIndex = index;
                            };
                        });
                        // next question
                        question = data[oldIndex + 1];
                    }
                    // resolve if everything went ok
                    if(question) {
                        deferred.resolve(question);
                    } else {
                        deferred.resolve(false);
                    }
                }
            });
        } else {
            localStorage.removeItem('question');
            deferred.resolve(questionSavedToStorage)
        }

        return deferred.promise;

       };

    function errorCallback(response) {
        $ionicLoading.hide();
        // A confirm dialog
           var confirmPopup = $ionicPopup.confirm({
                title: 'Serveri ei vastaa',
                template: 'Voit kokeilla ladata sivun uudelleen'
                });

                confirmPopup.then(function(res) {
                if(res) {
                    location.reload();
                } else {

                }
            });

    }
       return userService;
    }
})();
