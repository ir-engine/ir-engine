import React from 'react'
import { Snackbar, SnackbarProps } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'

interface props {
  propsSnackbar?: SnackbarProps
  openSnackbar: {
    type: string
    open: boolean
  }
  handleCloseSnackbar: () => void
}

const MySnackbar = ({ propsSnackbar = {}, openSnackbar, handleCloseSnackbar }: props) => {
  const myAlerts = {
    succes: <Alert severity="success">Data saved successfully</Alert>,
    reject: <Alert severity="error">This name is already taken</Alert>
  }

  const defaultProps: SnackbarProps = {
    anchorOrigin: { vertical: 'top', horizontal: 'center' },
    open: openSnackbar.open,
    onClose: handleCloseSnackbar,
    autoHideDuration: 3000
  }

  return (
    <Snackbar {...defaultProps} {...propsSnackbar}>
      {myAlerts[openSnackbar.type]}
    </Snackbar>
  )
}

export default MySnackbar
