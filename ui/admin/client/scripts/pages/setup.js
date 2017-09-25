'use strict';

var fs = require('fs');

var template = fs.readFileSync(__dirname + '/setup.html', 'utf8');

var Controller = ['$scope', 'InitialUserResource', 'Notifications', '$location', 'Uri', 'translateFilter', function($scope, InitialUserResource, Notifications, $location, Uri, translateFilter) {

  if (!/.*\/app\/admin\/([\w-]+)\/setup\/.*/.test($location.absUrl())) {
    $location.path('/');
    return;
  }

  $scope.engineName = Uri.appUri(':engine');

    // data model for user profile
  $scope.profile = {
    id : '',
    firstName : '',
    lastName : '',
    email : ''
  };

  $scope.created = false;

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

    InitialUserResource.create(user).$promise.then(
        function() {
          $scope.created = true;
        },
        function() {
          Notifications.addError({ status: 'Error', message: translateFilter('SETUP_COULD_NOT_CREATE_USER') + '.' });
        }
      );
  };

}];

module.exports = [ '$routeProvider', function($routeProvider) {
  $routeProvider.when('/setup', {
    template: template,
    controller: Controller
  });
}];
