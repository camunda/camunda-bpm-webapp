'use strict';

var fs = require('fs');

var template = fs.readFileSync(__dirname + '/groupCreate.html', 'utf8');

var Controller = ['$scope', 'page', 'GroupResource', 'Notifications', '$location', 'translateFilter', function($scope, pageService, GroupResource, Notifications, $location, translateFilter) {

  $scope.$root.showBreadcrumbs = true;

  pageService.titleSet(translateFilter('GROUP_CREATE_NEW_GROUP'));

  pageService.breadcrumbsClear();

  pageService.breadcrumbsAdd([
    {
      label: translateFilter('GROUP_CREATE_LABEL_GROUP'),
      href: '#/groups'
    },
    {
      label: translateFilter('GROUP_CREATE_LABEL_NEW_GROUP'),
      href: '#/group-create'
    }
  ]);

    // data model for new group
  $scope.group = {
    id : '',
    name : '',
    type : ''
  };

  $scope.createGroup = function() {
    var group = $scope.group;
    GroupResource.createGroup(group).$promise.then(
        function() {
          Notifications.addMessage({type:'success', status:translateFilter('NOTIFICATIONS_STATUS_SUCCESS'), message: translateFilter('GROUP_CREATE_MESSAGE_SUCCESS') + ' ' + group.id});
          $location.path('/groups');
        },
        function() {
          Notifications.addError({ status: translateFilter('NOTIFICATIONS_STATUS_FAILED'), message: translateFilter('GROUP_CREATE_MESSAGE_ERROR_1') + ' ' + group.id + '.' + translateFilter('GROUP_CREATE_MESSAGE_ERROR_2') + '.' });
        }
      );
  };

}];

module.exports = [ '$routeProvider', function($routeProvider) {
  $routeProvider.when('/group-create', {
    template: template,
    controller: Controller,
    authentication: 'required'
  });
}];
