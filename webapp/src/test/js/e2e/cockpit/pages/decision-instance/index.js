'use strict';

var DecisionDefinitionPage = require('./instance-view');
var TablePage = require('./../dmn-table');
var InputsTab = require('./tabs/inputs-tab');
var OutputsTab = require('./tabs/outputs-tab');
var gotoProcessInstanceAction = require('./action-bar/gotoProcessInstance');


module.exports = new DecisionDefinitionPage();
module.exports.table = new TablePage();
module.exports.inputsTab = new InputsTab();
module.exports.outputsTab = new OutputsTab();
module.exports.gotoProcessInstanceAction = new gotoProcessInstanceAction();
