import React from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import { useUserStyles, useUserStyle } from './styles'
interface Props {
  open: boolean
  handleClose: any
  createUserRoleAction?: any
}

const createUser = (props: Props) => {
  const { open, handleClose, createUserRoleAction } = props
  const classes = useUserStyles()
  const classx = useUserStyle()
  const [role, setRole] = React.useState('')

  const createUserRole = async () => {
    await createUserRoleAction({ role })
    handleClose()
    setRole('')
  }

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        classes={{ paper: classx.paperDialog }}
      >
        <DialogTitle id="form-dialog-title">Create new user role </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="role"
            label="User Role"
            type="text"
            fullWidth
            value={role}
            className={classes.marginBottm}
            onChange={(e) => setRole(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={createUserRole} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default createUser
