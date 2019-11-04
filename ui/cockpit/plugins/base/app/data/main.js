'use strict';

var angular = require('angular'),
  processDefinition = require('./dashboard/processDefinitionStatisticsData');

var ngModule = angular.module('cockpit.plugin.base.data', []);

ngModule.config(processDefinition);

module.exports = ngModule;
