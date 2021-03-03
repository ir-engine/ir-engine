import React from "react";
import PropTypes from "prop-types";
import Dialog from "./Dialog";
import ProgressBar from "../inputs/ProgressBar";
import styled from "styled-components";

/**
 * [ProgressContainer used as a wrapper element for the ProgressMessage and ProgressBar components]
 * @type {Styled component}
 */
const ProgressContainer = (styled as any).div`
  color: ${props => props.theme.text2};
  display: flex;
  flex: 1;
  flex-direction: column;
  /* This forces firefox to give the contents a proper height. */
  overflow: hidden;
  padding: 8px;
`;

/**
 * [ProgressMessage used to provide styles to the message content on ProgressDialog]
 * @type {styled component}
 */
const ProgressMessage = (styled as any).div`
  padding-bottom: 24px;
  white-space: pre;
`;

/**
 * [ProgressDialog component used to render view ]
 * @param       {string} message    [content to be shown on the ProgressDialog]
 * @param       {function} onConfirm
 * @param       {boolean} cancelable
 * @param       {function} onCancel
 * @param       {any} props
 * @constructor
 */
export function ProgressDialog({ message, onConfirm, cancelable, onCancel, ...props }) {
  return (
    <Dialog onCancel={cancelable ? onCancel : null} {...props}>
      <ProgressContainer>
        <ProgressMessage>{message}</ProgressMessage>
        <ProgressBar />
      </ProgressContainer>
    </Dialog>
  );
}

/**
 * [declairing propTypes for ProgressDialog]
 * @type {Object}
 */
ProgressDialog.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  cancelable: PropTypes.bool,
  cancelLabel: PropTypes.string,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func
};

/**
 * [initializing defaultProps for ProgressDialog]
 * @type {Object}
 */
ProgressDialog.defaultProps = {
  title: "Loading...",
  message: "Loading...",
  cancelable: false,
  cancelLabel: "Cancel"
};
