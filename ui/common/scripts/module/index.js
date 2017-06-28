'use strict';

var angular = require('camunda-commons-ui/vendor/angular');

var isModuleAvailable = require('./services/is-module-available');
var exposeScopeProperties = require('./services/expose-scope-properties');
var loaders = require('./services/loaders');

var camToolbar = require('./components/cam-toolbar');
var camPagination = require('./components/cam-pagination');
var camSearchableArea = require('./components/cam-searchable-area');
var camTabs = require('./components/cam-tabs');

var camHoverArea = require('./directives/cam-hover-area');
var camHoverTrigger = require('./directives/cam-hover-trigger');
var camHoverableTitle = require('./directives/cam-hoverable-title');

var HoverAreaController = require('./controllers/hover-area');
var CamPaginationController = require('./controllers/cam-pagination');
var CamTabsController = require('./controllers/cam-tabs');
var CamPaginationSearchIntegrationController = require('./controllers/cam-pagination-search-integration');

var routeUtil = require('../util/routeUtil');
var paginationUtils = require('../util/pagination-utils');
var searchWidgetUtils = require('../util/search-widget-utils');

var ngModule = angular.module('cam-common', []);

// Services
ngModule.factory('isModuleAvailable', isModuleAvailable);
ngModule.factory('exposeScopeProperties', exposeScopeProperties);
ngModule.factory('Loaders', loaders);

// Components
ngModule.directive('camToolbar', camToolbar);
ngModule.directive('camPagination', camPagination);
ngModule.directive('camSearchableArea', camSearchableArea);
ngModule.directive('camTabs', camTabs);

// Directives
ngModule.directive('camHoverArea', camHoverArea);
ngModule.directive('camHoverTrigger', camHoverTrigger);
ngModule.directive('camHoverableTitle', camHoverableTitle);

// Controllers
ngModule.controller('HoverAreaController', HoverAreaController);
ngModule.controller('CamPaginationController', CamPaginationController);
ngModule.controller('CamTabsController', CamTabsController);
ngModule.controller('CamPaginationSearchIntegrationController', CamPaginationSearchIntegrationController);

// Values
ngModule.value('routeUtil', routeUtil);
ngModule.value('paginationUtils', paginationUtils);
ngModule.value('searchWidgetUtils', searchWidgetUtils);

module.exports = ngModule;




