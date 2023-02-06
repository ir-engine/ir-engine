import React, { ReactNode } from 'react'

import { ModalProps, Modal as MuiModal } from '@mui/material'

const Modal = (props: ModalProps) => <MuiModal {...props} />

Modal.displayName = 'Modal'

Modal.defaultProps = {
  children: <div>Hello</div>,
  open: true
}

export default Modal
