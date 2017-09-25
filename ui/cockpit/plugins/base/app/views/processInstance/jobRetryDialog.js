  'use strict';

  module.exports = [
    '$scope', '$location', 'Notifications', 'JobResource', '$modalInstance', 'incident', 'translateFilter',
    function($scope,   $location,   Notifications,   JobResource,   $modalInstance,   incident, translateFilter) {

      var FINISHED = 'finished',
          PERFORM = 'performing',
          FAILED = 'failed';

      $scope.$on('$routeChangeStart', function() {
        $modalInstance.close($scope.status);
      });

      $scope.incrementRetry = function() {
        $scope.status = PERFORM;

        JobResource.setRetries({
          id: incident.configuration
        }, {
          retries: 1
        }, function() {
          $scope.status = FINISHED;

          Notifications.addMessage({
            status: translateFilter('PLUGIN_JOB_RETRY_STATUS_FINISHED'),
            message: translateFilter('PLUGIN_JOB_RETRY_MESSAGE_1'),
            exclusive: true
          });
        }, function(error) {
          $scope.status = FAILED;
          Notifications.addError({
            status: translateFilter('PLUGIN_JOB_RETRY_STATUS_FINISHED'),
            message: translateFilter('PLUGIN_JOB_RETRY_ERROR_1') + error.data.message,
            exclusive: true
          });
        });
      };

      $scope.close = function(status) {
        $modalInstance.close(status);
      };
    }];
