import React, { ReactNode } from 'react'

import { DialogContentProps, DialogContent as MuiDialogContent } from '@mui/material'

import DialogContentText from '../DialogContentText'
import TextField from '../TextField'

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
