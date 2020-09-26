import React, { Component } from "react";
import PropTypes from "prop-types";
// import Link from "next/link";
import styled from "styled-components";
import { ThemeContext } from "./theme";

const StyledError = (styled as any).div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  color: ${props => props.theme.red};

  svg {
    margin-bottom: 20px;
  }
`;

export default class Error extends Component {
  static propTypes = {
    message: PropTypes.node
  };
  
  static contextType = ThemeContext

  render() {
    let theme = this.context
    return (
      <StyledError theme={theme}>
        <a href="/">
          Return
        </a>
        {(this.props as any).message}
      </StyledError>
    );
  }
}
