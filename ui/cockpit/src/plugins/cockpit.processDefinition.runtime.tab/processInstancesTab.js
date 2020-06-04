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

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

import { post } from "utils/request";

import { Table, StateCircle, Search, LoadingIndicator } from "components";

import "./ProcessInstancesTab.scss";

function ProcessInstancesTab(props) {
  const [processes, setProcesses] = useState(null);
  const [sortCriteria, setSortCriteria] = useState({
    sortBy: "startTime",
    sortOrder: "desc"
  });
  const [searches, setSearches] = useState({});

  useEffect(() => {
    const processDefinitionId = window.location.hash.split("/")[2];

    post(
      "%COCKPIT_API%/plugin/base/%ENGINE%/process-instance?firstResult=0&maxResults=50",
      {
        processDefinitionId: processDefinitionId,
        ...sortCriteria,
        ...searches
      }
    )
      .then(async res => {
        const json = await res.json();
        setProcesses(json);
      })
      .catch(() => {});
  }, [searches, sortCriteria]);

  const changeSorting = () => {
    setSortCriteria({
      sortBy: "startTime",
      sortOrder: sortCriteria.sortOrder === "desc" ? "asc" : "desc"
    });
    setProcesses(null);
  };

  if (!processes) {
    return <LoadingIndicator />;
  }

  const localDate = timeStamp => {
    const date = new Date(timeStamp);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric"
    };
    return date.toLocaleString("en-uk", options);
  };

  function handleChange(searchObj) {
    let newSearches = {};
    searchObj.forEach(element => {
      newSearches[element.key] = element.value;
    });
    setSearches(newSearches);
  }

  const availableSearches = [
    { label: "Business Key", key: "businessKey" },
    { label: "Activity ID", key: "activityId" },
    {
      label: "Start Date",
      key: "startDate",
      operators: ["before", "after"],
      type: "Time"
    },
    {
      label: "Variable",
      key: "",
      operators: ["=", "!=", ">", ">=", "<", "<=", "like"],
      type: "Time"
    }
  ];

  return (
    <div className="ProcessInstancesTab">
      <Search onChange={handleChange} availableSearches={availableSearches} />
      <Table
        head={
          <>
            <Table.Head>State</Table.Head>
            <Table.Head>ID</Table.Head>
            <Table.Head
              sortOrder={sortCriteria.sortOrder}
              onSort={changeSorting}
            >
              Start Time
            </Table.Head>
            <Table.Head>Business Key</Table.Head>
          </>
        }
      >
        {processes.map(process => {
          return (
            <Table.Row key={process.id}>
              <Table.Cell>
                <StateCircle
                  state={process.incidents.length ? "error" : "ok"}
                />
              </Table.Cell>
              <Table.Cell>
                <a href={`#/process-instance/${process.id}`}>{process.id}</a>
              </Table.Cell>
              <Table.Cell>{localDate(process.startTime)}</Table.Cell>
              <Table.Cell>{process.businessKey}</Table.Cell>
            </Table.Row>
          );
        })}
      </Table>
    </div>
  );
}

let container;

export default {
  id: "processInstances",
  pluginPoint: "cockpit.processDefinition.runtime.tab",
  priority: 12,
  label: "Process Instances (new!)",
  render: node => {
    container = node;
    ReactDOM.render(<ProcessInstancesTab />, container);
  },
  cleanup: () => {
    ReactDOM.unmountComponentAtNode(container);
  }
};
