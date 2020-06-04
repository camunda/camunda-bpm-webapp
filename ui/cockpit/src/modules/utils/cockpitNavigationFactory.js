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

import React from "react";
import { Link } from "react-router-dom";

export default function(id, label, priority) {
  let node;

  function checkActive(url) {
    if (url.includes("/" + id)) {
      node.classList.add("active");
    } else {
      node.classList.remove("active");
    }
  }

  function handleLocationChange(evt) {
    checkActive(evt.newURL);
  }

  return {
    id: "cockpit" + id,
    pluginPoint: "cockpit.navigation",
    priority: priority,
    render: container => {
      node = container;
      window.addEventListener("hashchange", handleLocationChange);
      checkActive(window.location.href);

      return <Link to={"/" + id}>{label}</Link>;
    },
    cleanup: () => {
      window.removeEventListener("hashchange", handleLocationChange);
    }
  };
}
