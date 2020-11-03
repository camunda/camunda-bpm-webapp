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

import React, { useEffect, useState } from "react";
import { Modal, Button, Form, FormControl, Table } from "react-bootstrap";
import translate from "utils/translation";
import { getConfig } from "utils/config";
import { addMessage, addError, clearAll } from "utils/notifications";
import { Notifications, ActionButton, ModalFormGroup } from "components";
import { del, get, post } from "utils/request";
import { useHistory } from "react-router-dom";

import eePlugins from "enterprise/cockpit/cockpitPluginsEE";

export default function CancelProcessInstance({ processInstanceId }) {
  const STATUS = Object.freeze({
    LOADING: 1,
    INITIAL: 2,
    ACTION_PENDING: 3,
    CONFIRMATION: 4,
    FAILED: 5
  });

  const [status, setStatus] = useState(STATUS.LOADING);

  const [processInstance, setProcessInstance] = useState(null);
  const [subProcessInstances, setSubProcessInstances] = useState(null);
  const [subProcessInstancesCount, setSubProcessInstancesCount] = useState(
    null
  );

  const loadProcessInstance = async () => {
    return await (await get(
      `%ENGINE_API%/process-instance/${processInstanceId}`
    )).json();
  };

  const loadSubProcessInstances = async () => {
    return await (await post(
      `%ENGINE_API%/process-instance?firstResult=0&maxResults=5`,
      { superProcessInstance: processInstanceId }
    )).json();
  };

  const loadSubProcessInstancesCount = async () => {
    return await (await post(`%ENGINE_API%/process-instance/count`, {
      superProcessInstance: processInstanceId
    })).json();
  };

  const load = () => {
    Promise.all([
      loadProcessInstance(),
      loadSubProcessInstances(),
      loadSubProcessInstancesCount()
    ])
      .then(
        ([processInstance, subProcessInstances, subProcessInstancesCount]) => {
          setProcessInstance(processInstance);
          setSubProcessInstances(subProcessInstances);
          setSubProcessInstancesCount(subProcessInstancesCount.count);
          setStatus(STATUS.INITIAL);
        }
      )
      .catch(() => {
        setStatus(STATUS.FAILED);
      });
  };

  useEffect(load, [processInstanceId]);

  const isEnterprise = eePlugins.name !== "ee-stub";

  const initialShow = false;
  const [show, setShow] = useState(initialShow);

  const initialChecked = {
    skipCustomListeners: getConfig().skipCustomListeners.default,
    skipIoMappings: getConfig().skipIoMappings.default
  };

  const [checked, setChecked] = useState(initialChecked);

  const handleChange = event => {
    setChecked({
      ...checked,
      [event.target.name]: event.target.checked
    });
  };

  const openDialog = () => {
    setShow(true);
  };

  const check = checkedStatus => {
    return status === checkedStatus;
  };

  const history = useHistory();

  const closeDialog = () => {
    if (!check(STATUS.ACTION_PENDING)) {
      if (check(STATUS.CONFIRMATION)) {
        const pathname = isEnterprise
          ? `/process-instance/${processInstanceId}/history`
          : `/process-definition/${processInstance.definitionId}`;

        if (history.location.pathname === pathname) {
          window.location.reload(false);
        } else {
          history.push(pathname);
        }
      } else {
        setStatus(STATUS.INITIAL);
        setChecked(initialChecked);
        setShow(initialShow);
        clearAll();
      }
    }
  };

  const deleteProcessInstance = () => {
    setStatus(STATUS.ACTION_PENDING);

    del(
      `%ENGINE_API%/process-instance/${processInstanceId}` +
        `?skipCustomListeners=${checked.skipCustomListeners}` +
        `&skipIoMappings=${checked.skipIoMappings}`
    )
      .then(() => {
        setStatus(STATUS.CONFIRMATION);
        addMessage({
          status: translate("PLUGIN_CANCEL_PROCESS_STATUS_DELETED"),
          message: translate("PLUGIN_CANCEL_PROCESS_MESSAGE_1")
        });
      })
      .catch(error => {
        setStatus(STATUS.FAILED);
        error.json().then(response => {
          addError({
            status: translate("PLUGIN_CANCEL_PROCESS_STATUS_FAILED"),
            message: translate("PLUGIN_CANCEL_PROCESS_MESSAGE_2", {
              message: response.message
            }),
            exclusive: ["type"]
          });
        });
      });
  };

  return (
    <>
      <ActionButton
        labels={{
          enabled: "PLGN_HIST_CANCEL_RUNNING_INSTANCES",
          disabled: "PLGN_HIST_CANCEL_NOT_POSSIBLE"
        }}
        icon="remove"
        onClick={openDialog}
        disabled={check(STATUS.FAILED) || check(STATUS.LOADING)}
      />

      <Modal show={show} onHide={closeDialog}>
        <Modal.Header>
          <h3>{translate("PLUGIN_CANCEL_PROCESS_DELETE_PROCESS_INSTANCE")}</h3>
        </Modal.Header>
        <Modal.Body>
          <Notifications />

          {check(STATUS.LOADING) && (
            <>
              <span className="glyphicon glyphicon-loading" />
              {translate("PLUGIN_CANCEL_PROCESS_LOADING_INFORMATION")}
            </>
          )}

          {(check(STATUS.INITIAL) || check(STATUS.ACTION_PENDING)) && (
            <>
              {subProcessInstances.length > 0 && (
                <>
                  {translate("PLUGIN_CANCEL_PROCESS_BEFORE_DELETION")}
                  <Table className="table cam-table">
                    <thead>
                      <tr>
                        <th className="instance-id uuid">
                          {translate("PLUGIN_CANCEL_PROCESS_ID")}
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {subProcessInstances.map(subProcessInstance => (
                        <tr key={subProcessInstance.id}>
                          <td className="instance-id uuid">
                            <a
                              href={`#/process-instance/${
                                subProcessInstance.id
                              }`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {subProcessInstance.id}
                            </a>
                          </td>
                        </tr>
                      ))}
                      {subProcessInstancesCount >
                        subProcessInstances.length && (
                        <tr>
                          <td>
                            {translate(
                              "PLUGIN_CANCEL_PROCESS_OTHER_PROCESS_INSTANCES",
                              {
                                count:
                                  subProcessInstancesCount -
                                  subProcessInstances.length
                              }
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </>
              )}
              {(!getConfig().skipIoMappings.hidden ||
                !getConfig().skipCustomListeners.hidden) && (
                <Form horizontal>
                  <fieldset disabled={check(STATUS.ACTION_PENDING)}>
                    {!getConfig().skipCustomListeners.hidden && (
                      <ModalFormGroup
                        label="PLUGIN_CANCEL_PROCESS_SKIP_CUSTOM_LISTENERS"
                        tooltip="PLUGIN_CANCEL_PROCESS_TOOLTIP_VALUE_ENABLED"
                        formControl={
                          <FormControl
                            type="checkbox"
                            name="skipCustomListeners"
                            onChange={handleChange}
                            defaultChecked={checked.skipCustomListeners}
                          />
                        }
                      />
                    )}
                    {!getConfig().skipIoMappings.hidden && (
                      <ModalFormGroup
                        label="PLUGIN_CANCEL_PROCESS_SKIP_IO_MAPPINGS"
                        tooltip="PLUGIN_CANCEL_PROCESS_TOOLTIP_VALUE_ENABLED_IO"
                        formControl={
                          <FormControl
                            type="checkbox"
                            name="skipIoMappings"
                            onChange={handleChange}
                            defaultChecked={checked.skipIoMappings}
                          />
                        }
                      />
                    )}
                  </fieldset>
                </Form>
              )}
              <p>{translate("PLUGIN_CANCEL_PROCESS_DELETE_CONFIRM")}</p>
            </>
          )}

          {check(STATUS.CONFIRMATION) && (
            <>
              <p>{translate("PLUGIN_CANCEL_PROCESS_DELETE_SUCCESS_1")}</p>
              <p>{translate("PLUGIN_CANCEL_PROCESS_DELETE_SUCCESS_2")}</p>
            </>
          )}

          {check(STATUS.FAILED) && (
            <>
              <p>{translate("PLUGIN_CANCEL_PROCESS_DELETE_FAILED_1")}</p>
              <p>{translate("PLUGIN_CANCEL_PROCESS_DELETE_FAILED_2")}</p>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          {(check(STATUS.INITIAL) || check(STATUS.ACTION_PENDING)) && (
            <>
              <Button
                disabled={check(STATUS.ACTION_PENDING)}
                onClick={closeDialog}
              >
                {translate("PLUGIN_CANCEL_PROCESS_CLOSE")}
              </Button>
              <Button
                bsStyle="primary"
                disabled={check(STATUS.ACTION_PENDING)}
                onClick={deleteProcessInstance}
              >
                {translate("PLUGIN_CANCEL_PROCESS_DELETE_PROCESS_INSTANCE")}
              </Button>
            </>
          )}

          {(check(STATUS.CONFIRMATION) || check(STATUS.FAILED)) && (
            <>
              <Button bsStyle="primary" onClick={closeDialog}>
                {translate("PLUGIN_CANCEL_PROCESS_OK")}
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}
