import React from 'react'
import HighlightOff from '@material-ui/icons/HighlightOff'

const CloseSnackbarComponent = ({ handleClose }) => {
  return <HighlightOff style={{ cursor: 'pointer' }} onClick={handleClose} />
}

export default CloseSnackbarComponent
