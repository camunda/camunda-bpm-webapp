'use strict';

var angular = require('angular'),
  viewsModule = require('./views/main'),
  actionsModule = require('./actions/main');

module.exports = angular.module('cockpit.plugin.jobDefinition', [
  viewsModule.name,
  actionsModule.name
]);
