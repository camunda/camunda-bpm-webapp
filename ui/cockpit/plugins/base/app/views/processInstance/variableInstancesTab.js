'use strict';

var angular = require('angular');
var fs = require('fs');

var searchWidgetUtils = require('../../../../../../common/scripts/util/search-widget-utils');
var paginationUtils = require('../../../../../../common/scripts/util/pagination-utils');
var variableInstancesTabSearchConfig = JSON.parse(fs.readFileSync(__dirname + '/variable-instances-tab-search-config.json', 'utf8'));

var instancesTemplate = fs.readFileSync(__dirname + '/variable-instances-tab.html', 'utf8');
var inspectTemplate = require('../../../../../client/scripts/components/variables/variable-inspect-dialog');
var uploadTemplate = require('../../../../../client/scripts/components/variables/variable-upload-dialog');


module.exports = function(ngModule) {
  ngModule.controller('VariableInstancesController', [
    '$scope', '$sce', '$http', 'search', 'Uri', 'LocalExecutionVariableResource',
    'Notifications', '$modal', '$q', 'camAPI', 'createIsSearchQueryChangedFunction', 'translateFilter',
    function($scope, $sce, $http, search, Uri, LocalExecutionVariableResource,
      Notifications, $modal, $q, camAPI, createIsSearchQueryChangedFunction, translateFilter) {

        // input: processInstance, processData

      var variableInstanceData = $scope.processData.newChild($scope),
          processInstance = $scope.processInstance,
          variableInstanceIdexceptionMessageMap,
          variableCopies;

      var executionService = camAPI.resource('execution'),
          taskService = camAPI.resource('task');

      var isSearchQueryChanged = createIsSearchQueryChangedFunction();

      var pages = paginationUtils.initializePaginationInController($scope, search, function(newValue, oldValue) {
        if (!angular.equals(newValue, oldValue) && !isSearchQueryChanged()) {
          updateView($scope.instanceIdToInstanceMap, $scope.searchConfig.searches);
        }
      });

      variableInstanceData.provide('pages', pages);

      $scope.searchConfig = angular.copy(variableInstancesTabSearchConfig);
      for (var i = 0; i < $scope.searchConfig.types.length; i++) {
        $scope.searchConfig.types[i].id.value = translateFilter($scope.searchConfig.types[i].id.value);
        if($scope.searchConfig.types[i].hasOwnProperty('operators')) {
          for (var j = 0; j < $scope.searchConfig.types[i].operators.length; j++) {
            $scope.searchConfig.types[i].operators[j].value = translateFilter($scope.searchConfig.types[i].operators[j].value);
          }
        }
      }
      for (var tooltip in $scope.searchConfig.tooltips) {
        $scope.searchConfig.tooltips[tooltip] = translateFilter($scope.searchConfig.tooltips[tooltip]);
      }
      variableInstanceData.provide('searches', angular.copy($scope.searchConfig.searches));

      $scope.$watch('searchConfig.searches', function(newValue, oldValue) {
        if (!angular.equals(newValue, oldValue)) {
          variableInstanceData.set('searches', angular.copy($scope.searchConfig.searches));
        }
      });

      variableInstanceData.observe('instanceIdToInstanceMap', function(instanceIdToInstanceMap) {
        $scope.instanceIdToInstanceMap = instanceIdToInstanceMap;
      });

      $scope.getSearchQueryForSearchType = searchWidgetUtils.getSearchQueryForSearchType.bind(null, 'activityInstanceIdIn');

      $scope.$on('addVariableNotification', function() {
        updateView($scope.instanceIdToInstanceMap, $scope.searchConfig.searches);
      });

      variableInstanceData.observe(
        ['instanceIdToInstanceMap', 'searches'],
        function(instanceIdToInstanceMap, searches) {
          if (searches) {
            updateView(instanceIdToInstanceMap, searches);
          }
        }
      );

      $scope.uploadVariable = function(info) {
        var promise = $q.defer();
        $modal.open({
          resolve: {
            basePath: function() { return getBasePath(info.variable); },
            variable: function() { return info.variable; }
          },
          controller: uploadTemplate.controller,
          template: uploadTemplate.template
        })
        .result.then(function() {
          // updated the variable, need to get the new data
          // reject the promise anyway
          promise.reject();

          // but then update the filter to force re-get of variables
          variableInstanceData.set('filter', angular.copy($scope.filter));
        }, function() {
          // did not update the variable, reject the promise
          promise.reject();
        });

        return promise.promise;
      };

      $scope.downloadVariable = function(info) {
        return Uri.appUri('engine://engine/:engine/variable-instance/' + info.variable.id +'/data');
      };

      $scope.deleteVariable = function(info) {
        var promise = $q.defer();

        var callback = function(error) {
          if(error) {
            Notifications.addError({
              status: translateFilter('PLUGIN_VARIABLE_INSTANCES_STATUS_VARIABLE'),
              message: translateFilter('PLUGIN_VARIABLE_INSTANCES_MESSAGES_ERROR_0', { name: info.variable.name }),
              exclusive: true,
              duration: 5000
            });
            promise.reject();
          } else {
            Notifications.addMessage({
              status: translateFilter('PLUGIN_VARIABLE_INSTANCES_STATUS_VARIABLE'),
              message: translateFilter('PLUGIN_VARIABLE_INSTANCES_MESSAGES_ADD_0', { name: info.variable.name }),
              duration: 5000
            });
            promise.resolve(info.variable);
          }
        };

        if(info.original.taskId) {
          taskService.deleteVariable({
            id: info.original.taskId,
            varId: info.variable.name
          }, callback);
        } else {
          executionService.deleteVariable({
            id: info.variable.executionId,
            varId: info.variable.name
          }, callback);
        }

        return promise.promise;
      };

      $scope.editVariable = function(info) {
        var promise = $q.defer();

        $modal.open({
          template: inspectTemplate.template,

          controller: inspectTemplate.controller,

          windowClass: 'cam-widget-variable-dialog',

          resolve: {
            basePath: function() { return getBasePath(info.variable); },
            history: function() { return false; },
            readonly: function() { return false; },
            variable: function() { return info.variable; }
          }
        })
        .result.then(function() {
          // updated the variable, need to get the new data
          // reject the promise anyway
          promise.reject();

          // but then update the filter to force re-get of variables
          variableInstanceData.set('filter', angular.copy($scope.filter));
        }, function() {
          // did not update the variable, reject the promise
          promise.reject();
        });

        return promise.promise;
      };

      $scope.saveVariable = function(info) {
        var promise = $q.defer();
        var variable = info.variable;
        var modifiedVariable = {};

        var newValue = variable.value;
        var newType = variable.type;

        var newVariable = { value: newValue, type: newType };
        modifiedVariable[variable.name] = newVariable;

        var callback = function(error) {
          if(error) {
            Notifications.addError({
              status: translateFilter('PLUGIN_VARIABLE_INSTANCES_STATUS_VARIABLE'),
              message: translateFilter('PLUGIN_VARIABLE_INSTANCES_MESSAGES_ERROR_1', { name: variable.name }),
              exclusive: true,
              duration: 5000
            });
            variableInstanceIdexceptionMessageMap[variable.id] = error.data;
            promise.reject();
          } else {
            Notifications.addMessage({
              status: translateFilter('PLUGIN_VARIABLE_INSTANCES_STATUS_VARIABLE'),
              message: translateFilter('PLUGIN_VARIABLE_INSTANCES_MESSAGES_ADD_1', { name: variable.name}),
              duration: 5000
            });
            angular.extend(variable, newVariable);
            promise.resolve(info.variable);
          }
        };

        if(info.original.taskId) {
          taskService.modifyVariables({
            id: info.original.taskId,
            modifications: modifiedVariable
          }, callback);
        } else {
          executionService.modifyVariables({
            id: variable.executionId,
            modifications: modifiedVariable
          }, callback);
        }

        return promise.promise;
      };

      // Variables table header
      $scope.getHeaderVariable = {
        'name' : translateFilter('PLUGIN_VARIABLE_NAME'),
        'value': translateFilter('PLUGIN_VARIABLE_VALUE'),
        'type' : translateFilter('PLUGIN_VARIABLE_TYPE'),
        'scope' : translateFilter('PLUGIN_VARIABLE_SCOPE')
      };

      function getBasePath(variable) {
        return 'engine://engine/:engine/execution/' + variable.executionId + '/localVariables/' + variable.name;
      }

      function updateView(instanceIdToInstanceMap, searches) {
        var page = pages.current,
            count = pages.size,
            firstResult = (page - 1) * count;

        var defaultParams = {
          processInstanceIdIn: [ processInstance.id ]
        };

        var pagingParams = {
          firstResult: firstResult,
          maxResults: count,
          deserializeValues: false
        };

        var variableQuery = searchWidgetUtils.createSearchQueryForSearchWidget(searches, ['activityInstanceIdIn'], ['variableValues']);

        var params = angular.extend({}, defaultParams, variableQuery);

        $scope.variables = null;
        $scope.loadingState = 'LOADING';

          // get the 'count' of variables
        $http.post(Uri.appUri('engine://engine/:engine/variable-instance/count'), params).success(function(data) {
          pages.total = data.count;
        });

        variableInstanceIdexceptionMessageMap = {};
        variableCopies = {};

        $http.post(Uri.appUri('engine://engine/:engine/variable-instance/'), params, { params: pagingParams }).success(function(data) {

          $scope.variables = data.map(function(item) {
            var instance = instanceIdToInstanceMap[item.activityInstanceId];
            item.instance = instance;
            variableCopies[item.id] = angular.copy(item);

              // prevents the list to throw an error when the activity instance is missing
            var activityInstanceLink = '';
            if(instance) {
              activityInstanceLink = '<a ng-href="#/process-instance/' +
                  processInstance.id + '/runtime' +
                  '?detailsTab=variables-tab&'+ $scope.getSearchQueryForSearchType(instance.id) +
                  '" title="' +
                  instance.id +
                  '">' +
                  instance.name  +
                  '</a>';
            }

            return {
              variable: {
                id:           item.id,
                name:         item.name,
                type:         item.type,
                value:        item.value,
                valueInfo:    item.valueInfo,
                executionId:  item.executionId
              },
              original: item,
              additions: {
                scope: {
                  html: activityInstanceLink,
                  scopeVariables: {
                    processData: $scope.processData
                  }
                }
              }
            };
          });

          $scope.loadingState = data.length ? 'LOADED' : 'EMPTY';
        });
      }

    }]);

  var Configuration = function PluginConfiguration(ViewsProvider) {

    ViewsProvider.registerDefaultView('cockpit.processInstance.runtime.tab', {
      id: 'variables-tab',
      label: 'PLUGIN_VARIABLE_INSTANCES_LABEL',
      template: instancesTemplate,
      controller: 'VariableInstancesController',
      priority: 20
    });
  };

  Configuration.$inject = ['ViewsProvider'];
  ngModule.config(Configuration);
};
