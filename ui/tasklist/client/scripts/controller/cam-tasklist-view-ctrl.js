'use strict';

var angular = require('camunda-commons-ui/vendor/angular');

module.exports = [
  '$scope',
  '$q',
  '$location',
  '$interval',
  'search',
  'dataDepend',
  'camAPI',
  function($scope, $q, $location, $interval, search, dataDepend, camAPI) {
    function getPropertyFromLocation(property) {
      var search = $location.search() || {};
      return search[property] || null;
    }

    function updateSilently(params) {
      search.updateSilently(params);
    }

    // init data depend for task list data
    var tasklistData = ($scope.tasklistData = dataDepend.create($scope));
    // get current task id from location
    var taskId = getPropertyFromLocation('task');
    var detailsTab = getPropertyFromLocation('detailsTab');

    // resources
    var Filter = camAPI.resource('filter');
    var Task = camAPI.resource('task');

    // current selected filter
    var currentFilter;

    // provide /////////////////////////////////////////////////////////////////////////////////

    /**
     * Provides the list of filters
     */
    tasklistData.provide('filterQuery', {maxResults: 50, firstResult: 0});

    tasklistData.provide('filters', [
      'filterQuery',
      function(filterQuery) {
        var deferred = $q.defer();

        Filter.list(
          Object.assign({}, filterQuery, {
            itemCount: false,
            resourceType: 'Task'
          }),
          function(err, res) {
            if (err) {
              deferred.reject(err);
            } else {
              deferred.resolve(res);
            }
          }
        );

        return deferred.promise;
      }
    ]);

    tasklistData.provide('currentFilter', [
      'filters',
      function(filters) {
        var focused,
          filterId = getPropertyFromLocation('filter');

        for (var i = 0, filter; (filter = filters[i]); i++) {
          if (filterId === filter.id) {
            focused = filter;
            break;
          }
          // auto focus first filter
          if (
            !focused ||
            filter.properties.priority < focused.properties.priority
          ) {
            focused = filter;
          }
        }

        if (currentFilter && focused && currentFilter.id !== focused.id) {
          var currentPage = getPropertyFromLocation('page');
          if (currentPage) {
            updateSilently({
              page: '1'
            });
          }
        }

        if (focused && focused.id !== filterId) {
          updateSilently({
            filter: focused.id
          });
        }

        return angular.copy(focused);
      }
    ]);

    tasklistData.provide('searchQuery', {
      processVariables: [],
      taskVariables: [],
      caseInstanceVariables: []
    });

    tasklistData.provide('taskListQuery', [
      'currentFilter',
      'searchQuery',
      function(currentFilter, searchQuery) {
        if (!currentFilter) {
          return null;
        }

        var taskListQuery = angular.copy(searchQuery);

        var firstResult = ((getPropertyFromLocation('page') || 1) - 1) * 15;
        var sorting = getPropertyFromLocation('sorting');
        try {
          sorting = JSON.parse(sorting);
        } catch (err) {
          sorting = [{}];
        }
        sorting = Array.isArray(sorting) && sorting.length ? sorting : [{}];
        sorting[0].sortOrder = sorting[0].sortOrder || 'desc';
        sorting[0].sortBy = sorting[0].sortBy || 'created';

        taskListQuery.id = currentFilter.id;
        taskListQuery.firstResult = firstResult;
        taskListQuery.maxResults = 15;
        taskListQuery.sorting = sorting;
        taskListQuery.active = true;

        return taskListQuery;
      }
    ]);

    /**
     * Provide the list of tasks
     */

    // Handeling of long-running requests
    // store state of last Request
    var lastRequest = $q.defer();
    var lastQuery = {};
    var lastRequestIsPending = false;
    // trigger reloading of the tasks if the query changes
    tasklistData.observe('taskListQuery', function(taskListQuery) {
      if (
        lastRequestIsPending &&
        JSON.stringify(taskListQuery) !== JSON.stringify(lastQuery)
      ) {
        tasklistData.changed('taskList');
      }
    });

    tasklistData.provide('taskList', [
      'taskListQuery',
      function(taskListQuery) {
        if (
          !lastRequestIsPending ||
          JSON.stringify(taskListQuery) !== JSON.stringify(lastQuery)
        ) {
          var deferred = $q.defer();
          lastRequest = deferred;
          lastQuery = taskListQuery;

          if (!taskListQuery || taskListQuery.id === null) {
            // no filter selected
            deferred.resolve({
              count: 0,
              _embedded: {}
            });
          } else {
            // filter selected
            lastRequestIsPending = true;
            Filter.getTasks(angular.copy(taskListQuery), function(err, res) {
              if (err) {
                deferred.reject(err);
              } else {
                deferred.resolve(res);
              }
              if (deferred === lastRequest) {
                lastRequestIsPending = false;
              }
            });
          }
          return deferred.promise;
        } else {
          return lastRequest.promise;
        }
      }
    ]);

    /**
     * Provide current task id
     */
    tasklistData.provide('taskId', {taskId: taskId});

    /**
     * Provide the current task or the value 'null' in case no task is selected
     */
    tasklistData.provide('task', [
      'taskId',
      function(task) {
        var deferred = $q.defer();

        var taskId = task.taskId;

        if (typeof taskId !== 'string') {
          deferred.resolve(null);
        } else {
          Task.get(taskId, function(err, res) {
            if (err) {
              deferred.reject(err);
            } else {
              deferred.resolve(res);
            }
          });
        }

        return deferred.promise;
      }
    ]);

    // observe //////////////////////////////////////////////////////////////////////////////

    tasklistData.observe('currentFilter', function(_currentFilter) {
      currentFilter = _currentFilter;
    });

    /*
     * automatically refresh the taskList every 10 seconds so that changes
     * (such as claims) are represented in realtime
     */
    $scope.$on('refresh', function() {
      if (!currentFilter || !currentFilter.properties.refresh) return;

      tasklistData.changed('taskList');
    });

    // routeChanged listener ////////////////////////////////////////////////////////////////

    /**
     * Update task if location changes
     */
    $scope.$on('$routeChanged', function() {
      var oldTaskId = taskId;
      var oldDetailsTab = detailsTab;

      taskId = getPropertyFromLocation('task');
      detailsTab = getPropertyFromLocation('detailsTab');

      if (oldTaskId !== taskId || oldDetailsTab === detailsTab) {
        tasklistData.set('taskId', {taskId: taskId});
      }

      currentFilter = null;
      tasklistData.changed('currentFilter');
    });
  }
];
