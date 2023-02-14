import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'

import { dispatchAction } from '@xrengine/hyperflux'
import Dialog from '@xrengine/ui/src/Dialog'
import DialogContent from '@xrengine/ui/src/DialogContent'
import DialogTitle from '@xrengine/ui/src/DialogTitle'
import Icon from '@xrengine/ui/src/Icon'
import IconButton from '@xrengine/ui/src/IconButton'
import Typography from '@xrengine/ui/src/Typography'

import { useDialogState } from '../../services/DialogService'
import { DialogAction } from '../../services/DialogService'
import styles from './index.module.scss'

const UIDialog = (): JSX.Element => {
  const dialog = useDialogState()
  const isOpened = dialog.isOpened
  const content = dialog.content
  const history = useHistory()

  useEffect(() => {
    history.listen(() => {
      dispatchAction(DialogAction.dialogClose({}))
    })
  }, [])

  const handleClose = (e: any): void => {
    e.preventDefault()
    dispatchAction(DialogAction.dialogClose({}))
  }

  return (
    <Dialog open={isOpened.value} onClose={handleClose} aria-labelledby="xr-dialog" color="background">
      <DialogTitle className={styles.dialogTitle}>
        <Typography variant="h6">{(content && content?.value?.title) ?? ''}</Typography>
        <IconButton aria-label="close" className={styles.dialogCloseButton} onClick={handleClose} size="large">
          <Icon type="Close" />
        </IconButton>
      </DialogTitle>
      <DialogContent className={styles.dialogContent}>{content && content?.value?.children}</DialogContent>
    </Dialog>
  )
}

export default UIDialog
