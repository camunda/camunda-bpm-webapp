'use strict';

var angular = require('camunda-commons-ui/vendor/angular'),

    breadcrumbs = require('./../../../../common/scripts/directives/breadcrumbs'),
    numeric = require('./numeric'),
    date = require('./../../../../common/scripts/directives/date'),
    processDiagram = require('./processDiagram'),
    decisionTable = require('./decisionTable'),
    processDiagramPreview = require('./processDiagramPreview'),
    activityInstanceTree = require('./activityInstanceTree'),
    sidebarContainer = require('./sidebarContainer'),
    stateCircle = require('./stateCircle'),
    variable = require('./variable'),
    focus = require('./focus'),
    viewPills = require('./viewPills'),
    pieChart = require('./pie-chart'),
    selectActivity = require('./selectActivity'),
    selectActivityInstance = require('./selectActivityInstance'),
    processVariable = require('./processVariable'),
    dynamicName = require('./dynamicName'),
    quickFilter = require('./quickFilter'),
    diagramStatisticsLoader = require('./diagramStatisticsLoader'),
    timeToLive = require('./time-to-live.js'),
    changeVersion = require('./change-version.js'),
    camCommon = require('../../../../common/scripts/module'),
    isSidebarCollapsed = require('./isSidebarCollapsed'),
    incidentsTab = require('./incidentsTab'),
    sortableTableHead = require('./sortableTableHead');

var directivesModule = angular.module('cam.cockpit.directives', [
  camCommon.name
]);

directivesModule.directive('camBreadcrumbsPanel', breadcrumbs);
directivesModule.directive('numeric', numeric);
directivesModule.directive('date', date);
directivesModule.directive('processDiagram', processDiagram);
directivesModule.directive('decisionTable', decisionTable);
directivesModule.directive('processDiagramPreview', processDiagramPreview);
directivesModule.directive('activityInstanceTree', activityInstanceTree);
directivesModule.directive('ctnCollapsableParent', sidebarContainer);
directivesModule.directive('stateCircle', stateCircle);
directivesModule.directive('variable', variable);
directivesModule.directive('focus', focus);
directivesModule.directive('viewPills', viewPills);
directivesModule.directive('camSelectActivity', selectActivity);
directivesModule.directive('camPieChart', pieChart);
directivesModule.directive('camSelectActivityInstance', selectActivityInstance);
directivesModule.directive('processVariable', processVariable);
directivesModule.directive('camDynamicName', dynamicName);
directivesModule.directive('camQuickFilter', quickFilter);
directivesModule.directive('diagramStatisticsLoader', diagramStatisticsLoader);
directivesModule.directive('timeToLive', timeToLive);
directivesModule.directive('changeVersion', changeVersion);
directivesModule.directive('isSidebarCollapsed', isSidebarCollapsed);
directivesModule.directive('sortableTableHead', sortableTableHead);
directivesModule.directive('incidentsTab', incidentsTab);

module.exports = directivesModule;
