import React from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@etherealengine/client-core/src/common/components/Button'
import LoadingView from '@etherealengine/client-core/src/common/components/LoadingView'
import Dialog from '@etherealengine/ui/src/primitives/mui/Dialog'
import DialogActions from '@etherealengine/ui/src/primitives/mui/DialogActions'
import DialogContent from '@etherealengine/ui/src/primitives/mui/DialogContent'
import DialogContentText from '@etherealengine/ui/src/primitives/mui/DialogContentText'
import DialogTitle from '@etherealengine/ui/src/primitives/mui/DialogTitle'

import styles from './index.module.scss'

interface Props {
  open: boolean
  description: React.ReactNode
  processing?: boolean
  submitButtonText?: string
  closeButtonText?: string
  onClose: () => void
  onSubmit: () => void
}

const ConfirmDialog = ({
  open,
  closeButtonText,
  description,
  processing,
  submitButtonText,
  onClose,
  onSubmit
}: Props) => {
  const { t } = useTranslation()

  return (
    <Dialog open={open} PaperProps={{ className: styles.dialog }} maxWidth="sm" fullWidth onClose={onClose}>
      {!processing && <DialogTitle>Confirmation</DialogTitle>}

      <DialogContent>
        {!processing && <DialogContentText>{description}</DialogContentText>}
        {processing && <LoadingView sx={{ height: 170 }} variant="body1" title={t('common:components.processing')} />}
      </DialogContent>

      {!processing && (
        <DialogActions className={styles.dialogActions}>
          <Button fullWidth type="outlined" onClick={onClose}>
            {closeButtonText ?? t('common:components.cancel')}
          </Button>
          <Button fullWidth type="gradient" autoFocus onClick={onSubmit}>
            {submitButtonText ?? t('common:components.confirm')}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  )
}

export default ConfirmDialog
