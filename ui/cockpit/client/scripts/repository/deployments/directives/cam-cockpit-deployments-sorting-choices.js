'use strict';

var fs = require('fs');

var template = fs.readFileSync(__dirname + '/cam-cockpit-deployments-sorting-choices.html', 'utf8');

var angular = require('camunda-commons-ui/vendor/angular');

module.exports = ['translateFilter', function(translateFilter) {

  return {

    restrict: 'A',
    scope: {
      deploymentsData: '='
    },

    template: template,

    controller: [
      '$scope',
      'search',
      function(
        $scope,
        search
      ) {

        var deploymentsSortingData = $scope.deploymentsSortingData = $scope.deploymentsData.newChild($scope);

        var uniqueProps = $scope.uniqueProps = {
          id:               translateFilter('REPOSITORY_DEPLOYMENTS_ID'),
          name:             translateFilter('REPOSITORY_DEPLOYMENTS_NAME'),
          deploymentTime:   translateFilter('REPOSITORY_DEPLOYMENTS_DEPLOYMENT_TIME')
        };


        // utilities /////////////////////////////////////////////////////////////////

        var updateSilently = function(params) {
          search.updateSilently(params);
        };

        var updateSorting = function(searchParam, value) {
          var search = {};
          search[searchParam] = value;
          updateSilently(search);
          deploymentsSortingData.changed('deploymentsSorting');
        };

        // observe data /////////////////////////////////////////////////////////////

        deploymentsSortingData.observe('deploymentsSorting', function(pagination) {
          $scope.sorting = angular.copy(pagination);
        });


        // label ///////////////////////////////////////////////////////////////////

        $scope.byLabel = function(sortBy) {
          return uniqueProps[sortBy];
        };


        // sort order //////////////////////////////////////////////////////////////

        $scope.changeOrder = function() {
          var value = $scope.sorting.sortOrder === 'asc' ? 'desc' : 'asc';
          updateSorting('deploymentsSortOrder', value);
        };


        // sort by /////////////////////////////////////////////////////////////////

        $scope.changeBy = function(by) {
          updateSorting('deploymentsSortBy', by);
        };

      }]
  };
}];
