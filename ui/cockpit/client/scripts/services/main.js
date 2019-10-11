'use strict';

var angular = require('camunda-commons-ui/vendor/angular'),

    transform = require('./transform'),
    variables = require('./variables'),
    breadcrumbTrails = require('./breadcrumbTrails'),
    queryMaxResults = require('./query-max-results'),
    routeUtil = require('./../../../../common/scripts/services/routeUtil'),
    page = require('./../../../../common/scripts/services/page'),
    camAPI = require('./../../../../common/scripts/services/cam-api'),
    hasPlugin = require('./../../../../common/scripts/services/has-plugin'),
    localConf = require('camunda-commons-ui/lib/services/cam-local-configuration'),
    typeUtils = require('./../../../../common/scripts/services/typeUtils'),
    escapeHtml = require('./escapeHtml');

var servicesModule = angular.module('cam.cockpit.services', []);

servicesModule.factory('Transform', transform);
servicesModule.factory('Variables', variables);
servicesModule.service('page', page);
servicesModule.factory('breadcrumbTrails', breadcrumbTrails);
servicesModule.factory('queryMaxResults', queryMaxResults);
servicesModule.factory('routeUtil', routeUtil);
servicesModule.factory('camAPI', camAPI);
servicesModule.factory('hasPlugin', hasPlugin);
servicesModule.factory('localConf', localConf);
servicesModule.factory('typeUtils', typeUtils);
servicesModule.factory('escapeHtml', escapeHtml);

module.exports = servicesModule;
