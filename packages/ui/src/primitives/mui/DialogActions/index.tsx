import React, { ReactNode } from 'react'

import { DialogActionsProps, DialogActions as MuiDialogActions } from '@mui/material'

import Button from '../Button'

const DialogActions = ({ children, ...props }: DialogActionsProps & {}) => (
  <MuiDialogActions {...props}>{children}</MuiDialogActions>
)

DialogActions.displayName = 'DialogActions'

DialogActions.defaultProps = {
  children: (
    <>
      <Button />
    </>
  )
}

export default DialogActions
