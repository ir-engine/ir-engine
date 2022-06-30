import React from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'

import styles from '../styles/admin.module.scss'

interface Props {
  open: boolean
  children: JSX.Element | JSX.Element[]
  text: string
  action: string
  onSubmit: () => void
  onClose: () => void
}

const CreateModal = ({ open, children, action, text, onSubmit, onClose }: Props) => {
  const { t } = useTranslation()

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      classes={{ paper: styles.paperDialog }}
      fullWidth={true}
      maxWidth="sm"
    >
      <Typography variant="h5" gutterBottom={true} className={styles.mt30px}>
        {action} {t('admin:components.common.new')} {text}
      </Typography>
      {children}
      <DialogActions>
        <Button onClick={onClose} className={styles.cancelButton}>
          {t('admin:components.common.cancel')}
        </Button>
        <Button className={styles.submitButton} autoFocus onClick={onSubmit}>
          {action}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateModal
