import React from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'

import { useStyles } from '../styles/ui'

interface Props {
  handleClose: () => void
  open: boolean
  children: any
  text: string
  action: string
  submit: () => void
}

const CreateModel = (props: Props) => {
  const { open, handleClose, children, action, text, submit } = props
  const classes = useStyles()

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        classes={{ paper: classes.paperDialog }}
        fullWidth={true}
        maxWidth="sm"
      >
        <div style={{ padding: '20px' }}>
          <Typography variant="h5" gutterBottom={true} className={classes.marginTop}>
            {action} new {text}
          </Typography>
          {children}
          <DialogActions>
            <Button onClick={handleClose} className={classes.spanNone}>
              Cancel
            </Button>
            <Button className={classes.spanDange} autoFocus onClick={submit}>
              {action}
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    </React.Fragment>
  )
}

export default CreateModel
