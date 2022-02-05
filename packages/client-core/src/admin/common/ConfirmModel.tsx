import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import React from 'react'
import { useStyles } from '../styles/ui'

interface Props {
  popConfirmOpen: boolean
  handleCloseModel: () => void
  submit: () => void
  name: string
  label: string
  type?: string
}

const ConfirmModel = (props: Props) => {
  const classes = useStyles()
  const { popConfirmOpen, handleCloseModel, submit, name, label, type } = props
  return (
    <Dialog
      open={popConfirmOpen}
      onClose={handleCloseModel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      classes={{ paper: classes.paperDialog }}
    >
      <DialogTitle id="alert-dialog-title">
        Do you want to {type || 'delete'} {label} <b>{name}</b> ?
      </DialogTitle>
      <DialogActions>
        <Button onClick={handleCloseModel} className={classes.spanNone}>
          Cancel
        </Button>
        <Button className={classes.spanDange} onClick={submit} autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmModel
