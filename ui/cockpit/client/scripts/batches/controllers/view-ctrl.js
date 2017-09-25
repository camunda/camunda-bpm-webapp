'use strict';

var Ctrl = require('../components/batch');
var events = require('../components/events');

var fs = require('fs');

var deleteModalTemplate = fs.readFileSync(__dirname + '/../templates/delete-modal.html', 'utf8');
var deleteModalCtrl = require('./modal-ctrl');

module.exports = [
  '$scope',
  'page',
  'camAPI',
  '$location',
  '$modal',
  'translateFilter',
  function(
  $scope,
  page,
  camAPI,
  $location,
  $modal,
  translateFilter
) {

    $scope.$on('$destroy', function() {
      events.removeAllListeners();
      $scope.ctrl.stopLoadingPeriodically();
    });

    $scope.$watch(function() {
      return ($location.search() || {});
    }, function(newValue) {
      if(newValue.details && newValue.type) {
        $scope.ctrl.loadDetails(newValue.details, newValue.type);
      }
    });

    events.on('details:switchToHistory', function() {
      $location.search('type', 'history');
    });

    events.on('deleteModal:open', function(deleteModal) {
      deleteModal.instance = $modal.open({
        template: deleteModalTemplate,
        controller: deleteModalCtrl
      });
    });

    require('../components/breadcrumbs')(page, $scope.$root, translateFilter);

    $scope.ctrl = new Ctrl(camAPI);
    $scope.ctrl.loadPeriodically(5000);
  }];
