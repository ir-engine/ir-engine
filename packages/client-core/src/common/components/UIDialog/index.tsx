import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { dispatchAction } from '@etherealengine/hyperflux'
import Dialog from '@etherealengine/ui/src/Dialog'
import DialogContent from '@etherealengine/ui/src/DialogContent'
import DialogTitle from '@etherealengine/ui/src/DialogTitle'
import Icon from '@etherealengine/ui/src/Icon'
import IconButton from '@etherealengine/ui/src/IconButton'
import Typography from '@etherealengine/ui/src/Typography'

import { useDialogState } from '../../services/DialogService'
import { DialogAction } from '../../services/DialogService'
import styles from './index.module.scss'

const UIDialog = (): JSX.Element => {
  const dialog = useDialogState()
  const isOpened = dialog.isOpened
  const content = dialog.content
  const navigate = useNavigate()

  useEffect(() => {
    dispatchAction(DialogAction.dialogClose({}))
  }, [location, dispatchAction])

  const handleClose = (e: any): void => {
    e.preventDefault()
    dispatchAction(DialogAction.dialogClose({}))
  }

  return (
    <Dialog open={isOpened.value} onClose={handleClose} aria-labelledby="xr-dialog" color="background">
      <DialogTitle className={styles.dialogTitle}>
        <Typography variant="h6">{(content && content?.value?.title) ?? ''}</Typography>
        <IconButton
          aria-label="close"
          className={styles.dialogCloseButton}
          onClick={handleClose}
          size="large"
          icon={<Icon type="Close" />}
        />
      </DialogTitle>
      <DialogContent className={styles.dialogContent}>{content && content?.value?.children}</DialogContent>
    </Dialog>
  )
}

export default UIDialog
