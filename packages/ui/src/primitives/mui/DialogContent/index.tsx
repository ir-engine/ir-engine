import React, { ReactNode } from 'react'

import DialogContentText from '@etherealengine/ui/src/primitives/mui/DialogContentText'
import TextField from '@etherealengine/ui/src/primitives/mui/TextField'

import { DialogContentProps, DialogContent as MuiDialogContent } from '@mui/material'

const DialogContent = ({ children, ...props }: DialogContentProps & {}) => (
  <MuiDialogContent {...props}>{children}</MuiDialogContent>
)

DialogContent.displayName = 'DialogContent'

DialogContent.defaultProps = {
  children: (
    <>
      <DialogContentText />
      <TextField />
    </>
  )
}

export default DialogContent
