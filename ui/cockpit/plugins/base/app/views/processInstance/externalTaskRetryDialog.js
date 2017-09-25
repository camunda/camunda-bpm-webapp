  'use strict';

  module.exports = [
    '$scope', '$location', 'Notifications', 'camAPI', '$modalInstance', 'incident', 'translateFilter',
    function($scope,   $location,   Notifications,   camAPI,   $modalInstance,   incident, translateFilter) {

      var FINISHED = 'finished',
          PERFORM = 'performing',
          FAILED = 'failed';

      var ExternalTask = camAPI.resource('external-task');

      $scope.$on('$routeChangeStart', function() {
        $modalInstance.close($scope.status);
      });

      $scope.incrementRetry = function() {
        $scope.status = PERFORM;

        ExternalTask.retries({
          id: incident.configuration,
          retries: 1
        }, function() {
          $scope.status = FINISHED;

          Notifications.addMessage({
            status: translateFilter('PLUGIN_EXTERNAL_TASK_STATUS_FINISHED'),
            message: translateFilter('PLUGIN_EXTERNAL_TASK_MESSAGE_1') + '.',
            exclusive: true
          });
        }, function(error) {
          $scope.status = FAILED;
          Notifications.addError({
            status: translateFilter('PLUGIN_EXTERNAL_TASK_STATUS_FINISHED'),
            message: translateFilter('PLUGIN_EXTERNAL_TASK_MESSAGE_2') + ': ' + error.data.message,
            exclusive: true
          });
        });
      };

      $scope.close = function(status) {
        $modalInstance.close(status);
      };
    }];
