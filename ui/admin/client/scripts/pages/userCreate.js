'use strict';

var fs = require('fs');

var template = fs.readFileSync(__dirname + '/userCreate.html', 'utf8');

var Controller = ['$scope', 'page', 'UserResource', 'Notifications', '$location', 'translateFilter', function($scope, page, UserResource, Notifications, $location, translateFilter) {

  $scope.$root.showBreadcrumbs = true;

  page.titleSet(translateFilter('USERS_CREATE_USER'));

  page.breadcrumbsClear();

  page.breadcrumbsAdd([
    {
      label: translateFilter('USERS_USERS'),
      href: '#/users/'
    },
    {
      label: translateFilter('USERS_CREATE'),
      href: '#/users-create'
    }
  ]);

    // data model for user profile
  $scope.profile = {
    id : '',
    firstName : '',
    lastName : '',
    email : ''
  };

    // data model for credentials
  $scope.credentials = {
    password : '',
    password2 : ''
  };

  $scope.createUser = function() {
    var user = {
      profile : $scope.profile,
      credentials : { password : $scope.credentials.password }
    };

    UserResource.createUser(user).$promise.then(function() {
      Notifications.addMessage({ type: 'success', status: translateFilter('NOTIFICATIONS_STATUS_SUCCESS'), message: translateFilter('USERS_CREATE_SUCCESS') + ' ' + user.profile.id});
      $location.path('/users');
    },
      function() {
        Notifications.addError({ status: translateFilter('NOTIFICATIONS_STATUS_FAILED'), message: translateFilter('USERS_CREATE_FAILED') });
      });
  };

}];

module.exports = [ '$routeProvider', function($routeProvider) {
  $routeProvider.when('/user-create', {
    template: template,
    controller: Controller,
    authentication: 'required'
  });
}];
