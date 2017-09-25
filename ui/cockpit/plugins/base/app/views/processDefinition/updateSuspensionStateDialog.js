'use strict';

var angular = require('angular');

module.exports = [
  '$scope', '$http', '$filter', 'Uri', 'Notifications', '$modalInstance', 'processDefinition', 'translateFilter',
  function($scope,   $http,   $filter,   Uri,   Notifications,   $modalInstance,   processDefinition, translateFilter) {

    var BEFORE_UPDATE = 'BEFORE_UPDATE',
        PERFORM_UPDATE = 'PERFORM_UDPATE',
        UPDATE_SUCCESS = 'SUCCESS',
        UPDATE_FAILED = 'FAIL';

    var dateFilter = $filter('date'),
        dateFormat = 'yyyy-MM-dd\'T\'HH:mm:ss';


    $scope.processDefinition = processDefinition;

    $scope.status = BEFORE_UPDATE;

    $scope.data = {
      includeInstances : true,
      executeImmediately : true,
      executionDate : dateFilter(Date.now(), dateFormat)
    };

    $scope.$on('$routeChangeStart', function() {
      $modalInstance.close($scope.status);
    });

    $scope.updateSuspensionState = function() {
      $scope.status = PERFORM_UPDATE;

      var data = {};

      data.suspended = !processDefinition.suspended;
      data.includeProcessInstances = $scope.data.includeInstances;
      data.executionDate = !$scope.data.executeImmediately ? $scope.data.executionDate : null;

      $http
      .put(Uri.appUri('engine://engine/:engine/process-definition/' + processDefinition.id + '/suspended/'), data)
      .success(function() {
        $scope.status = UPDATE_SUCCESS;

        if ($scope.data.executeImmediately) {
          Notifications.addMessage({
            status: translateFilter('PLUGIN_UPDATE_SUSPENSION_STATE_STATUS_FINISHED'),
            message: translateFilter('PLUGIN_UPDATE_SUSPENSION_STATE_MESSAGE_1') + '.',
            exclusive: true
          });
        } else {
          Notifications.addMessage({
            status: translateFilter('PLUGIN_UPDATE_SUSPENSION_STATE_STATUS_FINISHED'),
            message: translateFilter('PLUGIN_UPDATE_SUSPENSION_STATE_MESSAGE_2') + '.',
            exclusive: true
          });
        }

      }).error(function(response) {
        $scope.status = UPDATE_FAILED;

        if ($scope.data.executeImmediately) {
          Notifications.addError({
            status: translateFilter('PLUGIN_UPDATE_SUSPENSION_STATE_STATUS_FINISHED'),
            message: translateFilter('PLUGIN_UPDATE_SUSPENSION_STATE_MESSAGE_3') + ': ' + response.message,
            exclusive: true
          });
        } else {
          Notifications.addMessage({
            status: translateFilter('PLUGIN_UPDATE_SUSPENSION_STATE_STATUS_FINISHED'),
            message: translateFilter('PLUGIN_UPDATE_SUSPENSION_STATE_MESSAGE_4')+ ': ' + response.message,
            exclusive: true
          });
        }
      });
    };

    $scope.isValid = function() {
      var formScope = angular.element('[name="updateSuspensionStateForm"]').scope();
      return (formScope && formScope.updateSuspensionStateForm) ? formScope.updateSuspensionStateForm.$valid : false;
    };

    $scope.close = function(status) {
      var response = {};

      response.status = status;
      response.suspended = !processDefinition.suspended;
      response.executeImmediately = $scope.data.executeImmediately;
      response.executionDate = $scope.data.executionDate;

      $modalInstance.close(response);
    };

  }];
