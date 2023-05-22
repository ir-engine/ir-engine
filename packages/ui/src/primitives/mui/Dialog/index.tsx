import React, { ReactNode } from 'react'

import DialogActions from '@etherealengine/ui/src/primitives/mui/DialogActions'
import DialogContent from '@etherealengine/ui/src/primitives/mui/DialogContent'
import DialogTitle from '@etherealengine/ui/src/primitives/mui/DialogTitle'

import { DialogProps, Dialog as MuiDialog } from '@mui/material'

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
