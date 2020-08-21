import React from 'react';
import classNames from 'classnames';
import Bindings from '../ECSYBindings';
import SystemQueries from './SystemQueries';
import SmoothieComponent, { TimeSeries } from './SmoothieChart';
import Events from '../utils/Events';
import { Queries, QueryKey, QueryNumEntities, ReactiveLists, ReactiveList, ToggleButton, Button } from './StyledComponents';
import isEqual from 'react-fast-compare';

import {
  FaStripeS,
  FaPlay,
  FaPause,
  FaFastForward,
  FaStepForward
 } from 'react-icons/fa';

import './Panel.css';

export default class DeferredRemovalStep extends React.Component {

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.props, nextProps) ||
            !isEqual(this.state, nextState);
  }

  constructor(props) {
    super(props);
  }

  togglePlay = () => {
    Bindings.toggleDeferredRemoval();
    //Bindings.toggleSystem(this.props.system);
    //Events.emit('togglePlaySystem', this.props.system);
  }

  step = () => {
    Bindings.stepDeferredRemoval();
  }

  onEnter = () => {
    //Events.emit('systemOver', [this.props.system]);
  }

  onLeave = () => {
   // Events.emit('systemOver', []);
  }

  render() {
    const { deferredData, highlighted, allSystemsStopped, nextSystemToExecute, showGraphs, overQueries, overComponents, overSystem } = this.props
    const percTime = this.props.totalSystemsTime > 0 ? system.executeTime / this.props.totalSystemsTime * 100 : 0;

    const running = allSystemsStopped && nextSystemToExecute === system.name;

    const classes = classNames({
      system: true,
      disabled: !deferredData.enabled,
      running: running
    });

    const systemDataClasses = classNames({
      systemData: true,
      highlighted: highlighted
    });

    const borderLeft = {
      borderLeft: `5px solid #b2164d`,
      backgroundColor: '#161616'
    };

    return (
      <li
        onMouseEnter={this.onEnter}
        onMouseLeave={this.onLeave}
      >
        <div className={classes}>
          <div className={systemDataClasses} style={borderLeft}>
            {
              running && <div className="arrow"></div>
            }
            <div className="name-stats">
              <span className="name" style={{color: '#b2164d'}}>DEFERRED REMOVAL</span>
              <span className="stats">
                <span>{deferredData.executeTime.toFixed(2)}ms</span>&nbsp;
                <span></span>
              </span>
            </div>
            <div className="graph-controls">
              <div className="buttons" style={{marginRight: '10px'}}>
              <Button
                  onClick={this.togglePlay}
                  title={deferredData.enabled ? 'Pause system' : 'Play system'}>
                  {
                    deferredData.enabled ? <FaPause></FaPause> : <FaPlay></FaPlay>
                  }
                </Button>

                <Button onClick={this.step} title="Step system execution">
                  <FaStepForward></FaStepForward>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Queries style={{backgroundColor: '#1c1c1c'}}>
          <span className="queriesTitle" style={{color: '#B5B5B5'}}>REMOVAL QUEUES</span>
          <ul className="SystemsQueries">
              <li>
                <ReactiveLists className="deferredRemoval" style={{paddingRight: '6px'}}>
                  <ReactiveList>
                    <span>Entities to remove:</span>
                    <span>{deferredData.entitiesToRemove}</span>
                  </ReactiveList>
                  <ReactiveList>
                    <span>Entities with components to remove:</span>
                    <span>{deferredData.entitiesWithComponentsToRemove}</span>
                  </ReactiveList>
                  <ReactiveList>
                    <span>Total components to remove:</span>
                    <span>{deferredData.totalComponentsToRemove}</span>
                  </ReactiveList>
                </ReactiveLists>
              </li>
          </ul>
        </Queries>
      </li>
    );
  }
}
