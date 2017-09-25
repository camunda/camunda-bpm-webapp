'use strict';

var fs = require('fs');

var template = fs.readFileSync(__dirname + '/users.html', 'utf8');

var angular = require('camunda-commons-ui/vendor/angular');

var Controller = ['$scope', '$location', 'search', 'UserResource', 'page', 'translateFilter', function($scope, $location, search, UserResource, pageService, translateFilter) {

  $scope.availableOperations={};
  $scope.loadingState = 'LOADING';

  var pages = $scope.pages = { size: 25, total: 0 };

  $scope.$watch(function() {
    return parseInt(($location.search() || {}).page || '1');
  }, function(newValue) {
    pages.current = newValue;
    updateView();
  });

  $scope.pageChange = function(page) {
    search.updateSilently({ page: !page || page == 1 ? null : page });
  };

  function updateView() {
    var page = pages.current,
        count = pages.size,
        firstResult = (page - 1) * count;

    var pagingParams = {
      firstResult: firstResult,
      maxResults: count
    };

    $scope.loadingState = 'LOADING';
    UserResource.query(pagingParams).$promise.then(function(response) {
      $scope.userList = response;
      $scope.loadingState = response.length ? 'LOADED' : 'EMPTY';
    });

    UserResource.count().$promise.then(function(response) {
      pages.total = response.count;
    });

  }

  UserResource.OPTIONS().$promise.then(function(response) {
    angular.forEach(response.links, function(link) {
      $scope.availableOperations[link.rel] = true;
    });
  });

  $scope.$root.showBreadcrumbs = true;

  pageService.titleSet(translateFilter('USERS_USERS'));

  pageService.breadcrumbsClear();

  pageService.breadcrumbsAdd({
    label: translateFilter('USERS_USERS'),
    href: '#/users/'
  });
}];

module.exports = [ '$routeProvider', function($routeProvider) {
  $routeProvider.when('/users', {
    template: template,
    controller: Controller,
    authentication: 'required',
    reloadOnSearch: false
  });
}];
