import React, { ReactNode } from 'react'

import { DialogProps, Dialog as MuiDialog } from '@mui/material'

import DialogActions from '../DialogActions'
import DialogContent from '../DialogContent'
import DialogTitle from '../DialogTitle'

const Dialog = ({ children, classes, ...props }: DialogProps & { classes?: any }) => (
  <MuiDialog className={classes} {...props}>
    {children}
  </MuiDialog>
)

Dialog.displayName = 'Dialog'

Dialog.defaultProps = {
  open: true,
  children: (
    <>
      <DialogTitle />
      <DialogContent />
      <DialogActions />
    </>
  )
}

export default Dialog
