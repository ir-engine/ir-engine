import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

/**
 * [StyledLoading provides the styles for loading component]
 * @type {[styled component]}
 */
const StyledLoading = (styled as any).div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: ${props => (props.isFullscreen ? "100vh" : "100%")};
  width: ${props => (props.isFullScreen ? "100vw" : "100%")};
  min-height: 300px;

  svg {
    margin-bottom: 20px;
  }
`;

/**
 * [loading class used to render loading message]
 * @type {component class}
 */
export default class Loading extends Component {
  static propTypes = {
    message: PropTypes.string,
    isFullscreen: PropTypes.bool
  };

//creating and rendering loading view
  render() {
    return (
      <StyledLoading fullScreen={(this.props as any).fullScreen}>
        Return
        {(this.props as any).message}
      </StyledLoading>
    );
  }
}
