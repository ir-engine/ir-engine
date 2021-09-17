import React from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import ErrorIcon from '@material-ui/icons/Error'
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
