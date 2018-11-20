(function () {
    'use strict';
    angular
        .module('notifications')
        .factory('notificationService', notificationService);

    notificationService.$inject = ['$location', '$http', '$q', 'sharedService', '$rootScope'];

    function notificationService($location, $http, $q, sharedService, $rootScope) {

       notificationService.notify = function (content, positive, error = false) {
        var notification = {
            content: content,
            positive: positive,
            error: error
        }
        $rootScope.$broadcast('notify', notification);
       };

       return notificationService;
    }
})();