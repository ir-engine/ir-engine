import React from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'

import { useStyle, useStyles } from './styles'

const FormDialog = () => {
  const classes = useStyles()
  const classex = useStyle()
  const [open, setOpen] = React.useState(true)
  const handleClose = () => {
    setOpen(false)
  }

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        classes={{ paper: classes.paperDialog }}
      >
        <DialogTitle id="form-dialog-title"> No access</DialogTitle>
        <DialogContent>
          <DialogContentText className={classex.spanNone}>
            To access this resource, please enter your username here to ask for access.
          </DialogContentText>
          <TextField autoFocus id="name" label="Username" type="text" fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} className={classex.spanNone}>
            Cancel
          </Button>
          <Button onClick={handleClose} className={classex.spanDange}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default FormDialog
