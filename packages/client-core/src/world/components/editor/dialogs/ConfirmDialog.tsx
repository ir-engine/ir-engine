import React from "react";
import PropTypes from "prop-types";
import Dialog from "./Dialog";


/**
 * [declairing props for ConfirmDialog component]
 * @type {interface}
 */
interface Props {
  title?;
  message?;
  tag?;
  onCancel?;
  cancelLabel?;
  onConfirm?;
  confirmLabel?;
  bottomNav?;
}

/**
 * [ConfirmDialog function component used to show dialog]
 * @param       {} props [description]
 * @constructor
 */
export default function ConfirmDialog(props: Props) {
  const { message } = props;
  return <Dialog {...props}>{message}</Dialog>;
}

/**
 * [propTypes for ConfirmDialog]
 * @type {Object}
 */
ConfirmDialog.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  tag: PropTypes.string,
  onCancel: PropTypes.func,
  cancelLabel: PropTypes.string,
  onConfirm: PropTypes.func,
  confirmLabel: PropTypes.string,
  bottomNav: PropTypes.node
};

/**
 * [defaultProps for ConfirmDialog]
 * @type {Object}
 */
ConfirmDialog.defaultProps = {
  title: "Confirm",
  message: "Confirm action?"
};
