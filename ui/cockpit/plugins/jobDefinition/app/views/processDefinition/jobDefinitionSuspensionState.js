'use strict';

var angular = require('angular');

module.exports = [
  '$scope', '$http', '$filter', 'Uri', 'Notifications', '$modalInstance', 'jobDefinition', 'translateFilter',
  function($scope,   $http,   $filter,   Uri,   Notifications,   $modalInstance,   jobDefinition, translateFilter) {

    var BEFORE_UPDATE = 'BEFORE_UPDATE',
        PERFORM_UPDATE = 'PERFORM_UDPATE',
        UPDATE_SUCCESS = 'SUCCESS',
        UPDATE_FAILED = 'FAIL';

    var dateFilter = $filter('date'),
        dateFormat = 'yyyy-MM-dd\'T\'HH:mm:ss';


    $scope.jobDefinition = jobDefinition;

    $scope.status = BEFORE_UPDATE;

    $scope.data = {
      includeJobs : true,
      executeImmediately : true,
      executionDate : dateFilter(Date.now(), dateFormat)
    };

    $scope.$on('$routeChangeStart', function() {
      $modalInstance.close($scope.status);
    });

    $scope.updateSuspensionState = function() {
      $scope.status = PERFORM_UPDATE;

      var data = {};

      data.suspended = !jobDefinition.suspended;
      data.includeJobs = $scope.data.includeJobs;
      data.executionDate = !$scope.data.executeImmediately ? $scope.data.executionDate : null;

      $http.put(Uri.appUri('engine://engine/:engine/job-definition/' + jobDefinition.id + '/suspended/'), data).success(function() {
        $scope.status = UPDATE_SUCCESS;

        if ($scope.data.executeImmediately) {
          Notifications.addMessage({'status': translateFilter('PLUGIN_JOBDEFINITION_STATE_STATUS'), 'message': translateFilter('PLUGIN_JOBDEFINITION_STATE_MESSAGES_1'), 'exclusive': true });
        } else {
          Notifications.addMessage({'status': translateFilter('PLUGIN_JOBDEFINITION_STATE_STATUS'), 'message': translateFilter('PLUGIN_JOBDEFINITION_STATE_MESSAGES_2'), 'exclusive': true });
        }

      }).error(function(data) {
        $scope.status = UPDATE_FAILED;

        if ($scope.data.executeImmediately) {
          Notifications.addError({'status': translateFilter('PLUGIN_JOBDEFINITION_STATE_STATUS'), 'message': translateFilter('PLUGIN_JOBDEFINITION_STATE_ERR_1') + data.message, 'exclusive': true });
        } else {
          Notifications.addError({'status': translateFilter('PLUGIN_JOBDEFINITION_STATE_STATUS'), 'message': translateFilter('PLUGIN_JOBDEFINITION_STATE_ERR_2') + data.message, 'exclusive': true });
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
      response.suspended = !jobDefinition.suspended;
      response.executeImmediately = $scope.data.executeImmediately;
      response.executionDate = $scope.data.executionDate;

      $modalInstance.close(response);

    };

  }];
