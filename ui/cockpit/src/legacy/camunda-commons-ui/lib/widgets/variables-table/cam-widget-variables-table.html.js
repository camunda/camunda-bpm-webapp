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

module.exports = `<table class="cam-table">
  <thead>
  <tr>
    <td ng-repeat="column in headers" ng-class="col-{{column.class}}">
      <span class="{{column.class}}">{{column.content}}</span>
      <a ng-if="column.sortable === true"
         ng-click="changeOrder(column.request)">
        <span class="glyphicon" ng-class="orderClass(column.request)"></span>
      </a>
    </td>
    <td class="actions"
        ng-if="editable.length">
      Actions
    </td>
  </tr>
  </thead>

  <tbody>
    <tr ng-repeat="(v, info) in variables"
        ng-class="rowClasses(info, v)">
      <td ng-repeat="headerClass in headerClasses track by $index"
          ng-init="variable=info.variable"
          ng-class="colClasses(info, headerClass, v)"
          ng-switch on="headerClass">
        <!-- ................................................................................... -->
        <div ng-switch-when="type"
             ng-if="!isEditable('type', info)">
          {{ variable.type }}
        </div>
        <select class="form-control"
                ng-switch-when="type"
                ng-if="isEditable('type', info)"
                ng-model="variable.type"
                ng-options="variableType for variableType in variableTypes track by variableType"
                required>
        </select>
        <!-- ................................................................................... -->


        <!-- ................................................................................... -->
        <div ng-switch-when="name"
             ng-if="!isEditable('name', info)">
          <span cam-widget-clipboard="variable.name">{{ variable.name }}</span>
        </div>

        <input class="form-control"
               ng-switch-when="name"
               ng-model="variable.name"
               ng-if="isEditable('name', info)" />
        <!-- ................................................................................... -->


        <!-- ................................................................................... -->
        <a ng-switch-when="value"
           ng-if="!isEditable('value', info) && isBinary(variable.type)"
           ng-href="{{ downloadLink(info) }}"
           download="{{ variable.name }}-data">
          Download
        </a>

        <div ng-switch-when="value"
             ng-if="!isEditable('value', info) && variable.type === 'Object'"
             class="read-only value-wrapper">
          <span ng-if="variable.valueInfo.objectTypeName"
                cam-widget-clipboard="variable.valueInfo.objectTypeName">
            <a ng-click="editVariableValue(v)"
               href>{{ variable.valueInfo.objectTypeName }}</a>
          </span>
          <a ng-if="!variable.valueInfo.objectTypeName"
             ng-click="editVariableValue(v)"
             href>&lt;undefined&gt;</a>
        </div>
        <div ng-switch-when="value"
             ng-if="!isEditable('value', info) && (variable.type === 'Json' || variable.type === 'Xml')"
             class="read-only value-wrapper">
          <span cam-widget-clipboard="variable.value">
            <a ng-click="editVariableValue(v)"
               href>{{ variable.value }}</a>
          </span>
        </div>

        <div ng-switch-when="value"
             ng-if="!isEditable('value', info) && variable.type === 'String'"
             class="read-only value-wrapper">
          <span cam-widget-clipboard="variable.value">
            <span ng-click="readStringVar(v)">{{ variable.value }}</span>
          </span>
        </div>

        <div ng-switch-when="value"
             ng-if="!isEditable('value', info) && !hasEditDialog(variable.type)"
             class="read-only value-wrapper">
          <span ng-if="variable.type !== 'Bytes' && variable.type !== 'Date'"
                cam-widget-clipboard="variable.value">{{ variable.value }}</span>
          <span ng-if="variable.type === 'Bytes'">{{ variable.value }}</span>
          <span ng-if="variable.type === 'Date'"
                cam-widget-clipboard="variable.value">{{ variable.value | camDate }}</span>
        </div>

        <div class="value-wrapper"
             ng-switch-when="value"
             ng-if="isEditable('value', info)">
          <a ng-click="setNull(v)"
             ng-if="!isNull(v)"
             class="set-null"
             tooltip-append-to-body="true"
             uib-tooltip="{{ 'CAM_WIDGET_VARIABLES_TABLE_TOOLTIP_SET_NULL' | translate }}">
            <span class="glyphicon glyphicon-remove"></span>
          </a>

          <input ng-if="isPrimitive(variable.type) && !useCheckbox(variable.type) && !isNull(v)"
                 type="text"
                 class="form-control"
                 ng-model="variable.value"
                 placeholder="{{ 'CAM_WIDGET_VARIABLES_TABLE_PLACEHOLDER_VALUE' | translate }}" />

          <input ng-if="useCheckbox(variable.type)"
                 type="checkbox"
                 ng-model="variable.value"
                 placeholder="{{ 'CAM_WIDGET_VARIABLES_TABLE_PLACEHOLDER_VALUE' | translate }}" />

          <a ng-if="variable.type === 'Object' && !isNull(v)"
             ng-click="editVariableValue(v)">
            {{ variable.valueInfo.objectTypeName || '&lt;undefined&gt;' }}
          </a>

          <a ng-if="(variable.type === 'Json' || variable.type === 'Xml') && !isNull(v)"
             ng-click="editVariableValue(v)">
            {{ variable.value || '&lt;undefined&gt;' }}
          </a>

          <a ng-if="variable.type !== 'Null' && !isBinary(variable.type) && isNull(v)"
             ng-click="setNonNull(v)"
             class="null-value"
             tooltip-append-to-body="true"
             uib-tooltip="{{ 'CAM_WIDGET_VARIABLES_TABLE_TOOLTIP_DEFAULT_VALUE' | translate }}">
            <span class="null-symbol">&lt;null&gt;</span>
          </a>

          <a ng-if="isBinary(variable.type)"
             ng-click="uploadVariable(v)"
             tooltip-append-to-body="true"
             uib-tooltip="{{ 'CAM_WIDGET_VARIABLES_TABLE_TOOLTIP_UPLOAD' | translate }}">
            Upload
          </a>

          <span ng-if="variable.type === 'Null'"
                class="null-value">
            <span class="null-symbol">{{ 'CAM_WIDGET_VARIABLES_TABLE_NULL' | translate }}</span>
          </span>
        </div><!-- / value-wrapper -->
        <!-- ................................................................................... -->


        <div ng-switch-default
             cam-render-var-template
             info="info"
             header-name="headerClass">
        </div>
      </td>

      <td class="actions"
          ng-if="editable.length">
        <div ng-if="!info.editMode"
             class="btn-group">
          <button class="btn btn-xs btn-primary"
                  ng-disabled="!canEditVariable(info, v)"
                  ng-click="enableEditMode(info, true)"
                  tooltip-append-to-body="true"
                  uib-tooltip="{{ 'CAM_WIDGET_VARIABLES_TABLE_EDIT_VARIABLE' | translate }}">
            <span class="glyphicon glyphicon-pencil"></span>
          </button>
          <button class="btn btn-xs btn-default"
                  ng-disabled="!canEditVariable(info, v)"
                  ng-click="deleteVariable(v)"
                  tooltip-append-to-body="true"
                  uib-tooltip="{{ 'CAM_WIDGET_VARIABLES_TABLE_DELETE_VARIABLE' | translate }}">
            <span class="glyphicon glyphicon glyphicon-trash"></span>
          </button>
        </div>

        <div ng-if="info.editMode"
             class="btn-group">
          <button class="btn btn-xs btn-primary"
                  ng-disabled="!info.valid || !info.changed"
                  ng-click="saveVariable(v)"
                  tooltip-append-to-body="true"
                  uib-tooltip="{{ 'CAM_WIDGET_VARIABLES_TABLE_SAVE_VARIABLE' | translate }}">
            <span class="glyphicon glyphicon-ok"></span>
          </button>
          <button class="btn btn-xs btn-default"
                  ng-click="enableEditMode(info, false)"
                  tooltip-append-to-body="true"
                  uib-tooltip="{{ 'CAM_WIDGET_VARIABLES_TABLE_REVERT_VARIABLE' | translate }}">
            <span class="glyphicon glyphicon-remove"></span>
          </button>
        </div>
      </td>
    </tr>
  </tbody>
</table>
`;
