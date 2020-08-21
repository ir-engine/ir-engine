import React from 'react';
import './Panel.css';
import {OptionsGroup, ToggleButton, SectionContainer, SectionHeader, Title, TitleGroup } from './StyledComponents';
import Events from '../utils/Events';
import SmoothieComponent, { TimeSeries } from './SmoothieChart';
import isEqual from 'react-fast-compare';

import {
  FaPlay,
  FaPause,
  FaFastForward,
  FaStepForward,
  FaChartArea,
  FaChartBar,
  FaLink,
  FaBoxes,
  FaChartLine,
  FaChartPie
 } from 'react-icons/fa';

export default class Entities extends React.Component {
  constructor(props) {
    super(props);

    this.timeSeries = new TimeSeries({
      resetBounds: true,
      resetBoundsInterval: 3000
    });
  }

  toggleShowGraph = () => {
    Events.emit('toggleGraphs', {group: 'entities'});
  }

  updateGraph() {
    this.timeSeries.append(new Date().getTime(), this.props.numEntities);
  }

  shouldComponentUpdate(nextProps, nextState) {
    this.updateGraph();
    return !isEqual(this.props, nextProps) ||
      !isEqual(this.state, nextState);
  }

  render() {
    const { data, showGraphs } = this.props;
    const numEntities = data.numEntities;

    return (
      <SectionContainer>
        <SectionHeader>
          <TitleGroup>
            <Title>ENTITIES ({numEntities})</Title>
          </TitleGroup>
          <OptionsGroup>
            <ToggleButton
              onClick={this.toggleShowGraph}
              disabled={!showGraphs}
              title="Show charts">
              <FaChartArea/>
            </ToggleButton>
          </OptionsGroup>
          {
            showGraphs && <SmoothieComponent
            responsive
            grid={{
              strokeStyle: 'transparent',
              fillStyle: 'transparent'
            }}
            labels={{
              fillStyle: '#88ff88',
              precision: 0
            }}
            millisPerPixel={60}
            height={30}
            series={[
              {
                data: this.timeSeries,
                strokeStyle: { g: 255 },
                fillStyle: 'rgba(136, 255, 136, 0.06)',
                lineWidth: 1,
              }
            ]}/>
          }
        </SectionHeader>
      </SectionContainer>
    );
  }
}
