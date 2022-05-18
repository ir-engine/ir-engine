import React from 'react'
import HighlightOff from '@mui/icons-material/HighlightOff'

const CloseSnackbarComponent = ({ handleClose }) => {
  return <HighlightOff style={{ cursor: 'pointer' }} onClick={handleClose} />
}

export default CloseSnackbarComponent
