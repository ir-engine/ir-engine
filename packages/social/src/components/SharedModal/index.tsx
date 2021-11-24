import React from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
interface Props {
  children?: any
  open: boolean
  TransitionComponent?: any
  onClose?: any
  title?: string
  className?: string
}

import { TransitionProps } from '@mui/material/transitions'
import Slide from '@mui/material/Slide'

const Transition = React.forwardRef(
  (props: TransitionProps & { children?: React.ReactElement<any, any> }, ref: React.Ref<unknown>) => {
    return <Slide direction="up" ref={ref} {...props} />
  }
)

const SharedModal = (props: Props) => {
  const { children, open, onClose, title, className } = props
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      className={className}
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
    >
      {/* <DialogActions>
                  <Button  variant="outlined" onClick={onClose} color="primary">
                      Close
                  </Button>                        
              </DialogActions> */}
      {title && <DialogTitle id="alert-dialog-slide-title">{title}</DialogTitle>}
      {children}
    </Dialog>
  )
}

export default SharedModal
