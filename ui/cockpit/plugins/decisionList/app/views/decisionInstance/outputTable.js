'use strict';

var fs = require('fs');

var template = fs.readFileSync(__dirname + '/output-variable-table.html', 'utf8');

module.exports = [ 'ViewsProvider', function(ViewsProvider) {

  ViewsProvider.registerDefaultView('cockpit.decisionInstance.tab', {
    id: 'decision-input-table',
    label: 'PLUGIN_OUTPUT_TABLE_LABEL',
    template: template,
    controller: [
      '$scope',
      'translateFilter',
      function($scope, translateFilter) {

        $scope.variables = $scope.decisionInstance.outputs.map(function(variable) {
          return {
            variable: {
              type: variable.type,
              value: variable.value,
              name: variable.clauseName || variable.clauseId || variable.variableName,
              valueInfo: variable.valueInfo
            }
          };
        });

        // Variables table header
        $scope.getHeaderVariable = {
          'name' : translateFilter('PLUGIN_OUTPUT_TABLE_LABEL_NAME'),
          'type': translateFilter('PLUGIN_OUTPUT_TABLE_LABEL_TYPE'),
          'value' : translateFilter('PLUGIN_OUTPUT_TABLE_LABEL_VALUE')
        };
      }],
    priority: 10
  });
}];
