import React, { ReactNode } from 'react'

import Button from '@etherealengine/ui/src/primitives/mui/Button'

import { DialogActionsProps, DialogActions as MuiDialogActions } from '@mui/material'

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
