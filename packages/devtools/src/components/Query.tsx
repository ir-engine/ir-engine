import React from 'react';
import classNames from 'classnames';
import SmoothieComponent, { TimeSeries } from './SmoothieChart';
import styled from 'styled-components';
import Events from '../utils/Events';
import Bindings from '../ECSYBindings';
import { Half, Half2, Button } from './StyledComponents';
import isEqual from 'react-fast-compare';
import ElementStats from './ElementStats';

import {
  FaArrowDown,
  FaBolt
 } from 'react-icons/fa';

export default class Query extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      hover: false
    }
    this.timeSeries = new TimeSeries({});
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.props, nextProps) ||
            !isEqual(this.state, nextState);
  }

  componentWillReceiveProps() {
    if (!this.props.showGraphs) { return; }

    let config = this.props.chartRange;
    if (this.props.linkMinMax) {
      this.refs.chart.smoothie.options.minValue = config.min;
      this.refs.chart.smoothie.options.maxValue = config.max;
    } else {
      delete this.refs.chart.smoothie.options.minValue
      delete this.refs.chart.smoothie.options.maxValue
    }
  }

  onEnter = () => {
    Events.emit('queryOver', [this.props.query]);
    this.setState({hover: true});
  }

  onLeave = () => {
    Events.emit('queryOver', []);
    this.setState({hover: false});
  }

  logQuery = () => {
    Bindings.logQuery(this.props.query);
  }

  render() {
    const { showStats, query, showGraphs, highlighted } = this.props;

    const components = query.components.included.map(name => (
      <span className="ComponentName" key={name}>{name}</span>
    )).concat(query.components.not.map(name => (
      <span className="ComponentName" key={name}>NOT {name}</span>
    )));

    this.timeSeries.append(new Date().getTime(), query.numEntities);

    const classes = classNames({
      query: true,
      highlighted: this.state.hover || highlighted
    });

    return (
      <li className={classes}
        onMouseEnter={this.onEnter}
        onMouseLeave={this.onLeave}>
        <Half2 title={'Query key: ' + query.key}>
          <span>
            {components}
            {
              query.reactive &&
              <FaBolt style={{color: '#27CEA5'}} title="Reactive query"/>
            }
          </span>
          <span className="value" title="Current value">{query.numEntities}</span>
        </Half2>
        <Half>
          <div style={{width: "100%"}}>
            {
              showGraphs && <SmoothieComponent
              ref="chart"
              responsive
              grid={ {
                fillStyle: 'transparent',
                strokeStyle: 'transparent'
              }}
              millisPerPixel={60}
              labels={ {
                fillStyle: '#BCFFEF',
                precision: 0
              }}
              height={30}
              series={[
                {
                  data: this.timeSeries,
                  strokeStyle: '#2CEBBD',
                  fillStyle: 'rgba(188, 255, 239, 0.05)',
                  lineWidth: 1,
                }
              ]}/>
            }
            {
              showStats && <ElementStats stats={query.stats} precision={0}/>
            }
          </div>
        </Half>
        <Button className="logbutton" onClick={this.logQuery} title="Log queries to the console">
          <FaArrowDown></FaArrowDown>
        </Button>
      </li>
    );
  }
}
