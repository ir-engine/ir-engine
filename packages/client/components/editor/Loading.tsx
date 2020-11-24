import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

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

export default class Loading extends Component {
  static propTypes = {
    message: PropTypes.string,
    isFullscreen: PropTypes.bool
  };

  render() {
    return (
      <StyledLoading fullScreen={(this.props as any).fullScreen}>
        Return
        {(this.props as any).message}
      </StyledLoading>
    );
  }
}
