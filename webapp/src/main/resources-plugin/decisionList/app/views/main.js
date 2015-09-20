/* global define: false */

/**
 * @namespace cam.cockpit.plugin.base.views
 */
define([
  'angular',

  // dashboard
  './dashboard/decision-list',

  // decision definition
  './decisionDefinition/decisionInstanceTable',

  // decision instance
  './decisionInstance/inputTable',
  './decisionInstance/outputTable',
  './decisionInstance/gotoProcessInstanceAction'

], function(angular, decisionList, decisionInstanceTable, inputTable, outputTable, gotoProcessInstanceAction) {

  'use strict';
  var ngModule = angular.module('cockpit.plugin.decisionList.views', []);

  ngModule.config(decisionList);
  ngModule.config(decisionInstanceTable);
  ngModule.config(inputTable);
  ngModule.config(outputTable);

  gotoProcessInstanceAction(ngModule);

  return ngModule;
});
