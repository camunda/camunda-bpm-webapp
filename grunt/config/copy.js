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

module.exports = {
  webapp_libs : {
    files: [
      { expand: true, cwd: 'node_modules/requirejs/', src: ['require.js'], dest: '<%= pkg.gruntConfig.libTargetDir %>/' },
      { expand: true, cwd: 'node_modules/requirejs-angular-define/dist/', src: ['ngDefine.js'], dest: '<%= pkg.gruntConfig.libTargetDir %>/' },
      { expand: true, cwd: 'node_modules/camunda-commons-ui/cache/', src: ['deps.js'], dest: '<%= pkg.gruntConfig.libTargetDir %>/' },
      // { expand: true, cwd: 'node_modules/angular/', src: ['angular.js'], dest: '<%= pkg.gruntConfig.libTargetDir %>/' },
      { expand: true, cwd: 'src/libs', src: ['globalize.js'], dest: '<%= pkg.gruntConfig.libTargetDir %>/' }
    ]
  }
};
