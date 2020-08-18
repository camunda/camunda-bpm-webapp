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
package org.camunda.bpm.admin.impl.web.bootstrap;

import java.util.Set;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.camunda.bpm.ProcessEngineService;
import org.camunda.bpm.admin.Admin;
import org.camunda.bpm.admin.impl.DefaultAdminRuntimeDelegate;
import org.camunda.bpm.container.RuntimeContainerDelegate;
import org.camunda.bpm.engine.ProcessEngine;

/**
 * @author Daniel Meyer
 *
 */
public class AdminContainerBootstrap implements ServletContextListener {

  private AdminEnvironment environment;

  @Override
  public void contextInitialized(ServletContextEvent sce) {

    environment = createAdminEnvironment();
    environment.setup();

    try {
      String serverInfo = sce.getServletContext().getServerInfo();
      if (serverInfo != null && !serverInfo.isEmpty()) {
        ProcessEngineService processEngineService = environment.getContainerRuntimeDelegate().getProcessEngineService();
        Set<String> processEngineNames = processEngineService.getProcessEngineNames();
        for (String engineName : processEngineNames) {
          ProcessEngine processEngine = processEngineService.getProcessEngine(engineName);
          // store application server information
          if (processEngine.getProcessEngineConfiguration().getTelemetryRegistry() != null &&
              processEngine.getProcessEngineConfiguration().getTelemetryRegistry().getApplicationServer() == null) {
            processEngine.getProcessEngineConfiguration()
                .getTelemetryRegistry()
                .setApplicationServer(serverInfo);
          }
        }
      }
    } catch (Exception e) {
      // do nothing
    }

  }

  @Override
  public void contextDestroyed(ServletContextEvent sce) {

    environment.tearDown();
  }

  protected AdminEnvironment createAdminEnvironment() {
    return new AdminEnvironment();
  }

  protected static class AdminEnvironment {

    public void tearDown() {
      Admin.setAdminRuntimeDelegate(null);
    }

    public void setup() {
      Admin.setAdminRuntimeDelegate(new DefaultAdminRuntimeDelegate());
    }

    protected RuntimeContainerDelegate getContainerRuntimeDelegate() {
      return RuntimeContainerDelegate.INSTANCE.get();
    }
  }
}
