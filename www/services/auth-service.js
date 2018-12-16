(function () {
  'use strict';

  angular
    .module('auth', [])
    .service('authService', authService);

  authService.$inject = ['$state', 'angularAuth0', '$timeout', '$q', '$http', '$rootScope'];

  function authService($state, angularAuth0, $timeout, $q, $http, $rootScope) {
    function authorize() {
      angularAuth0.authorize();
    }

    function handleAuthentication() {

      var deferred = $q.defer();

      angularAuth0.parseHash(function (err, authResult) {
        if (authResult && authResult.accessToken && authResult.idToken) {
          setSession(authResult);
          deferred.resolve();
        } else if (err) {
          $timeout(function () {
            deferred.resolve();
          });
        }
      });

      return deferred.promise;
    }

    function renewToken() { // TODO: Is this really in use?
      angularAuth0.renewAuth(
        {
          audience: 'https://tikkifi.eu.auth0.com/userinfo',
          redirectUri: 'http://localhost:8100/silent.html',
          usePostMessage: true
        },
        function (err, result) {
          if (err) {
            console.error(err);
          } else {
            setSession(result);
          }
        }
      );
    }

    function setSession(authResult) {
      // Set the time that the access token will expire at
      const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
      localStorage.setItem('access_token', authResult.accessToken);
      localStorage.setItem('id_token', authResult.idToken);
      localStorage.setItem('expires_at', expiresAt);

      // schedule token renewal
      scheduleRenewal();

    }

    function logout() {
      // Remove tokens and expiry time from localStorage
      localStorage.clear();
      $http.defaults.headers.common.Authorization = '';
      clearTimeout(tokenRenewalTimeout);
    }

    function isAuthenticated() {
      // Check whether the current time is past the
      // access token's expiry time
      const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
      return new Date().getTime() < expiresAt;
    }

    var userProfile;

    function getProfile(cb) {
      var accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('Access token must exist to fetch profile');
      }
      angularAuth0.client.userInfo(accessToken, function (err, profile) {
        if (profile) {
          setUserProfile(profile);
        }
        cb(err, profile);
      });
    }

    function setUserProfile(profile) {
      userProfile = profile;
      $rootScope.socialProfile = profile;
      localStorage.setItem("socialProfile", angular.toJson(profile));
    }

    function getCachedProfile() {
      return userProfile;
    }

    var tokenRenewalTimeout;
    // ...
    function scheduleRenewal() {
      var expiresAt = JSON.parse(localStorage.getItem('expires_at'));
      var delay = expiresAt - Date.now();
      if (delay > 0) {
        tokenRenewalTimeout = setTimeout(function () {
          renewToken();
        }, delay);
      }
    }

    return {
      // ...
      authorize: authorize,
      handleAuthentication: handleAuthentication,
      renewToken: renewToken,
      logout: logout,
      isAuthenticated: isAuthenticated,
      getProfile: getProfile,
      setUserProfile: setUserProfile,
      getCachedProfile: getCachedProfile,
      scheduleRenewal: scheduleRenewal
    };
  }
})();
