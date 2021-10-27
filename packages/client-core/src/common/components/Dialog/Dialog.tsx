import React, { useEffect } from 'react'
import { useDispatch } from '../../../store'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Typography from '@material-ui/core/Typography'
import { useDialogState } from '../../state/DialogService'
import { DialogAction } from '../../state/DialogService'
import { useHistory } from 'react-router-dom'
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
      dispatch(DialogAction.dialogClose)
    })
  }, [])

  const handleClose = (e: any): void => {
    e.preventDefault()
    dispatch(DialogAction.dialogClose())
  }

  return (
    <Dialog open={isOpened.value} onClose={handleClose} aria-labelledby="xr-dialog" color="background">
      <DialogTitle disableTypography className={styles.dialogTitle}>
        <Typography variant="h6">{(content && content?.value?.title) ?? ''}</Typography>
        <IconButton aria-label="close" className={styles.dialogCloseButton} onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={styles.dialogContent}>{content && content?.value?.children}</DialogContent>
    </Dialog>
  )
}

const DialogWrapper = (props: any): any => <DialogComponent {...props} />
export const UIDialog = DialogWrapper
