import React, { Component } from 'react';

//if (process.env.NODE_ENV !== 'production')
{
  const {whyDidYouUpdate} = require('why-did-you-update');
//  whyDidYouUpdate(React);
}

import Components from './Components';
import Systems from './Systems';
import styled from 'styled-components';
import Bindings from '../ECSYBindings';
import Queries from './Queries';
import Entities from './Entities';
import Events from '../utils/Events';
import PerfStats from 'incremental-stats-lite';
import { ToggleButton, SectionHeader, TitleGroup, Title,
  ConsolePanel, Container, Container2, RemoteContainer, ConsoleInput, ConsoleLog, Columns, Column, Code } from './StyledComponents';
import {
  FaChartArea,
  FaCode,
  FaSpinner,
  FaTerminal,
  FaPercentage,
  FaProjectDiagram,
 } from 'react-icons/fa';

var globalBrowser =  typeof chrome !== 'undefined' ? chrome : typeof browser !== 'undefined' ? browser : null;

const DEFAULT_SETTINGS = {
  showDebug: false,
  showConsole: false,
  showComponents: true,
  showEntities: true,
  showQueries: true,
  showSystems: true,
  showGraphsStatus: {
    all: false,
    groups: {
      systems: false,
      components: false,
      queries: false,
      entities: false
    },
    individuals: {
      systems: {},
      components: {},
      queries: {},
      entities: {}
    }
  },
  showStats: false,
  showHighlight: true,
};

class App extends Component {

  loadSettingsFromStorage() {
    // @todo Use localstorage if running from web?
    if (globalBrowser.storage) {
      globalBrowser.storage.local.get(["settings"], (results) => {
        var settings = results.settings;
        settings = Object.assign({}, DEFAULT_SETTINGS, settings);
        this.setState({
            showDebug: settings.showDebug,
            showConsole: settings.showConsole,
            showComponents: settings.showComponents,
            showEntities: settings.showEntities,
            showQueries: settings.showQueries,
            showSystems: settings.showSystems,
            showGraphsStatus: settings.showGraphsStatus,
            showStats: settings.showStats,
            showHighlight: settings.showHighlight
        });
      });
    }
  }

  saveSettingsToStorage() {
    // @todo Use localstorage if running from web?
    if (globalBrowser.storage) {
      globalBrowser.storage.local.set({
        settings: {
          showDebug: this.state.showDebug,
          showConsole: this.state.showConsole,
          showComponents: this.state.showComponents,
          showEntities: this.state.showEntities,
          showQueries: this.state.showQueries,
          showSystems: this.state.showSystems,
          showGraphsStatus: this.state.showGraphsStatus,
          showStats: this.state.showStats,
          showHighlight: this.state.showHighlight
        }
      });
    }
  }

  constructor() {
    super();

    this.stats = {
      components: {},
      queries: {},
      systems: {}
    };

    this.commandsHistory = [];

    this.state = {
      remoteConnectionData: {
        remoteId: ''
      },
      remoteConnection: false,
      remoteConnectionMessage: '',
      ecsyVersion: '',
      worldExist: false,

      showDebug: false,
      showConsole: false,
      showComponents: true,
      showEntities: true,
      showQueries: true,
      showSystems: true,
      showStats: false,
      showHighlight: true,

      showGraphsStatus: {
        all: false,
        groups: {
          systems: false,
          components: false,
          queries: false,
          entities: false
        },
        individuals: {
          systems: {},
          components: {},
          queries: {},
          entities: {}
        }
      },
      overComponents: [],
      prevOverComponents: [],
      overQueries: [],
      prevOverQueries: [],
      overSystem: false,
      graphConfig: {
        components: {
          globalMin: Number.MAX_VALUE,
          globalMax: Number.MIN_VALUE
        },
        systems: {
          globalMin: Number.MAX_VALUE,
          globalMax: Number.MIN_VALUE
        },
        queries: {
          globalMin: Number.MAX_VALUE,
          globalMax: Number.MIN_VALUE
        },
      }
    };

    this.loadSettingsFromStorage();

    const urlParams = new URLSearchParams(window.location.search);
    this.commandsHistoryPos = 0;

    if (urlParams.has('remoteConnect')) {
      let remoteId = urlParams.get('remoteId');
      let remoteConnectionData = this.state.remoteConnectionData;
      remoteConnectionData.remoteId = remoteId;
      this.state.remoteConnectionData = remoteConnectionData;

      console.log('inject remote connect');
      var script = document.createElement('script');
      script.src = 'vendor/peer.min.js';

      var peer;

      script.onload = () => {
        window.__ECSY_REMOTE_DEVTOOLS = {};

        let connect = () => {
          peer = new Peer({
            host: 'peerjs.ecsy.io',
            secure: true,
            port: 443,
            config: {'iceServers': [
                { url: 'stun:stun.l.google.com:19302' },
                { url: 'stun:stun1.l.google.com:19302' },
                { url: 'stun:stun2.l.google.com:19302' },
                { url: 'stun:stun3.l.google.com:19302' },
                { url: 'stun:stun4.l.google.com:19302' }
              ]
            },
            debug: 3
          });

          peer.on('open', id => {
            // console.log('My peer ID is: ' + id);
          });

          // console.log('Trying to connect to remote peer', remoteId);
          var conn = peer.connect(remoteId, {serialization: "json"});

          window.__ECSY_REMOTE_DEVTOOLS.connection = conn;
          conn.on('error', err => {
            console.log('errrorrrr', err);
          });

          conn.on('close', () => {
            this.setState({
              remoteConnectionMessage: 'close. Trying to reconnect...',
              data: null
            });

            peer.destroy();     // destroy the link
            window.__ECSY_REMOTE_DEVTOOLS.connection = conn = null;
            peer = null;

            // periodically attempt to reconnect
            setTimeout(() => {
              connect()
            }, 5000);

          });

          conn.on('disconnected', () => {
            this.setState({remoteConnectionMessage: 'disconnected'});
          });

          conn.on('open', () => {
            // console.log('open!');
            this.setState({remoteConnection: true});

            var script = '';
            fetch( globalBrowser.extension.getURL( 'src/content/index.js' ) )
              .then(res => res.text())
              .then(res => {
                var source = '(function(){' + res + '})();';
                conn.send({type: 'init', script: source});
              });

            conn.on('data', msg => {
              // console.log('<<<<<<<<<<< data', msg);
              if (msg.method === 'refreshData') {
                this.processData(JSON.parse(msg.data));
              } else if (msg.method === 'console') {
                //console.log('DATA', msg);
                console[msg.type].apply(null, JSON.parse(msg.args));
              } else if (msg.method === 'evalReturn') {
                console.log('<', msg.value);
                this.refs.consoleLog.value += `< ${msg.value}\n`;
                this.refs.consoleLog.scrollTop = this.refs.consoleLog.scrollHeight;
              } else if (msg.method === 'error') {
                let error = JSON.parse(msg.error);
                // console.error('<', error.message);
                console.error('<', error.stack);
                this.refs.consoleLog.value += `< ${error.stack}\n`;
                this.refs.consoleLog.scrollTop = this.refs.consoleLog.scrollHeight;
              }

            });
          });
        }

        //let id = urlParams.get('remoteConnect')
        script.parentNode.removeChild(script);
        connect();
      }
      (document.head||document.documentElement).appendChild(script);
    }

    this.statsStatus = {
      systems: false,
      components: false,
      queries: false
    }

    Events.on('toggleStats', detail => {
      this.statsStatus[detail.group] = detail.value;
      this.setState({
        showStats: Object.values(this.statsStatus).reduce((a,c) => a && c)
      })
    });

    Events.on('toggleGraphs', detail => {
      if (detail.elementName) {
        this.toggleShowGraphOption(detail.group, detail.elementName, () => {
          /*
          let allValue = Object.values(this.state.showGraphsStatus.groups).reduce((a,c) => a && c);
          if (this.state.showGraphsStatus.all !== allValue) {
            this.setShowGraphOption("all", null, allValue);
          }*/
        });
      } else if (detail.group) {
        this.toggleShowGraphOption("group", detail.group, () => {
          let allValue = Object.values(this.state.showGraphsStatus.groups).reduce((a,c) => a && c);
          if (this.state.showGraphsStatus.all !== allValue) {
            this.setShowGraphOption("all", null, allValue);
          }
        });
      }
    });

    Events.on('componentOver', detail => {
      if (!this.state.showHighlight) return;

      this.setState({prevOverComponents: this.state.overComponents});
      this.setState({overComponents: detail});
    });

    Events.on('queryOver', detail => {
      if (!this.state.showHighlight) return;

      this.setState({prevOverQueries: this.state.overQueries});
      this.setState({overQueries: detail});
    });

    Events.on('systemOver', detail => {
      if (!this.state.showHighlight) return;

      if (detail.length > 0) {
        var system = detail[0];
        let overQueries = Object.keys(system.queries).map(querySystemName =>
          this.state.data.queries.find(q => q.key === system.queries[querySystemName].key)
        );
        this.setState({prevOverQueries: this.state.overQueries});
        this.setState({
          overQueries: overQueries,
          overSystem: true
        });
      } else {
        this.setState({prevOverQueries: this.state.overQueries});
        this.setState({
          overQueries: [],
          overSystem: false
        });
      }
    });

    if (globalBrowser && globalBrowser.devtools) {
      var backgroundPageConnection = globalBrowser.runtime.connect({
        name: "devtools"
      });

      backgroundPageConnection.postMessage({
        name: 'init',
        tabId: globalBrowser.devtools.inspectedWindow.tabId
      });

      backgroundPageConnection.onMessage.addListener(m => {
        if (m.method === 'refreshData') {
          this.processData(m.data);
        } else if (m.method === 'disabled') {
          this.setState({data: null});
        }
      });
    } else {
      window.addEventListener('refreshData', (evt) => {
        this.processData(evt.detail);
      });
    }
  }

  processData(data) {
    let graphConfig = this.state.graphConfig

    // Components
    var minMax = Object.values(data.components).reduce((a, c) =>
      ({
        min: Math.min(a.min, c),
        max: Math.max(a.max, c)
      }),
      {
        min: Number.MAX_VALUE,
        max: Number.MIN_VALUE
      }
    );

    graphConfig.components.globalMin = Math.min(graphConfig.components.globalMin, minMax.min);
    graphConfig.components.globalMax = Math.max(graphConfig.components.globalMax, minMax.max);

    // Systems
    let minMaxSystems = data.systems.reduce((acum, actual) => ({
      min: Math.min(acum.min, actual.executeTime),
      max: Math.max(acum.max, actual.executeTime)
    }),
    {
      min: Number.MAX_VALUE,
      max: Number.MIN_VALUE
    });

    graphConfig.systems.globalMin = Math.min(graphConfig.systems.globalMin, minMaxSystems.min);
    graphConfig.systems.globalMax = Math.max(graphConfig.systems.globalMax, minMaxSystems.max);

    // Queries
    let minMaxQueries = data.queries.reduce((acum, actual) => ({
      min: Math.min(acum.min, actual.numEntities),
      max: Math.max(acum.max, actual.numEntities)
    }),
    {
      min: Number.MAX_VALUE,
      max: Number.MIN_VALUE
    });

    graphConfig.queries.globalMin = Math.min(graphConfig.queries.globalMin, minMaxQueries.min);
    graphConfig.queries.globalMax = Math.max(graphConfig.queries.globalMax, minMaxQueries.max);

    // Compute prev system to be executed
    let lastExecutedIndex = data.systems.indexOf(data.systems.find(s => s.name === data.lastExecutedSystem));
    data.nextSystemToExecute = data.systems[(lastExecutedIndex + 1) % data.systems.length].name;

    // Stats
    /*
        this.stats = {
        components: {},
        queries: {},
        systems: {}
      };
    */

    // Update components' stats
    for (let name in data.components) {
      let component = data.components[name];
      if (!this.stats.components[name]) {
        this.stats.components[name] = new PerfStats();
      }

      this.stats.components[name].update(component.count);
      data.components[name].stats = {
        min: this.stats.components[name].min,
        max: this.stats.components[name].max,
        mean: this.stats.components[name].mean,
        standard_deviation: this.stats.components[name].standard_deviation
      }
    }

    // Queries
    data.queries.forEach(query => {
      const key = query.key;
      if (!this.stats.queries[key]) {
        this.stats.queries[key] = new PerfStats();
      }

      this.stats.queries[key].update(query.numEntities);
      query.stats = {
        min: this.stats.queries[key].min,
        max: this.stats.queries[key].max,
        mean: this.stats.queries[key].mean,
        standard_deviation: this.stats.queries[key].standard_deviation
      }
    });

    // Systems
    data.systems.forEach(system => {
      const name = system.name;
      if (!this.stats.systems[name]) {
        this.stats.systems[name] = new PerfStats();
      }

      this.stats.systems[name].update(system.executeTime);
      system.stats = {
        min: this.stats.systems[name].min,
        max: this.stats.systems[name].max,
        mean: this.stats.systems[name].mean,
        standard_deviation: this.stats.systems[name].standard_deviation
      }
    });

    // Overall systems
    let systemsExecuteTime = data.systems.reduce((acum, s) => acum + s.executeTime, 0);
    if (!data.allSystems) {
      data.allSystems = {}
    }
    if (!this.stats.allSystems) {
      this.stats.allSystems = new PerfStats();
    }

    this.stats.allSystems.update(systemsExecuteTime);
    data.allSystems.stats = {
      min: this.stats.allSystems.min,
      max: this.stats.allSystems.max,
      mean: this.stats.allSystems.mean,
      standard_deviation: this.stats.allSystems.standard_deviation
    };

    this.setState({
      data: data,
      ecsyVersion: data.ecsyVersion,
      graphConfig: graphConfig
    });
  }

  dumpData = e => {
    Bindings.logData(this.state.data);
  }

  toggleOption = key => {
    let option = {};
    option[key] = !this.state[key]
    this.setState(option, () => {
      this.saveSettingsToStorage();
    });
  }

  toggleShowDebug = () => {
    this.toggleOption("showDebug");
  }

  toggleShowConsole = () => {
    this.toggleOption("showConsole");
  }

  toggleHighlightRelationships = () => {
    this.toggleOption("showHighlight");
  }

  setShowGraphOption = (type, key, value, onDone) => {
    let status = this.state.showGraphsStatus;

    if (type === "all") {
      status.all = value;
    } else if (type === "group") {
      status.groups[key] = value;
    } else {
      // component, position, value
      status.individuals[type][key] = value;
    }

    this.setState({showGraphsStatus: status}, () => {
      if (onDone) onDone(value);
      this.saveSettingsToStorage();
    });
  }

  toggleShowGraphOption = (type, key, onDone) => {
    let status = this.state.showGraphsStatus;

    let value;
    if (type === "all") {
      value = status.all;
    } else if (type === "group") {
      value = status.groups[key];
    } else {
      value = status.individuals[type][key] || false;
    }

    this.setShowGraphOption(type, key, !value, onDone);
  }

  toggleShowGraph = () => {
    this.toggleShowGraphOption("all", null, value => {
      Object.keys(this.state.showGraphsStatus.groups).forEach(groupName => {
        this.setShowGraphOption("group", groupName, value);
      });
    });
  }

  toggleShowStats = () => {
    Events.emit('toggleAllStats', !this.state.showStats);
    this.toggleOption("showStats");
  }

  toggleComponents = () => {
    this.toggleOption("showComponents");
  }

  toggleEntities = () => {
    this.toggleOption("showEntities");
  }

  toggleQueries = () => {
    this.toggleOption("showQueries");
  }

  toggleSystems = () => {
    this.toggleOption("showSystems");
  }

  sendCommand = () => {
    let command = this.refs.remoteCommand.value;
    window.__ECSY_REMOTE_DEVTOOLS.connection.send({type: "executeScript", script: command, returnEval: true});
    this.commandsHistoryPos = this.commandsHistory.length;
    this.commandsHistory.push(command);

    console.log('>', command);
    this.refs.consoleLog.value += `> ${command}\n`;
    this.refs.consoleLog.scrollTop = this.refs.consoleLog.scrollHeight;
    this.refs.remoteCommand.value = '';
  }

  remoteConnect = () => {
    let remoteId = this.refs.remoteId.value;
    if (remoteId && remoteId.length === 6) {
      globalBrowser.tabs.create({
        "url": "/src/app/index.html?remoteConnect&remoteId=" + remoteId
      });
    }
  }

  onCommandKeyDown = evt => {
    // 38 up
    // 40 down
    if (evt.which === 13) {
      this.sendCommand();
    }

    if (evt.which === 38 || evt.which === 40) {
      this.refs.remoteCommand.value = this.commandsHistory[this.commandsHistoryPos];
      if (evt.which === 38 && this.commandsHistoryPos > 0) {
        this.commandsHistoryPos--;
      }

      if (evt.which === 40 && this.commandsHistoryPos < this.commandsHistory.length - 1) {
        this.commandsHistoryPos++;
      }
    }
  }

  render() {
    const data = this.state.data;
    const state = this.state;

    if (!data && this.state.remoteConnection) {
      return (
        <div style={{backgroundColor: '#AAA'}}>
        <h1>Remote connection done!</h1>
        <h2>{this.state.remoteConnectionMessage}</h2>
        </div>
      );
    }

    if (!data) {
      return (
        <Container2>
          <RemoteContainer>
            {
              this.state.remoteConnectionData.remoteId ?
                <span><FaSpinner className="icon-spin" style={{color: "#fff"}}></FaSpinner> Waiting to connect to remote ID: <b style={{color: "#fff"}}>{this.state.remoteConnectionData.remoteId}</b></span> :
                <span><b>ECSY</b> not detected, or using an incompatible version, on this page.</span>
            }
            <br/>
            <span>If you want to connect to a remote device, please enter its remote ID code:</span>
            <span style={{display: "flex", justifyContent: "center", marginTop: "1em"}}>
              <input ref="remoteId" placeholder="Remote connection ID"></input>
              <button onClick={this.remoteConnect}>CONNECT</button>
            </span>
          </RemoteContainer>
        </Container2>
      );
    }

    const showGraphsStatus = this.state.showGraphsStatus;

    return (
      <Container>
        <div id="header">
          <div style={{display: "flex"}}>
            <ToggleButton title="Show Entities Panel" onClick={this.toggleEntities} disabled={!state.showEntities}>E</ToggleButton>
            <ToggleButton title="Show Components Panel" onClick={this.toggleComponents} disabled={!state.showComponents}>C</ToggleButton>
            <ToggleButton title="Show Systems Panel" onClick={this.toggleSystems} disabled={!state.showSystems}>S</ToggleButton>
            <ToggleButton title="Show Queries Panel" onClick={this.toggleQueries} disabled={!state.showQueries}>Q</ToggleButton>
            <ToggleButton
              onClick={this.toggleHighlightRelationships}
              disabled={!this.state.showHighlight}
              title="Highlight relatinships">
              <FaProjectDiagram/>
            </ToggleButton>
            <ToggleButton
              onClick={this.toggleShowDebug}
              disabled={!this.state.showDebug}
              title="Show debug">
              <FaCode/>
            </ToggleButton>
            {
              this.state.remoteConnection &&
              <ToggleButton
                onClick={this.toggleShowConsole}
                disabled={!this.state.showConsole}
                title="Show remote console">
                <FaTerminal/>
              </ToggleButton>
            }
            <ToggleButton
              onClick={this.toggleShowGraph}
              disabled={!this.state.showGraphsStatus.all}
              title="Show charts">
              <FaChartArea/>
            </ToggleButton>
            <ToggleButton
              onClick={this.toggleShowStats}
              disabled={!this.state.showStats}
              title="Show stats">
              <FaPercentage/>
            </ToggleButton>
          </div>
          <div>
            {
              this.state.remoteConnection &&
              <span style={{marginRight: '10px'}}>
              remote connection (ID: <b>{this.state.remoteConnectionData.remoteId}</b>)
              </span>
            }
            ECSY v{this.state.ecsyVersion}
          </div>
        </div>
        {
          this.state.showDebug &&
          <Code>
            <button onClick={this.dumpData}>dump to console ($data)</button><br/>
            {JSON.stringify(data, null, 2)}
          </Code>
        }
        {
          this.state.remoteConnection && this.state.showConsole &&
          <SectionHeader style={{marginRight: '20px', marginBottom: '10px'}}>
            <TitleGroup>
              <Title>REMOTE CONSOLE</Title>
            </TitleGroup>
            <ConsolePanel>
              <ConsoleLog ref="consoleLog" rows="8" readOnly={true}></ConsoleLog>
              <ConsoleInput type="text" placeholder="Enter command to be evaluated on the remote session and press <Enter> to execute" ref="remoteCommand" onKeyDown={this.onCommandKeyDown}></ConsoleInput>
            </ConsolePanel>
          </SectionHeader>
        }
        <Columns>
          {
            (state.showEntities || state.showComponents) &&
            <Column>
              {
                state.showEntities &&
                <Entities
                  data={data}
                  numEntities={data.numEntities}
                  showGraphs={showGraphsStatus.groups.entities}
                />
              }
              {
                state.showComponents &&
                <Components
                  graphConfig={this.state.graphConfig}
                  components={data.components}
                  componentsPools={data.componentsPools}
                  overQueries={this.state.overQueries}
                  showGraphs={showGraphsStatus.groups.components}
                  showGraphsIndividuals={showGraphsStatus.individuals.components}
                />
              }
            </Column>
          }
          {
            state.showQueries &&
            <Column>
              <Queries
                graphConfig={this.state.graphConfig}
                queries={data.queries}
                overQueries={this.state.overQueries}
                prevOverQueries={this.state.prevOverQueries}
                overComponents={this.state.overComponents}
                prevOverComponents={this.state.prevOverComponents}
                showGraphs={showGraphsStatus.groups.queries}
              />
            </Column>
          }
          {
            state.showSystems &&
            <Column>
              <Systems
              systems={data.systems}
              nextSystemToExecute={data.nextSystemToExecute}
              deferredRemoval={data.deferredRemoval}
              data={data}
              showGraphs={showGraphsStatus.groups.systems}
              graphConfig={this.state.graphConfig}
              overQueries={this.state.overQueries}
              prevOverQueries={this.state.prevOverQueries}
              overSystem={this.state.overSystem}
              overComponents={this.state.overComponents}
              prevOverComponents={this.state.prevOverComponents}
              />
            </Column>
          }
        </Columns>
      </Container>
    );
  }
}

export default App;
