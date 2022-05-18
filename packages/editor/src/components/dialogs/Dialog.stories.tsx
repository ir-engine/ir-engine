import React from 'react'

import Dialog from './Dialog'

/**
 * declaring props used for Dialog component
 *
 * @author Robert Long
 */
export default {
  title: 'Dialog',
  component: Dialog
}

/**
 * dialog used to render dialog view.
 *
 * @author Robert Long
 */
export const dialog = () => <Dialog title="Hello Dialog">Hello World</Dialog>
