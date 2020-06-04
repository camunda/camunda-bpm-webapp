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

import React, { useState, useEffect, useRef } from "react";

import "./SearchPill.scss";
import { LinkButton } from "../LinkButton";

export default function SearchPill({ onChange, template, removeSearch }) {
  const [key, setKey] = useState(template.key);
  const [value, setValue] = useState("");

  function onKeyChange(key) {
    setKey(key);
    onChange({ key: key, value: value });
  }

  function onValueChange(value) {
    setValue(value);
    onChange({ key: key, value: value });
  }

  return (
    <span className="SearchPill">
      <LinkButton onClick={removeSearch}>x</LinkButton>
      <SearchField
        openOnDefault={!template.key}
        templateValue={template.key}
        onConfirm={onKeyChange}
      />{" "}
      = <SearchField openOnDefault={true} onConfirm={onValueChange} />
    </span>
  );
}

function SearchField({ templateValue, openOnDefault, onConfirm }) {
  const [isActive, setIsActive] = useState(openOnDefault || false);
  const [value, setValue] = useState(templateValue || "");
  const ref = useRef(null);

  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.focus();
    }
  }, [isActive]);

  function handleValueChange(ev) {
    setValue(ev.target.value);
  }

  function handleConfirm(ev) {
    if (ev.key === "Enter") {
      onConfirm(value);
      setIsActive(false);
    }
  }

  if (!isActive) {
    return (
      <span
        className="SearchField"
        onClick={() => {
          setIsActive(true);
        }}
      >
        {value || "??"}
      </span>
    );
  }

  return (
    <input
      className="SearchField"
      value={value}
      onChange={handleValueChange}
      onKeyDown={handleConfirm}
      type="text"
      placeholder="value"
      ref={ref}
    />
  );
}
