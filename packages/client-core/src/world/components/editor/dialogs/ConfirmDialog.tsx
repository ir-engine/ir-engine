import React from 'react'
import PropTypes from 'prop-types'
import Dialog from './Dialog'

/**
 * Declairing props for ConfirmDialog component.
 *
 * @author Robert Long
 * @type {interface}
 */
interface Props {
  title?
  message?
  tag?
  onCancel?
  cancelLabel?
  onConfirm?
  confirmLabel?
  bottomNav?
}

/**
 * ConfirmDialog function component used to show dialog.
 *
 * @author Robert Long
 * @param       {interface} props
 * @constructor
 */
export function ConfirmDialog(props: Props) {
  const { message } = props
  return <Dialog {...props}>{message}</Dialog>
}

/**
 * propTypes for ConfirmDialog.
 *
 * @author Robert Long
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
}

/**
 * defaultProps for ConfirmDialog.
 *
 * @author Robert Long
 * @type {Object}
 */
ConfirmDialog.defaultProps = {
  title: 'Confirm',
  message: 'Confirm action?'
}
export default ConfirmDialog
