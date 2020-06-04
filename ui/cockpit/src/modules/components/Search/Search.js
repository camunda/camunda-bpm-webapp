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

import React, { useState } from "react";
import { Dropdown } from "components";
import SearchPill from "./SearchPill";

import "./Search.scss";

export default function Search({ onChange, availableSearches }) {
  const [searches, setSearches] = useState([]);
  // const [validSearches, setValidSearches] = useState([]);

  function handleChange(search, idx) {
    searches[idx] = search;
    setSearches(searches);
    onChange(searches);
  }

  function createNewSearch(template) {
    setSearches(searches.concat(template));
  }

  function removeSearch(idx) {
    searches.splice(idx, 1);
    setSearches(searches);
    onChange(searches);
  }

  return (
    <div className="Search">
      {searches.map((search, idx) => {
        return (
          <SearchPill
            onChange={value => {
              handleChange(value, idx);
            }}
            removeSearch={() => removeSearch(idx)}
            template={search}
          />
        );
      })}
      <Dropdown
        title={
          <input
            type="text"
            placeholder="Add Criteria"
            className="addSearchButton"
          />
        }
      >
        {availableSearches.map(template => {
          return (
            <Dropdown.Option
              onClick={() => {
                createNewSearch(template);
              }}
            >
              {template.label}
            </Dropdown.Option>
          );
        })}
      </Dropdown>
      {/* Look at this search. It is SO. BIG. */}
    </div>
  );
}
