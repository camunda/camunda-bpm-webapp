'use strict';

var fs = require('fs');

var template = fs.readFileSync(__dirname + '/system.html', 'utf8');

var Controller = [
  '$scope',
  'page',
  '$location',
  '$routeParams',
  'Views',
  'translateFilter',
  function(
    $scope,
    page,
    $location,
    $routeParams,
    Views,
    translateFilter
  ) {

    $scope.$root.showBreadcrumbs = true;

    page.titleSet(translateFilter('SYSTEM_SYSTEM_SETTINGS'));

    page.breadcrumbsClear();

    page.breadcrumbsAdd([
      {
        label: translateFilter('SYSTEM_SYSTEM_SETTINGS'),
        href: '#/system'
      }
    ]);

    $scope.systemSettingsProviders = Views.getProviders({ component: 'admin.system'});

    var selectedProviderId = $routeParams.section;
    if(selectedProviderId) {
      $scope.activeSettingsProvier = Views.getProviders({
        component: 'admin.system',
        id: $routeParams.section
      })[0];
    }


    $scope.activeClass = function(link) {
      var path = $location.absUrl();
      return path.indexOf(link) != -1 ? 'active' : '';
    };

  }];

module.exports = [ '$routeProvider', function($routeProvider) {
  $routeProvider.when('/system', {
    template: template,
    controller: Controller,
    authentication: 'required'
  });
}];
