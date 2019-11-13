'use strict';

var fs = require('fs');

var template = fs.readFileSync(__dirname + '/decisions-table.html', 'utf8');

module.exports = function() {
  return {
    restrict: 'A',
    template: template,
    scope: {
      decisionCount: '=',
      decisions: '=',
      isDrdAvailable: '=',
      paginationController: '='
    },
    controller: [
      '$scope',
      'localConf',
      '$translate',
      function($scope, localConf, $translate) {
        // prettier-ignore
        $scope.headColumns = [
          {class: 'name', request: 'name', sortable: true, content: $translate.instant('PLUGIN_DECISION_TABLE_NAME')},
          {class: 'tenant-id', request: 'tenantId', sortable: true, content: $translate.instant('PLUGIN_DECISION_TABLE_TENANT_ID')},
          {class: 'drd', request: 'decisionRequirementsDefinitionKey', sortable: true, content: $translate.instant('PLUGIN_DECISION_TABLE_DECISION_REQUIREMENTS'), condition: $scope.isDrdAvailable}
        ];

        // Default sorting
        var defaultValue = {
          sortBy: 'name',
          sortOrder: 'asc'
        };
        $scope.sortObj = loadLocal(defaultValue);

        // Update Table
        $scope.onSortChange = function(sortObj) {
          sortObj = sortObj || $scope.sortObj;
          $scope.sortObj = sortObj;

          $scope.paginationController.changeDecisionSorting(sortObj);
        };

        function loadLocal(defaultValue) {
          return localConf.get('sortDecDefTable', defaultValue);
        }
      }
    ]
  };
};
