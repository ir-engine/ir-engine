import React from 'react';
import classNames from 'classnames';
import Bindings from '../ECSYBindings';
import SystemQueries from './SystemQueries';
import SmoothieComponent, { TimeSeries } from './SmoothieChart';
import Events from '../utils/Events';
import { Button } from './StyledComponents';
import isEqual from 'react-fast-compare';
import ElementStats from './ElementStats';

import {
  FaStripeS,
  FaPlay,
  FaPause,
  FaFastForward,
  FaStepForward
 } from 'react-icons/fa';

import './Panel.css';

var percentColors = [
  { pct: 0.0, color: { r: 0x00, g: 0xff, b: 0 } },
  { pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
  { pct: 1.0, color: { r: 0xff, g: 0x00, b: 0 } }
];

var getColorForPercentage = function(pct) {
  for (var i = 1; i < percentColors.length - 1; i++) {
      if (pct < percentColors[i].pct) {
          break;
      }
  }
  var lower = percentColors[i - 1];
  var upper = percentColors[i];
  var range = upper.pct - lower.pct;
  var rangePct = (pct - lower.pct) / range;
  var pctLower = 1 - rangePct;
  var pctUpper = rangePct;
  var color = {
      r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
      g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
      b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
  };
  return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
}



export default class System extends React.Component {

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.props, nextProps) ||
            !isEqual(this.state, nextState);
  }

  constructor(props) {
    super(props);

    this.timeSeries = new TimeSeries({
      resetBounds: true,
      resetBoundsInterval: 3000
    });

    this.state = {
      solo: false
    };
  }

  togglePlay = () => {
    Bindings.toggleSystem(this.props.system);
    Events.emit('togglePlaySystem', this.props.system);
  }

  step = () => {
    Bindings.stepSystem(this.props.system);
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

  toggleSolo = () => {
    if (this.state.solo) {
      Events.emit('revertSoloPlaySystem', this.props.system);
    } else {
      Events.emit('soloPlaySystem', this.props.system);
      Bindings.soloPlaySystem(this.props.system);
    }

    this.setState({
      solo: !this.state.solo
    });
  }

  onEnter = () => {
    Events.emit('systemOver', [this.props.system]);
  }

  onLeave = () => {
    Events.emit('systemOver', []);
  }


  render() {
    const { showStats, color, highlighted, allSystemsStopped, system, nextSystemToExecute, showGraphs, overQueries, overComponents, overSystem } = this.props
    const percTime = this.props.totalSystemsTime > 0 ? system.executeTime / this.props.totalSystemsTime * 100 : 0;

    const running = allSystemsStopped && nextSystemToExecute === system.name;

    const classes = classNames({
      system: true,
      disabled: !system.enabled,
      running: running
    });

    const systemDataClasses = classNames({
      systemData: true,
      highlighted: highlighted
    });

    const borderLeft = {borderLeft: `5px solid ${color}`};

    this.timeSeries.append(new Date().getTime(), system.executeTime);

    let style = {
      color: getColorForPercentage(this.props.maxSystemTime > 0 ? system.executeTime / this.props.maxSystemTime: 0)
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
              <span className="name">{system.name}</span>
              <span className="stats">
                <span title="Current execution time">{system.executeTime.toFixed(2)}ms</span>&nbsp;
                <span title="" style={style}>{parseInt(percTime)}%</span>
              </span>
            </div>
            <div className="graph-controls">
            <div style={{width: "100%"}}>
            {
              showGraphs && <div style={{flex: 1}}><SmoothieComponent
              ref="chart"
              responsive
              grid={{
                fillStyle: 'transparent',
                strokeStyle: 'transparent'
              }}
              labels={{
                fillStyle: '#A9F0FF'
              }}
              millisPerPixel={60}
              height={30}
              series={[
                {
                  data: this.timeSeries,
                  strokeStyle: '#2CC8EB',
                  fillStyle: 'rgba(44, 200, 235, 0.1)',
                  lineWidth: 1,
                }
              ]}/></div>
            }
            {
              showStats && <ElementStats stats={system.stats}/>
            }
            </div>
              <div className="buttons">
              <Button
                  onClick={this.togglePlay}
                  title={system.enabled ? 'Pause system' : 'Play system'}>
                  {
                    system.enabled ? <FaPause></FaPause> : <FaPlay></FaPlay>
                  }
                </Button>

                <Button onClick={this.step} title="Step system execution">
                  <FaStepForward></FaStepForward>
                </Button>
                <Button className={(this.state.solo ? 'solo' : '')} onClick={this.toggleSolo} title="Execute only this system">
                  <FaStripeS/>
                </Button>
              </div>
            </div>
          </div>
          { this.props.showQueries &&
            <SystemQueries
              queries={system.queries}
              overSystem={overSystem}
              overQueries={overQueries}
              overComponents={overComponents}
            />
          }
        </div>
      </li>
    );
  }
}
