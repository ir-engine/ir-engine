import React from "react";
import PropTypes from "prop-types";
import Dialog from "./Dialog";

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

export default function ConfirmDialog(props: Props) {
  const { message } = props;
  return <Dialog {...props}>{message}</Dialog>;
}

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

ConfirmDialog.defaultProps = {
  title: "Confirm",
  message: "Confirm action?"
};
