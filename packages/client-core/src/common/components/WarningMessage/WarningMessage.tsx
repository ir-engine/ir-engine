import React from 'react'

import InfoIcon from '@mui/icons-material/Info'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import MuiDialogActions from '@mui/material/DialogActions'
import MuiDialogContent from '@mui/material/DialogContent'
import MuiDialogTitle from '@mui/material/DialogTitle'

import styles from '../index.module.scss'
import { BrowserMessages } from './BrowserMessages'

const WarningMessage = ({ setIsHardwareAccelerationEnabled }) => {
  const browser = {
    isFirefox: navigator.userAgent.indexOf('Firefox') != -1,
    isChrome: navigator.userAgent.indexOf('Chrome') != -1
  }

  return (
    <div>
      <Dialog aria-labelledby="customized-dialog-title" classes={{ paper: styles.container }} open={true}>
        <MuiDialogTitle id="customized-dialog-title" className={styles.title}>
          Enable hardware acceleration for better experience! <InfoIcon style={{ height: '20px', width: '20px' }} />
        </MuiDialogTitle>
        <MuiDialogContent dividers>{BrowserMessages({ styles, browser }).filter(Boolean)[0].message}</MuiDialogContent>
        <MuiDialogActions>
          <Button onClick={() => setIsHardwareAccelerationEnabled(true)} color="primary">
            Continue Anyway
          </Button>
        </MuiDialogActions>
      </Dialog>
    </div>
  )
}
export default WarningMessage
