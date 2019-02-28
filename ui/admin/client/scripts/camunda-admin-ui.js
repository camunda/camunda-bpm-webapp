/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership. Camunda licenses this file to you under the Apache License,
 * Version 2.0; you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var $ = window.jQuery = window.$ = require('jquery'),
    pagesModule = require('./pages/main'),
    directivesModule = require('./directives/main'),
    filtersModule = require('./filters/main'),
    servicesModule = require('./services/main'),
    resourcesModule = require('./resources/main'),
    camCommonsUi = require('camunda-commons-ui/lib'),
    sdk = require('camunda-commons-ui/vendor/camunda-bpm-sdk-angular'),
    angular = require('camunda-commons-ui/vendor/angular'),
    camCommon = require('../../../common/scripts/module'),
    lodash = require('camunda-commons-ui/vendor/lodash');


var APP_NAME = 'cam.admin';

module.exports = function(pluginDependencies) {

  var ngDependencies = [
    'ng',
    'ngResource',
    'pascalprecht.translate',
    camCommonsUi.name,
    directivesModule.name,
    filtersModule.name,
    pagesModule.name,
    resourcesModule.name,
    servicesModule.name
  ].concat(pluginDependencies.map(function(el) {
    return el.ngModuleName;
  }));

  var appNgModule = angular.module(APP_NAME, ngDependencies);

  function getUri(id) {
    var uri = $('base').attr(id);
    if (!id) {
      throw new Error('Uri base for ' + id + ' could not be resolved');
    }

    return uri;
  }

  var ModuleConfig = [
    '$routeProvider',
    'UriProvider',
    '$uibModalProvider',
    '$uibTooltipProvider',
    '$locationProvider',
    '$animateProvider',
    function(
      $routeProvider,
      UriProvider,
      $modalProvider,
      $tooltipProvider,
      $locationProvider,
      $animateProvider
    ) {
      $routeProvider.otherwise({ redirectTo: '/' });

      UriProvider.replace(':appName', 'admin');
      UriProvider.replace('app://', getUri('href'));
      UriProvider.replace('cockpitbase://', getUri('app-root') + '/app/cockpit/');
      UriProvider.replace('admin://', getUri('admin-api'));
      UriProvider.replace('plugin://', getUri('admin-api') + 'plugin/');
      UriProvider.replace('engine://', getUri('engine-api'));

      UriProvider.replace(':engine', [ '$window', function($window) {
        var uri = $window.location.href;

        var match = uri.match(/\/app\/admin\/([\w-]+)(|\/)/);
        if (match) {
          return match[1];
        } else {
          throw new Error('no process engine selected');
        }
      }]);

      $modalProvider.options = {
        animation:    true,
        backdrop:     true,
        keyboard:     true
      };

      $tooltipProvider.options({
        animation:    true,
        popupDelay:   100,
        appendToBody: true
      });

      $locationProvider.hashPrefix('');

      $animateProvider.classNameFilter(/angular-animate/);
    }];

  appNgModule.provider('configuration', require('./../../../common/scripts/services/cam-configuration')(window.camAdminConf, 'Admin'));

  appNgModule.config(ModuleConfig);

  require('./../../../common/scripts/services/locales')(appNgModule, getUri('app-root'), 'admin');

  appNgModule.controller('camAdminAppCtrl', [
    '$scope',
    '$route',
    'camAPI',
    function(
      $scope,
      $route,
      camAPI
    ) {
      var userService = camAPI.resource('user');
      function getUserProfile(auth) {
        if (!auth || !auth.name) {
          $scope.userFullName = null;
          return;
        }

        userService.profile(auth.name, function(err, info) {
          if (!err) {
            $scope.userFullName = info.firstName + ' ' + info.lastName;
          }
        });
      }

      $scope.$on('authentication.changed', function(ev, auth) {
        if (auth) {
          getUserProfile(auth);
        }
        else {
          $route.reload();
        }
      });

      getUserProfile($scope.authentication);
    }]);

  if (typeof window.camAdminConf !== 'undefined' && window.camAdminConf.polyfills) {
    var polyfills = window.camAdminConf.polyfills;

    if (polyfills.indexOf('placeholder') > -1) {
      var load = window.requirejs;
      var appRoot = $('head base').attr('app-root');

      load([
        appRoot + '/app/admin/scripts/placeholders.utils.js',
        appRoot + '/app/admin/scripts/placeholders.main.js'
      ], function() {
        load([
          appRoot + '/app/admin/scripts/placeholders.jquery.js'
        ], function() {});
      });
    }
  }

  $(document).ready(function() {
    angular.bootstrap(document.documentElement, [ appNgModule.name, 'cam.admin.custom' ]);

    if (top !== window) {
      window.parent.postMessage({ type: 'loadamd' }, '*');
    }
  });

  /* live-reload
      // loads livereload client library (without breaking other scripts execution)
      $('body').append('<script src="//' + location.hostname + ':LIVERELOAD_PORT/livereload.js?snipver=1"></script>');
      /* */
};

module.exports.exposePackages = function(requirePackages) {
  requirePackages.angular = angular;
  requirePackages.jquery = $;
  requirePackages['camunda-commons-ui'] = camCommonsUi;
  requirePackages['camunda-bpm-sdk-js'] = sdk;
  requirePackages['cam-common'] = camCommon;
  requirePackages['lodash'] = lodash;
};
