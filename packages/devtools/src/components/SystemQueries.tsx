import React from 'react';
import classNames from 'classnames';
import isEqual from 'react-fast-compare';
import { Queries, QueryKey, QueryNumEntities, ReactiveLists, ReactiveList, ToggleButton } from './StyledComponents';
import Events from '../utils/Events';

import {
  FaBolt,
  FaExclamation,
 } from 'react-icons/fa';

export default class SystemQueries extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      hover: false,
      showReactive: false
    }
  }

  onEnter = query => {
    Events.emit('queryOver', [query]);
    this.setState({hover: true});
  }

  onLeave = query => {
    Events.emit('queryOver', []);
    this.setState({hover: false});
  }

  toggleShowReactive = e => {
    this.setState({showReactive: !this.state.showReactive});
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.props, nextProps) ||
            !isEqual(this.state, nextState);
  }

  render() {
    const { queries, overSystem, overComponents, overQueries } = this.props;

    let queriesHtml = Object.keys(queries).map(queryName => {
      let query = queries[queryName];
      let key = query.key;
      const components = query.components.included.map(name => (
        <span key={name} className="ComponentName">{name}</span>
      ));

      const classes = classNames({
        systemQueryLi: true,
        highlighted: !overSystem && (
          this.hover ||
          overQueries.filter(q => q.key === key).length > 0
          ||
          query.components.included.find(c => overComponents.indexOf(c) !== -1)
        )
      });

      const onEnter = () => {
        this.onEnter(query);
      }

      return (
        <li
          className={classes}
          key={queryName}
          onMouseEnter={onEnter}
          onMouseLeave={this.onLeave}>
          <div style={{display: "flex", justifyContent: "space-between"}}>
            <div>
              {
                components
              }
              {
                query.mandatory &&
                  <FaExclamation style={{fontSize: "1.2em", color: "#27CEA5"}} title="Mandatory query: It should have at least one element to execute"/>
              }
              {
                query.reactive &&
                <ToggleButton
                  onClick={this.toggleShowReactive}
                  disabled={!this.state.showReactive}
                  title="Show reactive lists">
                  <FaBolt/>
                </ToggleButton>
              }
            </div>
            <QueryNumEntities>{query.numEntities}</QueryNumEntities>
          </div>
            {
              query.listen && this.state.showReactive &&
                <ReactiveLists>
                  { query.listen.added && <ReactiveList><span>added:</span> <span>{query.listen.added.entities}</span></ReactiveList> }
                  { query.listen.removed && <ReactiveList><span>removed:</span> <span>{query.listen.removed.entities}</span></ReactiveList> }
                  { query.listen.changed && <ReactiveList><span>changed:</span> <span>{query.listen.changed.entities}</span></ReactiveList> }
                </ReactiveLists>
            }
        </li>
      );
    });

    return (
      <Queries>
        <span className="queriesTitle">QUERIES</span>
        <ul className="SystemsQueries">{queriesHtml}</ul>
      </Queries>
    );
  }
}
