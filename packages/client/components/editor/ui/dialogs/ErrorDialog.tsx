import React, { Component } from "react";

import PropTypes from "prop-types";
import Dialog, { DialogContent } from "./Dialog";
import styled from "styled-components";

const ErrorDialogContainer = (styled as any)(Dialog)`
  max-width: 600px;

  ${DialogContent} {
    padding: 0;
  }
`;

const ErrorMessage = (styled as any).code`
  white-space: pre-wrap;
  overflow-wrap: break-word;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 16px;
  color: ${props => props.theme.red};
`;

export default class ErrorDialog extends Component {
  state = { eventId: null };

  componentDidMount() {
    if ((this.props as any).error) {
      this.setState({ ...(this.props as any).eventId ?? null });
    }
  }

  render() {
    const { error, message, onCancel, ...props } = this.props as any;
    return (
      <ErrorDialogContainer {...props}>
        <ErrorMessage>{message}</ErrorMessage>
      </ErrorDialogContainer>
    );
  }
}

