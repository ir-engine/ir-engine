import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tab, TabBar, TabBarEmpty, TabClose, TabPlus } from './styled-elements';

function last(arr, pre = '') {
  let base = arr.length > 2 ? `${arr[arr.length - 2]}` : '';
  if (base.indexOf(`${pre}> `) !== 0)
    base = 'bash';
  return base.replace(`${pre}> `, '').split(' ')[0];
}

class Tabs extends Component<any, any> {
  static displayName = 'Tabs';

  static propTypes = {
    style: PropTypes.object, // eslint-disable-line
    active: PropTypes.string,
    setActiveTab: PropTypes.func,
    removeTab: PropTypes.func,
    createTab: PropTypes.func,
  };

  static contextTypes = {
    instances: PropTypes.array,
    maximise: PropTypes.bool,
  };

  static defaultProps = {
    style: {},
  };

  state = {
    showingPlus: false,
  };

  handleBarClick = (e) => {
    e.stopPropagation();
    this.props.createTab();
  };

  // Handle clicking a tab.
  handleTabClick = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.setActiveTab(id);
  };

  // Handle remove clicked,
  handleRemoveClick = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.removeTab(id);
    return false;
  };

  removePlus = () => {
    if (this.state.showingPlus)
      this.setState({ showingPlus: false });
  };

  showPlus = () => {
    if (!this.state.showingPlus)
      this.setState({ showingPlus: true });
  };

  render() {
    const { showingPlus } = this.state;
    const { style, active } = this.props;
    const tabs = this.context.instances.map(({ id, instance }, index) => {
      // const title = (instance && instance.state) ?
      //    last(instance.state.summary, instance.state.promptPrefix) : 'bash';
      const title = 'Tab' + (index + 1);
      return (
        <Tab
          key={id}
          active={active === id}
          onClick={e => this.handleTabClick(e, id)}
          onFocus={e => this.handleTabClick(e, id)}
          // title={title}
          tabIndex={0}
        >
          {this.context.instances.length > 1 && (
            <TabClose
              title="Close tab"
              onMouseDown={e => this.handleRemoveClick(e, id)}
            >
              x
            </TabClose>
          )}
          {title}
        </Tab>
      );
    });

    return (
      <TabBar
        style={{
          ...style,
          ...(this.context.maximise ? { maxWidth: '100%' } : {}),
        }}
      >
        {tabs}
        <TabBarEmpty
          onMouseEnter={this.showPlus}
          onMouseLeave={this.removePlus}
        >
          <TabPlus
            visible={showingPlus}
            onClick={this.handleBarClick}
          >+
          </TabPlus>
        </TabBarEmpty>
      </TabBar>
    );
  }
}

export default Tabs;
