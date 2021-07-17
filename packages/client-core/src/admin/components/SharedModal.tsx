import React from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogTitle from '@material-ui/core/DialogTitle'
interface Props {
  children?: any
  open: boolean
  TransitionComponent?: any
  onClose?: any
  title?: string
}

const SharedModal = (props: Props) => {
  const { children, open, TransitionComponent, onClose, title } = props
  return (
    <Dialog
      open={open}
      TransitionComponent={TransitionComponent}
      keepMounted
      onClose={onClose}
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
    >
      {title && <DialogTitle id="alert-dialog-slide-title">{title}</DialogTitle>}
      {children}
      <DialogActions>
        <Button variant="outlined" onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SharedModal
