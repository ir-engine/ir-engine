import React from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

import styles from '../styles/admin.module.scss'
import LoadingView from './LoadingView'

interface Props {
  open: boolean
  description: string | JSX.Element
  processing?: boolean
  onClose: () => void
  onSubmit: () => void
}

const ConfirmDialog = ({ open, description, processing, onClose, onSubmit }: Props) => {
  const { t } = useTranslation()

  return (
    <Dialog open={open} PaperProps={{ className: styles.dialog }} maxWidth="sm" fullWidth onClose={onClose}>
      {!processing && <DialogTitle>Confirmation</DialogTitle>}

      <DialogContent>
        {!processing && <DialogContentText>{description}</DialogContentText>}
        {processing && (
          <LoadingView sx={{ height: 170 }} variant="body1" title={t('admin:components.project.processing')} />
        )}
      </DialogContent>

      {!processing && (
        <DialogActions>
          <Button className={styles.outlinedButton} onClick={onClose}>
            {t('admin:components.common.cancel')}
          </Button>
          <Button className={styles.gradientButton} autoFocus onClick={onSubmit}>
            {t('admin:components.common.confirm')}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  )
}

export default ConfirmDialog
