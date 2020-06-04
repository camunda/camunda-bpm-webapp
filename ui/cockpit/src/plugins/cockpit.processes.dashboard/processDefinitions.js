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
import { Link } from "react-router-dom";

import { Table, StateCircle, LoadingIndicator } from "components";
import { get } from "utils/request";
import translate from "utils/translation";

import "./processDefinitions.scss";

const noop = () => {};

function ReactProcesses() {
  const [processes, setProcesses] = useState(null);
  const [sortCriteria, setSortCriteria] = useState({
    sortBy: "label",
    order: "asc"
  });

  useEffect(() => {
    get("%ENGINE_API%/process-definition/statistics?incidents=true")
      .then(groupProcesses)
      .catch(noop);
  }, []);

  const groupProcesses = async function(res) {
    let processStatistics = await res.json();

    // Group by latest version and tenant
    const groupedProcesses = [];
    const processIdAndTenantMap = [];

    processStatistics.forEach(statistic => {
      // Expose display values to root level and sanitize input
      statistic.incidents = statistic.incidents.reduce(
        (total, current) => total + current.incidentCount,
        0
      );
      statistic.label = statistic.definition.name || statistic.definition.key;
      statistic.key = statistic.definition.key;
      statistic.id = statistic.definition.id;
      statistic.tenantId = statistic.definition.tenantId || "";

      if (!processIdAndTenantMap[statistic.key]) {
        // if no statistic with this key exists, create it
        processIdAndTenantMap[statistic.key] = [];
      }
      // 2 Dimensional because of Tenants
      let currentStatistic =
        processIdAndTenantMap[statistic.key][statistic.tenantId];
      if (!currentStatistic) {
        processIdAndTenantMap[statistic.key][statistic.tenantId] = statistic;
        groupedProcesses.push(statistic);
        return;
      }

      // Accumulate stats of all versions
      currentStatistic.incidents += statistic.incidents;
      currentStatistic.instances += statistic.instances;

      // link only the newest Definition version
      if (currentStatistic.definition.version < statistic.definition.version) {
        currentStatistic.definition = statistic.definition;
        currentStatistic.id = statistic.id;
        currentStatistic.label = statistic.label;
      }
    });

    setProcesses(groupedProcesses);
  };

  const headings = [
    { label: "State" },
    { label: "Incidents", sortBy: "incidents" },
    { label: "Running Instances", sortBy: "instances" },
    { label: "Name", sortBy: "label" },
    { label: "Tenant ID", sortBy: "tenantId" }
  ];

  if (!processes) {
    return <LoadingIndicator />;
  }
  const sortedProcesses = processes.sort((a, b) => {
    if (sortCriteria.order === "asc") {
      return a[sortCriteria.sortBy]
        .toString()
        .localeCompare(b[sortCriteria.sortBy], undefined, { numeric: true });
    } else {
      return b[sortCriteria.sortBy]
        .toString()
        .localeCompare(a[sortCriteria.sortBy], undefined, { numeric: true });
    }
  });

  function handleOnSort(el) {
    return () => {
      setSortCriteria({
        sortBy: el.sortBy,
        order:
          // Set asc by default, switch if its currently sorted by this key
          sortCriteria.sortBy === el.sortBy && sortCriteria.order === "asc"
            ? "desc"
            : "asc"
      });
    };
  }

  return (
    <div className="ProcessDefinitions">
      <h1 className="title">
        {processes.length}{" "}
        {translate("PLUGIN_PROCESS_DEF_PROCESS_DEFINITION_DEPLOYED")}
      </h1>
      <Table
        head={headings.map(el => {
          if (el.sortBy) {
            return (
              <Table.Head
                key={el.label}
                onSort={handleOnSort(el)}
                sortOrder={
                  sortCriteria.sortBy === el.sortBy ? sortCriteria.order : ""
                }
              >
                {el.label}
              </Table.Head>
            );
          } else {
            return <Table.Head key={el.label}>{el.label}</Table.Head>;
          }
        })}
      >
        {sortedProcesses.map(el => {
          return (
            <Table.Row key={el.id}>
              <Table.Cell className="state">
                <StateCircle state={el.incidents ? "error" : "ok"} />
              </Table.Cell>
              <Table.Cell className="incidents">{el.incidents}</Table.Cell>
              <Table.Cell className="instances">{el.instances}</Table.Cell>
              <Table.Cell className="name">
                {/* Replace with Link element when replacing parent with react */}
                <Link to={"/process-definition/" + el.id}>{el.label}</Link>
              </Table.Cell>
              <Table.Cell className="tenant">{el.tenantId}</Table.Cell>
            </Table.Row>
          );
        })}
      </Table>
    </div>
  );
}

export default {
  id: "react-processes-dashboard",
  pluginPoint: "cockpit.processes.dashboard",
  priority: 1000,
  render: node => {
    return <ReactProcesses />;
  }
};
