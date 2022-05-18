import React from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'

import styles from '../styles/admin.module.scss'

interface Props {
  handleClose: () => void
  open: boolean
  children: JSX.Element | JSX.Element[]
  text: string
  action: string
  submit: () => void
}

const CreateModal = (props: Props) => {
  const { open, handleClose, children, action, text, submit } = props
  const { t } = useTranslation()

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        classes={{ paper: styles.paperDialog }}
        fullWidth={true}
        maxWidth="sm"
      >
        <div style={{ padding: '20px' }}>
          <Typography variant="h5" gutterBottom={true} className={styles.mt30px}>
            {action} {t('admin:components.common.new')} {text}
          </Typography>
          {children}
          <DialogActions>
            <Button onClick={handleClose} className={styles.cancelButton}>
              {t('admin:components.common.cancel')}
            </Button>
            <Button className={styles.submitButton} autoFocus onClick={submit}>
              {action}
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    </React.Fragment>
  )
}

export default CreateModal
