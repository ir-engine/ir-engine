import React, { MouseEventHandler } from 'react'
import Fade from '@mui/material/Fade'
import styles from './styles.module.scss'
import { Dialog, DialogTitle, DialogContent } from '@mui/material'
import { Button } from '../inputs/Button'
import { isDev } from '@xrengine/common/src/utils/isDev'

interface Props {
  open: boolean
  onClose: (e: {}, reason: string) => void
  onConfirm: MouseEventHandler<HTMLButtonElement>
  onCancel: MouseEventHandler<HTMLButtonElement>
}

const str = isDev
  ? `To prevent accidental loss of data, projects cannot be deleted from this menu in a local dev environment. Use the file system instead.`
  : `Are you Sure`

export const DeleteDialog = (props: Props): any => {
  return (
    <Dialog
      open={props.open}
      classes={{ paper: styles.deleteDialog }}
      onClose={props.onClose ?? props.onCancel}
      closeAfterTransition
      TransitionComponent={Fade}
      TransitionProps={{ in: props.open }}
    >
      <DialogTitle>{str}</DialogTitle>
      <DialogContent classes={{ root: styles.contentWrapper }}>
        <Button onClick={props.onCancel} className={styles.cancelBtn}>
          Cancel
        </Button>
        <Button disabled={isDev} className={styles.confirmBtn} onClick={props.onConfirm} autoFocus>
          Confirm
        </Button>
      </DialogContent>
    </Dialog>
  )
}
