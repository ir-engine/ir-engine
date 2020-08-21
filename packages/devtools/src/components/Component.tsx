import React from 'react';
import './Panel.css';
import classNames from 'classnames';
import SmoothieComponent, { TimeSeries } from './SmoothieChart';
import Events from '../utils/Events';
import Bindings from '../ECSYBindings';
import styled from 'styled-components';
import isEqual from 'react-fast-compare';
import ElementStats from './ElementStats';

import { Half, Half2, Button } from './StyledComponents';

import {
  FaPaperclip,
  FaExclamationTriangle,
  FaArrowDown,
  FaChartArea,
  FaPercentage,
  FaArrowUp,
  FaTag,
  FaEyeSlash
 } from 'react-icons/fa';

const Toolbar = styled.div`
  background-color: #333;
  position: absolute;
  height: 100%;
  right: 0px;
  display: flex;
`;

const WarningIcon = styled.span`
  color: #F1421C;
  font-size: 1.2em;
  margin-left: 0.5em;
`;

const PoolIncreased = styled.span`
  color: #F1421C;
`;

const Warn = styled.span`
  color: #EB932C;
  margin-left: 0.5em;
  vertical-align: middle;
`;

export default class Component extends React.Component {
  timeSeries: any[];
  constructor(props) {
    super(props);

    this.timeSeries = [
      new TimeSeries({
        resetBounds: true,
        resetBoundsInterval: 300
      }),
      new TimeSeries({})
    ];

    this.state = {
      id: 0
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState);
  }

  onToggleGraph = () => {
    Events.emit('toggleGraphs', {
      group: "components",
      elementName: this.props.name
    });
    this.setState({id: this.state.id + 1});
  }

  onEnter = () => {
    Events.emit('componentOver', [this.props.name]);
  }

  onLeave = () => {
    Events.emit('componentOver', []);
  }

  logComponent = () => {
    Bindings.logComponent(this.props.name);
  }

  componentWillReceiveProps() {
    const props = this.props as any
    const refs = this.refs as any

    if (props.showGraphs) {
      let config = props.chartRange;
      if (props.linkMinMax) {
        refs.chart.smoothie.options.minValue = config.min;
        refs.chart.smoothie.options.maxValue = config.max;
      } else {
        delete refs.chart.smoothie.options.minValue
        delete refs.chart.smoothie.options.maxValue
      }

      refs.chart.smoothie.seriesSet[1].options.strokeStyle = props.showPoolGraph ? '#F1421C' : 'none';
    }
  }

  render() {
    const { showStats, pool, componentData, name, highlighted, linkMinMax, graphConfig, showGraphs } = this.props as any;

    const classes = classNames({
      component: true,
      highlighted: highlighted
    });

    const value = componentData.count;

    const notPool = pool && pool.valid !== true;
    const poolSize = pool ? pool.size : 0;

    this.timeSeries[0].append(new Date().getTime(), value);
    this.timeSeries[1].append(new Date().getTime(), poolSize);

    const classesPoolIncreased = classNames({
      poolIncreased: true,
      hide: !pool || !pool.increased
    });

    let opts = linkMinMax ? {minValue: graphConfig.globalMin, maxValue: graphConfig.globalMax} : {};

    return (
      <li className={classes}
        onMouseEnter={this.onEnter}
        onMouseLeave={this.onLeave}
      >
        <Half2>
          <span className="name">{name} {
            notPool &&
            (
              <Warn>
                <FaExclamationTriangle title="This component is not using automatic pooling"/>
              </Warn>
            )
          }
          {
            (componentData.type === 'tag') &&
            <FaTag style={{marginLeft: '0.5em'}} title="Tag component"/>
          }
          {
            (componentData.type === 'systemstate') &&
            <FaPaperclip style={{marginLeft: '0.5em'}} title="System state component"/>
          }
            <span className={classesPoolIncreased}> Pool <FaArrowUp/></span>
          </span>
          <span className="value" title="Actual number of instances of this component">{value}</span>
        </Half2>
        <Half>
          <div style={{width: "100%"}}>
          {
            showGraphs && <SmoothieComponent
            ref="chart"
            responsive
            {...opts}
            grid={{
              fillStyle: 'transparent',
              strokeStyle: 'transparent'
            }}
            labels={{
              fillStyle: '#FFD29C',
              precision: 0
            }}
            millisPerPixel={60}
            height={30}
            series={[
              {
                data: this.timeSeries[0],
                strokeStyle: '#EB932C',
                fillStyle: 'rgba(235, 147, 44, 0.08)',
                lineWidth: 1
              },
              {
                data: this.timeSeries[1],
                strokeStyle: '#F1421C',
                lineWidth: 1
              }
            ]}
            />
          }
          {
            showStats && <ElementStats stats={componentData.stats} precision={0}/>
          }
          </div>
        </Half>
        <Button onClick={this.logComponent} title="Log components to the console">
          <FaArrowDown></FaArrowDown>
        </Button>
        <Toolbar style={{display: "none"}}>
          <Button onClick={this.logComponent} title="Log components to the console">
            <FaArrowDown></FaArrowDown>
          </Button>
          <Button onClick={this.onToggleGraph} title="Toggle graph">
            <FaChartArea></FaChartArea>
          </Button>
          <Button onClick={this.logComponent} title="Log components to the console">
            <FaPercentage></FaPercentage>
          </Button>
          <Button onClick={this.logComponent} title="Log components to the console">
            <FaEyeSlash></FaEyeSlash>
          </Button>
        </Toolbar>
      </li>
    );
  }
}
