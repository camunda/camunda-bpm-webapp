  'use strict';
  module.exports = [
    '$scope', '$location', 'Notifications', 'ProcessInstanceResource',
    '$modalInstance', 'processInstance', 'processData', 'Views', 'translateFilter',
    function($scope,   $location,   Notifications,   ProcessInstanceResource,
      $modalInstance,   processInstance,   processData,   Views, translateFilter) {

      var BEFORE_CANCEL = 'beforeCancellation',
          PERFORM_CANCEL = 'performCancellation',
          CANCEL_SUCCESS = 'cancellationSuccess',
          CANCEL_FAILED = 'cancellationFailed';

      $scope.processInstance = processInstance;

      var cancelProcessInstanceData = processData.newChild($scope);

      $scope.options = {
        skipCustomListeners: true,
        skipIoMappings: true
      };

      $scope.$on('$routeChangeStart', function() {
        $modalInstance.close($scope.status);
      });

      cancelProcessInstanceData.provide('subProcessInstances', function() {
        return ProcessInstanceResource.query({
          firstResult: 0,
          maxResults: 5
        }, {
          superProcessInstance:
        processInstance.id
        }).$promise;
      });

      cancelProcessInstanceData.provide('subProcessInstancesCount', function() {
        return ProcessInstanceResource.count({
          superProcessInstance: processInstance.id
        }).$promise;
      });

      cancelProcessInstanceData.observe(['subProcessInstancesCount', 'subProcessInstances'], function(subProcessInstancesCount, subProcessInstances) {
        $scope.subProcessInstancesCount = subProcessInstancesCount.count;
        $scope.subProcessInstances = subProcessInstances;

        $scope.status = BEFORE_CANCEL;
      });

      $scope.cancelProcessInstance = function() {
        $scope.status = PERFORM_CANCEL;

        $scope.processInstance.$delete($scope.options, function() {
        // success
          $scope.status = CANCEL_SUCCESS;
          Notifications.addMessage({'status': translateFilter('PLUGIN_CANCEL_PROCESS_STATUS_CANCELED'), 'message': translateFilter('PLUGIN_CANCEL_PROCESS_MESSAGE_1') + '.'});

        }, function(err) {
        // failure
          $scope.status = CANCEL_FAILED;
          Notifications.addError({'status': translateFilter('PLUGIN_CANCEL_PROCESS_STATUS_FAILED'), 'message': translateFilter('PLUGIN_CANCEL_PROCESS_MESSAGE_2') + '. ' + err.data.message, 'exclusive': ['type']});
        });
      };

      $scope.close = function(status) {
        $modalInstance.close(status);

      // if the cancellation of the process instance was successful,
        if (status === CANCEL_SUCCESS) {
          var historyProvider = Views.getProvider({
            id: 'history',
            component: 'cockpit.processInstance.view'
          });

          var path;
          var search;

          if (historyProvider) {
            // redirect to the corresponding historic process instance view
            // keep search params
            search = $location.search();
            path = '/process-instance/' + processInstance.id + '/history';
          }
          else {
          // or redirect to the corresponding process definition overview.
            path = '/process-definition/' + processInstance.definitionId;
          }

          $location.path(path);
          $location.search(search || {});
          $location.replace();
        }
      };
    }];
