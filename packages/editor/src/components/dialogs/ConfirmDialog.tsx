import React from 'react'
import Dialog from './Dialog'

/**
 * Declaring props for ConfirmDialog component.
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
ConfirmDialog.defaultProps = {
  title: 'Confirm',
  message: 'Confirm action?'
}
export default ConfirmDialog
