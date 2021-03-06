/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var App = require('app');

App.MainHostSummaryView = Em.View.extend({

  templateName: require('templates/main/host/summary'),

  /**
   * List of custom view for some host components
   * @type {Em.Object}
   * Format:
   *  <code>
   *    {
   *      COMPONENT_NAME1: VIEW1,
   *      COMPONENT_NAME2: VIEW2
   *      ....
   *    }
   *  </code>
   */
  hostComponentViewMap: Em.Object.create({
    'DATANODE': App.DataNodeComponentView,
    'NODEMANAGER': App.NodeManagerComponentView,
    'HBASE_REGIONSERVER': App.RegionServerComponentView,
    'TASKTRACKER': App.TaskTrackerComponentView
  }),

  /**
   * @type {bool}
   */
  isStopCommand:true,

  /**
   * @type {App.Host}
   */
  content: function () {
    return App.router.get('mainHostDetailsController.content');
  }.property('App.router.mainHostDetailsController.content'),

  showGangliaCharts: function () {
    var name = this.get('content.hostName');
    var gangliaMobileUrl = App.router.get('clusterController.gangliaUrl') + "/mobile_helper.php?show_host_metrics=1&h=" + name + "&c=HDPNameNode&r=hour&cs=&ce=";
    window.open(gangliaMobileUrl);
  },

  /**
   * Message for "restart" block
   * @type {String}
   */
  needToRestartMessage: function() {
    var componentsCount, word;
    componentsCount = this.get('content.componentsWithStaleConfigsCount');
    if (componentsCount > 1) {
      word = Em.I18n.t('common.components').toLowerCase();
    } else {
      word = Em.I18n.t('common.component').toLowerCase();
    }
    return Em.I18n.t('hosts.host.details.needToRestart').format(this.get('content.componentsWithStaleConfigsCount'), word);
  }.property('content.componentsWithStaleConfigsCount'),

  /**
   * Reset <code>sortedComponents</code>
   * Used when some component was deleted from host
   */
  redrawComponents: function() {
    if (App.router.get('mainHostDetailsController.redrawComponents')) {
      this.set('sortedComponents', []);
      this.sortedComponentsFormatter();
      App.router.set('mainHostDetailsController.redrawComponents', false);
    }
  }.observes('App.router.mainHostDetailsController.redrawComponents'),

  willInsertElement: function() {
    this.set('sortedComponents', []);
    this.sortedComponentsFormatter();
  },

  didInsertElement: function () {
    this.addToolTip();
  },

  /**
   * Create tooltip for "Add" button if nothing to add to the current host
   */
  addToolTip: function() {
    if (this.get('addComponentDisabled')) {
      App.tooltip($('#add_component'), {title: Em.I18n.t('services.nothingToAdd')});
    }
  }.observes('addComponentDisabled'),

  /**
   * List of installed services
   * @type {String[]}
   */
  installedServices: function () {
    return App.Service.find().mapProperty('serviceName');
  }.property('App.router.clusterController.dataLoadList.serviceMetrics'),

  /**
   * List of installed masters and slaves
   * Masters first, then slaves
   * @type {App.HostComponent[]}
   */
  sortedComponents: [],

  /**
   * Update <code>sortedComponents</code>
   * Master components first, then slaves
   */
  sortedComponentsFormatter: function() {
    var updatebleProperties = Em.A(['workStatus', 'passiveState', 'staleConfigs', 'haStatus']);
    var self = this;
    var hostComponentViewMap = this.get('hostComponentViewMap');
    // Remove deleted components
    this.get('sortedComponents').forEach(function(sortedComponent, index) {
      if (!self.get('content.hostComponents').findProperty('id', sortedComponent.get('id'))) {
        self.get('sortedComponents').removeAt(index, 1);
      }
    });

    this.get('content.hostComponents').forEach(function (component) {
      if (component.get('isMaster') || component.get('isSlave')) {
        var obj = this.get('sortedComponents').findProperty('id', component.get('id'));
        if (obj) {
          // Update existing component
          updatebleProperties.forEach(function(property) {
            obj.set(property, component.get(property));
          });
        }
        else {
          // Add new component
          component.set('view', hostComponentViewMap[component.get('componentName')] ? hostComponentViewMap[component.get('componentName')] : App.HostComponentView);
          if (component.get('isMaster')) {
            // Masters should be before slaves
            var lastMasterIndex = 0, atLeastOneMasterExists = false;
            this.get('sortedComponents').forEach(function(sortedComponent, index) {
              if (sortedComponent.get('isMaster')) {
                lastMasterIndex = index;
                atLeastOneMasterExists = true;
              }
            });
            this.get('sortedComponents').insertAt(atLeastOneMasterExists ? lastMasterIndex + 1 : 0, component);
          }
          else {
            // it is slave 100%
            this.get('sortedComponents').pushObject(component);
          }
        }
      }
    }, this);
  }.observes('content.hostComponents.length'),

  /**
   * List of installed clients
   * @type {App.HostComponent[]}
   */
  clients: function () {
    var clients = [];
    this.get('content.hostComponents').forEach(function (component) {
      if (!component.get('componentName')) {
        //temporary fix because of different data in hostComponents and serviceComponents
        return;
      }
      if (!component.get('isSlave') && !component.get('isMaster')) {
        if (clients.length) {
          clients[clients.length - 1].set('isLast', false);
        }
        component.set('isLast', true);
        clients.push(component);
      }
    }, this);
    return clients;
  }.property('content.hostComponents.length'),

  /**
   * Check if some clients have stale configs
   * @type {bool}
   */
  areClientWithStaleConfigs: function() {
    return !!this.get('clients').filter(function(component) {
      return component.get('staleConfigs');
    }).length;
  }.property('clients.@each.staleConfigs'),

  /**
   * Template for addable component
   * @type {Em.Object}
   */
  addableComponentObject: Em.Object.extend({
    componentName: '',
    subComponentNames: null,
    displayName: function () {
      if (this.get('componentName') === 'CLIENTS') {
        return this.t('common.clients');
      }
      return App.format.role(this.get('componentName'));
    }.property('componentName')
  }),

  /**
   * If host lost heartbeat, components can't be added on it
   * @type {bool}
   */
  isAddComponent: function () {
    return this.get('content.healthClass') !== 'health-status-DEAD-YELLOW';
  }.property('content.healthClass'),

  /**
   * Disable "Add" button if components can't be added to the current host
   * @type {bool}
   */
  addComponentDisabled: function() {
    return (!this.get('isAddComponent')) || (this.get('addableComponents.length') == 0);
  }.property('isAddComponent', 'addableComponents.length'),

  /**
   * List of client's that may be installed to the current host
   * @type {String[]}
   */
  installableClientComponents: function() {
    if (!App.supports.deleteHost) {
      return [];
    }
    var componentServiceMap = App.QuickDataMapper.componentServiceMap();
    var allClients = App.get('components.clients');
    var installedServices = this.get('installedServices');
    var installedClients = this.get('clients').mapProperty('componentName');
    return allClients.filter(function(componentName) {
      // service for current client is installed but client isn't installed on current host
      return installedServices.contains(componentServiceMap[componentName]) && !installedClients.contains(componentName);
    });
  }.property('content.hostComponents.length', 'installedServices.length', 'App.supports.deleteHost'),

  /**
   * List of components that may be added to the current host
   * @type {Em.Object[]}
   */
  addableComponents: function () {
    var components = [];
    var self = this;
    var installableClients = this.get('installableClientComponents');
    var installedComponents = this.get('content.hostComponents').mapProperty('componentName');
    var addableToHostComponents = App.get('components.addableToHost');
    var installedServices = this.get('installedServices');
    var componentServiceMap = App.QuickDataMapper.componentServiceMap();

    addableToHostComponents.forEach(function(addableComponent) {
      if(installedServices.contains(componentServiceMap[addableComponent]) && !installedComponents.contains(addableComponent)) {
        components.pushObject(self.addableComponentObject.create({'componentName': addableComponent}));
      }
    });
    if (installableClients.length > 0) {
      components.pushObject(this.addableComponentObject.create({ 'componentName': 'CLIENTS', subComponentNames: installableClients }));
    }

    return components;
  }.property('content.hostComponents.length', 'installableClientComponents'),

  /**
   * Formatted with <code>$.timeago</code> value of host's last heartbeat
   * @type {String}
   */
  timeSinceHeartBeat: function () {
    var d = this.get('content.lastHeartBeatTime');
    if (d) {
      return $.timeago(d);
    }
    return "";
  }.property('content.lastHeartBeatTime')
});
