import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'

import CloseIcon from '@mui/icons-material/Close'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import { useDispatch } from '../../../store'
import { useDialogState } from '../../services/DialogService'
import { DialogAction } from '../../services/DialogService'
import styles from './Dialog.module.scss'

interface Props {
  dialog: any
}

const DialogComponent = (props: Props): any => {
  const dispatch = useDispatch()
  const dialog = useDialogState()
  const isOpened = dialog.isOpened
  const content = dialog.content
  const history = useHistory()

  useEffect(() => {
    history.listen(() => {
      dispatch(DialogAction.dialogClose())
    })
  }, [])

  const handleClose = (e: any): void => {
    e.preventDefault()
    dispatch(DialogAction.dialogClose())
  }

  return (
    <Dialog open={isOpened.value} onClose={handleClose} aria-labelledby="xr-dialog" color="background">
      <DialogTitle className={styles.dialogTitle}>
        <Typography variant="h6">{(content && content?.value?.title) ?? ''}</Typography>
        <IconButton aria-label="close" className={styles.dialogCloseButton} onClick={handleClose} size="large">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={styles.dialogContent}>{content && content?.value?.children}</DialogContent>
    </Dialog>
  )
}

const DialogWrapper = (props: any): any => <DialogComponent {...props} />
export const UIDialog = DialogWrapper
