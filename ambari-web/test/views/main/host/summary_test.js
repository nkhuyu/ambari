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
require('models/host');
require('models/service');
require('models/host_component');
require('mappers/server_data_mapper');
require('views/main/host/summary');

var mainHostSummaryView;
var extendedMainHostSummaryView = App.MainHostSummaryView.extend({content: {}, addToolTip: function(){}, installedServices: []});

describe('App.MainHostSummaryView', function() {

  beforeEach(function() {
    mainHostSummaryView = extendedMainHostSummaryView.create({});
  });

  describe('#sortedComponents', function() {

    var tests = Em.A([
      {
        content: Em.Object.create({
          hostComponents: Em.A([
            Em.Object.create({isMaster: false, isSlave: true, componentName: 'B'}),
            Em.Object.create({isMaster: true, isSlave: false, componentName: 'A'}),
            Em.Object.create({isMaster: true, isSlave: false, componentName: 'C'}),
            Em.Object.create({isMaster: false, isSlave: false, componentName: 'D'})
          ])
        }),
        m: 'List of masters, slaves and clients',
        e: ['A', 'C', 'B']
      },
      {
        content: Em.Object.create({
          hostComponents: Em.A([
            Em.Object.create({isMaster: false, isSlave: true, componentName: 'B'}),
            Em.Object.create({isMaster: true, isSlave: false, componentName: 'A'}),
            Em.Object.create({isMaster: true, isSlave: false, componentName: 'C'}),
            Em.Object.create({isMaster: true, isSlave: false, componentName: 'D'})
          ])
        }),
        m: 'List of masters and slaves',
        e: ['A', 'C', 'D', 'B']
      },
      {
        content: Em.Object.create({
          hostComponents: Em.A([
            Em.Object.create({isMaster: true, isSlave: false, componentName: 'B'}),
            Em.Object.create({isMaster: true, isSlave: false, componentName: 'A'}),
            Em.Object.create({isMaster: true, isSlave: false, componentName: 'C'}),
            Em.Object.create({isMaster: true, isSlave: false, componentName: 'D'})
          ])
        }),
        m: 'List of masters',
        e: ['B', 'A', 'C', 'D']
      },
      {
        content: Em.Object.create({
          hostComponents: Em.A([
            Em.Object.create({isMaster: false, isSlave: true, componentName: 'B'}),
            Em.Object.create({isMaster: false, isSlave: true, componentName: 'A'}),
            Em.Object.create({isMaster: false, isSlave: true, componentName: 'C'}),
            Em.Object.create({isMaster: false, isSlave: true, componentName: 'D'})
          ])
        }),
        m: 'List of slaves',
        e: ['B', 'A', 'C', 'D']
      },
      {
        content: Em.Object.create({
          hostComponents: Em.A([])
        }),
        m: 'Empty list',
        e: []
      },
      {
        content: Em.Object.create({
          hostComponents: Em.A([
            Em.Object.create({isMaster: false, isSlave: false, componentName: 'B'}),
            Em.Object.create({isMaster: false, isSlave: false, componentName: 'A'}),
            Em.Object.create({isMaster: false, isSlave: false, componentName: 'C'}),
            Em.Object.create({isMaster: false, isSlave: false, componentName: 'D'})
          ])
        }),
        m: 'List of clients',
        e: []
      }
    ]);

    tests.forEach(function(test) {
      it(test.m, function() {
        test.content.get('hostComponents').forEach(function(component) {
          component.set('id', component.get('componentName'));
        });
        mainHostSummaryView.set('sortedComponents', []);
        mainHostSummaryView.set('content', test.content);
        mainHostSummaryView.sortedComponentsFormatter();
        expect(mainHostSummaryView.get('sortedComponents').mapProperty('componentName')).to.eql(test.e);
      });
    });

  });

  describe('#clients', function() {

    var tests = Em.A([
      {
        content: Em.Object.create({
          hostComponents: Em.A([
            Em.Object.create({isMaster: false, isSlave: true, componentName: 'B'}),
            Em.Object.create({isMaster: true, isSlave: false, componentName: 'A'}),
            Em.Object.create({isMaster: true, isSlave: false, componentName: 'C'}),
            Em.Object.create({isMaster: false, isSlave: false, componentName: 'D'})
          ])
        }),
        m: 'List of masters, slaves and clients',
        e: ['D']
      },
      {
        content: Em.Object.create({
          hostComponents: Em.A([
            Em.Object.create({isMaster: false, isSlave: true, componentName: 'B'}),
            Em.Object.create({isMaster: true, isSlave: false, componentName: 'A'}),
            Em.Object.create({isMaster: true, isSlave: false, componentName: 'C'}),
            Em.Object.create({isMaster: true, isSlave: false, componentName: 'D'})
          ])
        }),
        m: 'List of masters and slaves',
        e: []
      },
      {
        content: Em.Object.create({
          hostComponents: Em.A([
            Em.Object.create({isMaster: true, isSlave: false, componentName: 'B'}),
            Em.Object.create({isMaster: true, isSlave: false, componentName: 'A'}),
            Em.Object.create({isMaster: true, isSlave: false, componentName: 'C'}),
            Em.Object.create({isMaster: true, isSlave: false, componentName: 'D'})
          ])
        }),
        m: 'List of masters',
        e: []
      },
      {
        content: Em.Object.create({
          hostComponents: Em.A([
            Em.Object.create({isMaster: false, isSlave: true, componentName: 'B'}),
            Em.Object.create({isMaster: false, isSlave: true, componentName: 'A'}),
            Em.Object.create({isMaster: false, isSlave: true, componentName: 'C'}),
            Em.Object.create({isMaster: false, isSlave: true, componentName: 'D'})
          ])
        }),
        m: 'List of slaves',
        e: []
      },
      {
        content: Em.Object.create({
          hostComponents: Em.A([])
        }),
        m: 'Empty list',
        e: []
      },
      {
        content: Em.Object.create({
          hostComponents: Em.A([
            Em.Object.create({isMaster: false, isSlave: false, componentName: 'B'}),
            Em.Object.create({isMaster: false, isSlave: false, componentName: 'A'}),
            Em.Object.create({isMaster: false, isSlave: false, componentName: 'C'}),
            Em.Object.create({isMaster: false, isSlave: false, componentName: 'D'})
          ])
        }),
        m: 'List of clients',
        e: ['B', 'A', 'C', 'D']
      }
    ]);

    tests.forEach(function(test) {
      it(test.m, function() {
        mainHostSummaryView.set('content', test.content);
        expect(mainHostSummaryView.get('clients').mapProperty('componentName')).to.eql(test.e);
      });
    });

  });

  describe('#areClientWithStaleConfigs', function() {

    var tests = Em.A([
      {
        content: Em.Object.create({
          hostComponents: Em.A([
            Em.Object.create({isMaster: false, isSlave: false, componentName: 'D', staleConfigs: true}),
            Em.Object.create({isMaster: false, isSlave: false, componentName: 'C', staleConfigs: false})
          ])
        }),
        m: 'Some clients with stale configs',
        e: true
      },
      {
        content: Em.Object.create({
          hostComponents: Em.A([
            Em.Object.create({isMaster: false, isSlave: false, componentName: 'D', staleConfigs: false}),
            Em.Object.create({isMaster: false, isSlave: false, componentName: 'C', staleConfigs: false})
          ])
        }),
        m: 'No clients with stale configs',
        e: false
      },
      {
        content: Em.Object.create({
          hostComponents: Em.A([
            Em.Object.create({isMaster: false, isSlave: false, componentName: 'D', staleConfigs: true}),
            Em.Object.create({isMaster: false, isSlave: false, componentName: 'C', staleConfigs: true})
          ])
        }),
        m: 'All clients with stale configs',
        e: true
      },
      {
        content: Em.Object.create({
          hostComponents: Em.A([])
        }),
        m: 'Empty list',
        e: false
      }
    ]);

    tests.forEach(function(test) {
      it(test.m, function() {
        mainHostSummaryView.set('content', test.content);
        expect(mainHostSummaryView.get('areClientWithStaleConfigs')).to.equal(test.e);
      });
    });

  });

  describe('#isAddComponent', function() {

    var tests = Em.A([
      {content: {healthClass: 'health-status-DEAD-YELLOW', hostComponents: Em.A([])}, e: false},
      {content: {healthClass: 'OTHER_VALUE', hostComponents: Em.A([])}, e: true}
    ]);

    tests.forEach(function(test) {
      it(test.content.healthClass, function() {
        mainHostSummaryView.set('content', test.content);
        expect(mainHostSummaryView.get('isAddComponent')).to.equal(test.e);
      });
    });

  });

  describe('#installableClientComponents', function() {

    it('delete host not supported', function() {
      App.set('supports.deleteHost', false);
      expect(mainHostSummaryView.get('installableClientComponents')).to.eql([]);
      App.set('supports.deleteHost', true);
    });

    var tests = Em.A([
      {
        content: Em.Object.create({
          hostComponents: Em.A([])
        }),
        services: ['HDFS', 'YARN', 'MAPREDUCE2'],
        e: ['HDFS_CLIENT', 'YARN_CLIENT', 'MAPREDUCE2_CLIENT'],
        m: 'no one client installed'
      },
      {
        content: Em.Object.create({
          hostComponents: Em.A([
            Em.Object.create({
              componentName: 'HDFS_CLIENT'
            })
          ])
        }),
        services: ['HDFS', 'YARN', 'MAPREDUCE2'],
        e: ['YARN_CLIENT', 'MAPREDUCE2_CLIENT'],
        m: 'some clients are already installed'
      },
      {
        content: Em.Object.create({
          hostComponents: Em.A([
            Em.Object.create({
              componentName: 'HDFS_CLIENT'
            }),
            Em.Object.create({
              componentName: 'YARN_CLIENT'
            }),
            Em.Object.create({
              componentName: 'MAPREDUCE2_CLIENT'
            })
          ])
        }),
        services: ['HDFS', 'YARN', 'MAPREDUCE2'],
        e: [],
        m: 'all clients are already installed'
      }
    ]);

    tests.forEach(function(test) {
      it(test.m, function() {
        mainHostSummaryView.set('content', test.content);
        mainHostSummaryView.set('installedServices', test.services);
        expect(mainHostSummaryView.get('installableClientComponents')).to.include.members(test.e);
        expect(test.e).to.include.members(mainHostSummaryView.get('installableClientComponents'));
      });
    });

  });

  describe('#addableComponents', function() {

    var tests = Em.A([
      {
        content: Em.Object.create({
          hostComponents: Em.A([])
        }),
        services: ['HDFS', 'YARN', 'MAPREDUCE2'],
        e: ['DATANODE', 'NODEMANAGER', 'CLIENTS'],
        m: 'no components on host (impossible IRL, but should be tested)'
      },
      {
        content: Em.Object.create({
          hostComponents: Em.A([
            Em.Object.create({
              componentName: 'HDFS_CLIENT'
            }),
            Em.Object.create({
              componentName: 'DATANODE'
            })
          ])
        }),
        services: ['HDFS', 'YARN', 'MAPREDUCE2'],
        e: ['NODEMANAGER', 'CLIENTS'],
        m: 'some components are already installed'
      },
      {
        content: Em.Object.create({
          hostComponents: Em.A([
            Em.Object.create({
              componentName: 'HDFS_CLIENT'
            }),
            Em.Object.create({
              componentName: 'YARN_CLIENT'
            }),
            Em.Object.create({
              componentName: 'MAPREDUCE2_CLIENT'
            }),
            Em.Object.create({
              componentName: 'NODEMANAGER'
            })
          ])
        }),
        services: ['HDFS', 'YARN', 'MAPREDUCE2'],
        e: ['DATANODE'],
        m: 'all clients and some other components are already installed'
      }
    ]);

    tests.forEach(function(test) {
      it(test.m, function() {
        mainHostSummaryView.set('content', test.content);
        mainHostSummaryView.set('installedServices', test.services);
        expect(mainHostSummaryView.get('addableComponents').mapProperty('componentName')).to.include.members(test.e);
        expect(test.e).to.include.members(mainHostSummaryView.get('addableComponents').mapProperty('componentName'));
      });
    });

  });



});
