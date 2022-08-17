import React, { MouseEventHandler } from 'react'

import { isDev } from '@xrengine/common/src/utils/isDev'

import { Dialog, DialogContent, DialogTitle } from '@mui/material'
import Fade from '@mui/material/Fade'

import { Button } from '../inputs/Button'
import styles from './styles.module.scss'

interface Props {
  open: boolean
  isProjectMenu?: boolean
  onClose: (e: {}, reason: string) => void
  onConfirm: MouseEventHandler<HTMLButtonElement>
  onCancel: MouseEventHandler<HTMLButtonElement>
}

export const DeleteDialog = (props: Props): any => {
  const str =
    props.isProjectMenu && isDev
      ? `To prevent accidental loss of data, projects cannot be deleted from this menu in a local dev environment. Use the file system instead.`
      : `Are you sure`

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
        <Button
          disabled={props.isProjectMenu && isDev}
          className={styles.confirmBtn}
          onClick={props.onConfirm}
          autoFocus
        >
          Confirm
        </Button>
      </DialogContent>
    </Dialog>
  )
}
