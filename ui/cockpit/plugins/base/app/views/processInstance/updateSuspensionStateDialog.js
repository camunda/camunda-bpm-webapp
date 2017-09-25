  'use strict';

  module.exports = [
    '$scope', '$http', '$filter', 'Uri', 'Notifications', '$modalInstance', 'processInstance', 'translateFilter',
    function($scope,   $http,   $filter,   Uri,   Notifications,   $modalInstance,   processInstance, translateFilter) {

      var BEFORE_UPDATE = 'BEFORE_UPDATE',
          PERFORM_UPDATE = 'PERFORM_UDPATE',
          UPDATE_SUCCESS = 'SUCCESS',
          UPDATE_FAILED = 'FAIL';

      $scope.processInstance = processInstance;

      $scope.status = BEFORE_UPDATE;

      $scope.$on('$routeChangeStart', function() {
        $modalInstance.close($scope.status);
      });

      $scope.updateSuspensionState = function() {
        $scope.status = PERFORM_UPDATE;

        var data = {};

        data.suspended = !processInstance.suspended;

        $http.put(Uri.appUri('engine://engine/:engine/process-instance/' + processInstance.id + '/suspended/'), data).success(function() {
          $scope.status = UPDATE_SUCCESS;

          Notifications.addMessage({
            status: translateFilter('PLUGIN_UPDATE_DIALOG_STATUS_FINISHED'),
            message: translateFilter('PLUGIN_UPDATE_DIALOG_MESSAGES_1'),
            exclusive: true
          });

        }).error(function(data) {
          $scope.status = UPDATE_FAILED;

          Notifications.addError({
            status: translateFilter('PLUGIN_UPDATE_DIALOG_STATUS_FINISHED'),
            message: translateFilter('PLUGIN_UPDATE_DIALOG_ERROR_1') + data.message,
            exclusive: true
          });
        });
      };

      $scope.close = function(status) {
        var response = {};

        response.status = status;
        response.suspended = !processInstance.suspended;

        $modalInstance.close(response);
      };

    }];
