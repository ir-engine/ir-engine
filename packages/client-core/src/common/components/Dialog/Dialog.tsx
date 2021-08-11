import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Typography from '@material-ui/core/Typography'
import { selectDialogState } from '../../reducers/dialog/selector'
import { closeDialog } from '../../reducers/dialog/service'
import { bindActionCreators, Dispatch } from 'redux'
import { useHistory } from 'react-router-dom'
import styles from './Dialog.module.scss'

interface Props {
  dialog: any
  closeDialog: typeof closeDialog
}

const mapStateToProps = (state: any): any => {
  return {
    dialog: selectDialogState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  closeDialog: bindActionCreators(closeDialog, dispatch)
})

const DialogComponent = (props: Props): any => {
  const { dialog, closeDialog } = props
  const isOpened = dialog.get('isOpened')
  const content = dialog.get('content')
  const history = useHistory()

  useEffect(() => {
    history.listen(() => {
      closeDialog()
    })
  }, [])

  const handleClose = (e: any): void => {
    e.preventDefault()
    closeDialog()
  }

  return (
    <Dialog open={isOpened} onClose={handleClose} aria-labelledby="xr-dialog" color="background">
      <DialogTitle disableTypography className={styles.dialogTitle}>
        <Typography variant="h6">{(content && content.title) ?? ''}</Typography>
        <IconButton aria-label="close" className={styles.dialogCloseButton} onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>{content && content.children}</DialogContent>
    </Dialog>
  )
}

const DialogWrapper = (props: any): any => <DialogComponent {...props} />

export const UIDialog = connect(mapStateToProps, mapDispatchToProps)(DialogWrapper)
