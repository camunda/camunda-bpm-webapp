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
package org.camunda.bpm.webapp.impl.util;

import javax.servlet.ServletContext;

public class ServletContextUtil {

  protected static final String SUCCESSFUL_ET_ATTR_NAME =
    "org.camunda.bpm.webapp.telemetry.data.stored";

  /**
   * @return whether the web application has already successfully been sent to
   *         the engine as telemetry info or not.
   */
  public static boolean isTelemetryDataSentAlready(String webappName, String engineName, ServletContext servletContext) {
    return servletContext.getAttribute(buildTelemetrySentAttribute(webappName, engineName)) != null;
  }

  /**
   * Marks the web application as successfully sent to the engine as telemetry
   * info
   */
  public static void setTelemetryDataSent(String webappName, String engineName, ServletContext servletContext) {
    servletContext.setAttribute(buildTelemetrySentAttribute(webappName, engineName), true);
  }

  protected static String buildTelemetrySentAttribute(String webappName, String engineName) {
    return SUCCESSFUL_ET_ATTR_NAME + "." + webappName + "." + engineName;
  }

}
