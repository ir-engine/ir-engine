import React from 'react';
import styled from 'styled-components';
import {
  FaArrowDown,
  FaArrowUp,
  FaCaretDown,
  FaCaretUp
 } from 'react-icons/fa';

const Mylist = styled.div`
 display:flex;
 width: 100%;
 justify-content: space-evenly;
 color: #AAA !important;

 & > span {
   margin-right: 2px;
 }
`;

export default class ElementStats extends React.Component {
  static defaultProps = {
    precision: 2
  }

  constructor(props) {
    super(props);
  }

  render() {
    const { stats, precision } = this.props;

    return (
      <Mylist>
        <span title="Average value"><span style={{color: "#444"}}>~</span> {stats.mean.toFixed(precision)}</span>
        <span title="Standard deviation"><span style={{color: "#444"}}>σ</span> {stats.standard_deviation.toFixed(precision)}</span>
        <span title="Minimum value"><FaCaretDown style={{color: "#444"}}/>{stats.min.toFixed(precision)}</span>
        <span title="Maximum value"><FaCaretUp style={{color: "#444"}}/>{stats.max.toFixed(precision)}</span>
      </Mylist>
    );
  }
}