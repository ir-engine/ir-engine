import React from 'react';
import './Panel.css';
import Component from './Component';
import SmoothieComponent, { TimeSeries } from './SmoothieChart';
import { ToggleButton, OptionsGroup, SectionHeader, Title, TitleGroup } from './StyledComponents';
import Checkbox from './Checkbox';
import isEqual from 'react-fast-compare';
import Events from '../utils/Events';

import {
  FaChartArea,
  FaPercentage,
  FaLink,
  FaChartLine,
 } from 'react-icons/fa';

export default class Components extends React.Component {
  toggleShowGraph = () => {
    Events.emit('toggleGraphs', {group: 'components'});
  }

  toggleShowStats = () => {
    Events.emit('toggleStats', {group: 'components', value: !this.state.showStats});
    this.setState({showStats: !this.state.showStats});
  }

  toggleShowPoolGraph = () => {
    this.setState({showPoolGraph: !this.state.showPoolGraph});
  }

  constructor(props) {
    super(props);

    Events.on('toggleAllStats', value => {
      this.setState({showStats: value});
    });

    this.timeSeries = new TimeSeries({
      resetBounds: true,
      resetBoundsInterval: 3000
    });

    this.state = {
      showStats: false,
      linkMinMax: false,
      chartRange: {
        min: 0,
        max: 0
      },
      showPoolGraph: false
    };

    this.references = {};
  }

  getOrCreateRef(id) {
    if (!this.references.hasOwnProperty(id)) {
        this.references[id] = React.createRef();
    }
    return this.references[id];
  }
/*
  linkMinMaxChanged = (e) => {
    this.setState({
      linkMinMax: e.target.checked,
      chartRange: {
        min: 0,
        max: 0
      }
    });
  }
*/

  toggleLinkMinMax = (e) => {
    this.setState({linkMinMax: !this.state.linkMinMax});
  }

  componentWillReceiveProps() {
    if (this.state.linkMinMax)
    {
      let timeSeries = [];
      Object.values(this.references).forEach(e => timeSeries = timeSeries.concat(e.current.timeSeries));

      let minMax = timeSeries.reduce((acum, current) => ({
        min: Math.min(acum.min, current.minValue),
        max: Math.max(acum.max, current.maxValue)
      }),
        {
          min: Number.MAX_VALUE,
          max: Number.MIN_VALUE
        }
      );

      this.setState({chartRange: minMax});
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.props, nextProps) ||
      !isEqual(this.state, nextState);
  }

  render() {
    const { showGraphs, showGraphsIndividuals, components, componentsPools, overQueries } = this.props;

    if (!components) {
      return (
        <span>No components</span>
      );
    }

    const numComponents = components ? Object.keys(components).length : 0;
    const numComponentInstances = components && Object.values(components).length > 0 ? Object.values(components).reduce((a, c) => a + c.count, 0) : undefined;

    let componentsHtml = Object.keys(components).map(name => {
      const highlighted = overQueries.find(e => e.components.included.indexOf(name) !== -1 ||
                          e.components.not.indexOf(name) !== -1)

      return <Component
        graphConfig={this.props.graphConfig.components}
        ref={this.getOrCreateRef(name)}
        showPoolGraph={this.state.showPoolGraph}
        linkMinMax={this.state.linkMinMax}
        key={name}
        name={name}
        componentData={components[name]}
        showGraphs={showGraphs /*showGraphsIndividuals[name] || false*/}
        showStats={this.state.showStats}
        chartRange={this.state.chartRange}
        highlighted={highlighted}
        pool={componentsPools[name]}
      />;
    });
    this.timeSeries.append(new Date().getTime(), numComponentInstances);

    return (
      <div>
        <SectionHeader>
          <TitleGroup>
            <Title>COMPONENTS ({numComponents})</Title> <Title>{numComponentInstances} instances</Title>
          </TitleGroup>
            <OptionsGroup>
              <ToggleButton
                onClick={this.toggleShowGraph}
                disabled={!showGraphs}
                title="Show charts">
                <FaChartArea/>
              </ToggleButton>
              {
                showGraphs &&
                <ToggleButton
                  onClick={this.toggleLinkMinMax}
                  disabled={!this.state.linkMinMax}
                  title="Link min/max graphs">
                  <FaLink/>
                </ToggleButton>
              }
              {
                showGraphs &&
                <ToggleButton
                  onClick={this.toggleShowPoolGraph}
                  disabled={!this.state.showPoolGraph}
                  title="Show pool graph">
                  <FaChartLine/>
                </ToggleButton>
              }
              <ToggleButton
                onClick={this.toggleShowStats}
                disabled={!this.state.showStats}
                title="Show stats (avg/min/max)">
                <FaPercentage/>
              </ToggleButton>
            </OptionsGroup>

          {
            showGraphs &&
            <SmoothieComponent
            responsive
            millisPerPixel={60}
            grid={{
              fillStyle: 'transparent',
              strokeStyle: 'transparent'
            }}
            labels={{
              fillStyle: '#FFD29C',
              precision: 0
            }}
            height={30}
            series={[
              {
                data: this.timeSeries,
                strokeStyle: '#EB932C',
                fillStyle: 'rgba(255, 210, 156, 0.05)',
                lineWidth: 1,
              }
            ]}/>
          }
        </SectionHeader>
        <ul>
          {componentsHtml}
        </ul>
      </div>
    );
  }
}
