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

var AbstractClientResource = require("./../abstract-client-resource");

/**
 * Authorization Resource
 * @class
 * @memberof CamSDK.client.resource
 * @augments CamSDK.client.AbstractClientResource
 */
var Telemetry = AbstractClientResource.extend();

/**
 * API path for the process definition resource
 * @type {String}
 */
Telemetry.path = "telemetry";

Telemetry.get = function(done) {
  return this.http.get(this.path + "/configuration", {
    done: done
  });
};

/**
 * Configures whether Camunda receives data collection of the process engine setup and usage.
 *
 * @param  {Object}   authorization       is an object representation of an authorization
 * @param  {Function} done
 */
Telemetry.configure = function(payload, done) {
  if (typeof payload === "boolean") {
    payload = { enableTelemetry: payload };
  }

  return this.http.post(this.path + "/configuration", {
    data: payload,
    done: done
  });
};

module.exports = Telemetry;
