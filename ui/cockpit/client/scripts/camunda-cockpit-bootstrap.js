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

//  Camunda-Cockpit-Bootstrap is copied as-is, so we have to inline everything
const baseImportPath = document.querySelector("base").href + "../";

function withSuffix(string, suffix) {
  return !string.endsWith(suffix) ? string + suffix : string;
}

function addCssSource(url) {
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = url;
  document.head.appendChild(link);
}

async function loadPlugins(config) {
  const customScripts = config.customScripts || [];
  const JARScripts = window.PLUGIN_PACKAGES
    .filter(el => 
      el.name !== "cockpit-plugin-cockpitPlugins" && 
      el.name !== "cockpit-plugin-cockpitEE")
    .map(el => {
      addCssSource(`${el.location}/plugin.css`);
      return `${el.location}/${el.main}`;
    });

  const fetchers = customScripts.map(url =>
    // eslint-disable-next-line
    import(baseImportPath + withSuffix(url, ".js"))
  );

  fetchers.push(
    ...JARScripts.map(url => {try {return import(url)} catch (e) {}})
  );

  const loadedPlugins = (await Promise.all(fetchers)).reduce((acc, module) => {
    const plugins = module.default;
    if (!plugins) {
      return acc;
    }

    if (Array.isArray(plugins)) {
      acc.push(...plugins);
    } else {
      acc.push(plugins);
    }
    return acc;
  }, []);
  config.plugins = loadedPlugins;
}


const loadConfig = (async function() {
  // eslint-disable-next-line
  const config = (await import(
     baseImportPath  +
      "scripts/config.js?bust=" +
      new Date().getTime()
  )).default;
  
  await loadPlugins(config);
  window.camCockpitConf = config;
  })();

window.__define(
  'camunda-cockpit-bootstrap',
  ['./scripts/camunda-cockpit-ui'],
  function() {
    const bootstrap = function() {
      'use strict';
         
      var camundaCockpitUi = window.CamundaCockpitUi;
    
      requirejs.config({
        baseUrl: '../../../lib'
      });
    
      var requirePackages = window;
      camundaCockpitUi.exposePackages(requirePackages);
    
      window.define = window.__define;
      window.require = window.__require;
    
      requirejs(['globalize'], function(globalize) {
        globalize(
          requirejs,
          [
            'angular',
            'camunda-commons-ui',
            'camunda-bpm-sdk-js',
            'jquery',
            'angular-data-depend',
            'moment',
            'events'
          ],
          requirePackages
        );
    
        var pluginPackages = window.PLUGIN_PACKAGES || [];
        var pluginDependencies = window.PLUGIN_DEPENDENCIES || [];
    
        pluginPackages = pluginPackages.filter(el => 
          el.name === "cockpit-plugin-cockpitPlugins" || 
          el.name === "cockpit-plugin-cockpitEE"
        );
        pluginDependencies = pluginDependencies.filter(el => 
          el.requirePackageName === "cockpit-plugin-cockpitPlugins" || 
          el.requirePackageName === "cockpit-plugin-cockpitEE"
        );

        pluginPackages.forEach(function(plugin) {
          var node = document.createElement('link');
          node.setAttribute('rel', 'stylesheet');
          node.setAttribute('href', plugin.location + '/plugin.css');
          document.head.appendChild(node);
        });
    
        requirejs.config({
          packages: pluginPackages,
          baseUrl: '../',
          paths: {
            ngDefine: '../../lib/ngDefine'
          }
        });
    
        var dependencies = ['jquery', 'angular', 'ngDefine', 'moment'].concat(
          pluginDependencies.map(function(plugin) {
            return plugin.requirePackageName;
          })
        );
    
        requirejs(dependencies, function(jquery, angular) {
          // we now loaded the cockpit and the plugins, great
          // before we start initializing the cockpit though (and leave the requirejs context),
          // lets see if we should load some custom scripts first
    
          if (window.camCockpitConf && window.camCockpitConf.csrfCookieName) {
            angular.module('cam.commons').config([
              '$httpProvider',
              function($httpProvider) {
                $httpProvider.defaults.xsrfCookieName =
                  window.camCockpitConf.csrfCookieName;
              }
            ]);
          }
    
          if (
            typeof window.camCockpitConf !== 'undefined' &&
            (window.camCockpitConf.customScripts ||
              window.camCockpitConf.bpmnJs)
          ) {
            var custom = window.camCockpitConf.customScripts || {};
    
            // copy the relevant RequireJS configuration in a empty object
            // see: http://requirejs.org/docs/api.html#config
            var conf = {};
            [
              'baseUrl',
              'paths',
              'bundles',
              'shim',
              'map',
              'config',
              'packages',
              // 'nodeIdCompat',
              'waitSeconds',
              'context',
              // 'deps', // not relevant in this case
              'callback',
              'enforceDefine',
              'xhtml',
              'urlArgs',
              'scriptType'
              // 'skipDataMain' // not relevant either
            ].forEach(function(prop) {
              if (custom[prop]) {
                conf[prop] = custom[prop];
              }
            });
    
            conf['paths'] = conf['paths'] || {};
    
            custom['deps'] = custom['deps'] || [];
            custom['ngDeps'] = custom['ngDeps'] || [];
    
            var bpmnJsAdditionalModules = (window.camCockpitConf.bpmnJs || {})
              .additionalModules;
    
            if (bpmnJsAdditionalModules) {
              angular.forEach(bpmnJsAdditionalModules, function(module, name) {
                conf['paths'][name] = bpmnJsAdditionalModules[name];
                custom['deps'].push(name);
              });
            }
    
            var bpmnJsModdleExtensions = (window.camCockpitConf.bpmnJs || {})
              .moddleExtensions;
    
            if (bpmnJsModdleExtensions) {
              var moddleExtensions = {};
    
              angular.forEach(bpmnJsModdleExtensions, function(
                path,
                extensionName
              ) {
                moddleExtensions[extensionName] = jquery.getJSON(
                  '../' + path + '.json',
                  function(moddleExtension) {
                    return moddleExtension;
                  }
                );
              });
    
              window.bpmnJsModdleExtensions = {};
    
              var promises = Object.keys(moddleExtensions).map(function(
                extensionName
              ) {
                return moddleExtensions[extensionName];
              });
    
              jquery.when(promises).then(function() {
                // wait until promises are resolved: fail || success
                angular.forEach(moddleExtensions, function(
                  promise,
                  extensionName
                ) {
                  promise
                    .done(function(moddleExtension) {
                      window.bpmnJsModdleExtensions[
                        extensionName
                      ] = moddleExtension;
                    })
                    .fail(function(response) {
                      if (response.status === 404) {
                        // tslint:disable-next-line:no-console
                        console.error(
                          'bpmn-js moddle extension "' +
                            extensionName +
                            '" could not be loaded.'
                        );
                      } else {
                        // tslint:disable-next-line:no-console
                        console.error(
                          'unhandled error with bpmn-js moddle extension "' +
                            extensionName +
                            '"'
                        );
                      }
                    });
                });
    
                loadRequireJsDeps();
              });
            } else {
              loadRequireJsDeps();
            }
          } else {
            // for consistency, also create a empty module
            angular.module('cam.cockpit.custom', []);
    
            // make sure that we are at the end of the require-js callback queue.
            // Why? => the plugins will also execute require(..) which will place new
            // entries into the queue.  if we bootstrap the angular app
            // synchronously, the plugins' require callbacks will not have been
            // executed yet and the angular modules provided by those plugins will
            // not have been defined yet. Placing a new require call here will put
            // the bootstrapping of the angular app at the end of the queue
            require([], function() {
              initCockpitUi(pluginDependencies);
            });
          }
    
          function loadRequireJsDeps() {
            // configure RequireJS
            requirejs.config(conf);
    
            // load the dependencies and bootstrap the AngularJS application
            requirejs(custom.deps || [], function() {
              // create a AngularJS module (with possible AngularJS module dependencies)
              // on which the custom scripts can register their
              // directives, controllers, services and all when loaded
              angular.module('cam.cockpit.custom', custom.ngDeps);
    
              initCockpitUi(pluginDependencies);
            });
          }
    
          function initCockpitUi(pluginDependencies) {
            window.define = undefined;
            window.require = undefined;
    
            // now that we loaded the plugins and the additional modules, we can finally
            // initialize Cockpit
            camundaCockpitUi(pluginDependencies);
          }
        });
      });
    }
    loadConfig.then(() => {
      bootstrap();
    });
  }
);

requirejs(['camunda-cockpit-bootstrap'], function() {});
