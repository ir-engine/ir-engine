import React, { ReactNode } from 'react'

import { DialogContentTextProps, DialogContentText as MuiDialogContentText } from '@mui/material'

const DialogContentText = ({ children, ...props }: DialogContentTextProps & {}) => (
  <MuiDialogContentText {...props}>{children}</MuiDialogContentText>
)

DialogContentText.displayName = 'DialogContentText'

DialogContentText.defaultProps = {
  children: 'I am DialogContentText'
}

export default DialogContentText
