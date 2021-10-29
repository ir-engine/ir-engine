import React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
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
