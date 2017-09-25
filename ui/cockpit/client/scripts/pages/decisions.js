'use strict';

var fs = require('fs');

var template = fs.readFileSync(__dirname + '/decisions.html', 'utf8');

var Controller = [
  '$scope',
  'Views',
  'page',
  'translateFilter',
  function(
  $scope,
  Views,
  page,
  translateFilter
) {
    var $rootScope = $scope.$root;

    $rootScope.showBreadcrumbs = true;

    page.breadcrumbsClear();

    page.breadcrumbsAdd({
      label: translateFilter('DECISION_INSTANCE_DECISIONS')
    });

    page.titleSet(translateFilter('DECISION_INSTANCE_DECISIONS'));

  // INITIALIZE PLUGINS
    $scope.plugins = Views.getProviders({ component: 'cockpit.decisions.dashboard' });
  }];

var RouteConfig = [ '$routeProvider', function($routeProvider) {
  $routeProvider.when('/decisions', {
    template: template,
    controller: Controller,
    authentication: 'required',
    reloadOnSearch: false
  });
}];

module.exports = RouteConfig;
