'use strict';

var fs = require('fs');

var template = fs.readFileSync(__dirname + '/input-variable-table.html', 'utf8');

module.exports = [ 'ViewsProvider', function(ViewsProvider) {

  ViewsProvider.registerDefaultView('cockpit.decisionInstance.tab', {
    id: 'decision-input-table',
    label: 'PLUGIN_INPUT_TABLE_LABEL',
    template: template,
    controller: [
      '$scope',
      'translateFilter',
      function($scope, translateFilter) {
        $scope.loadingState = $scope.decisionInstance.inputs.length > 0 ? 'LOADED' : 'EMPTY';

        $scope.variables = $scope.decisionInstance.inputs.map(function(variable) {
          return {
            variable: {
              type: variable.type,
              value: variable.value,
              name: variable.clauseName || variable.clauseId,
              valueInfo: variable.valueInfo
            }
          };
        });

        // Variables table header
        $scope.getHeaderVariable = {
          'name' : translateFilter('PLUGIN_INPUT_TABLE_LABEL_NAME'),
          'type': translateFilter('PLUGIN_INPUT_TABLE_LABEL_TYPE'),
          'value' : translateFilter('PLUGIN_INPUT_TABLE_LABEL_VALUE')
        };
      }],
    priority: 20
  });
}];
