/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Dialog, DialogContent, DialogTitle } from '@mui/material'
import Fade from '@mui/material/Fade'
import React, { MouseEventHandler } from 'react'
import { useTranslation } from 'react-i18next'

import { isDev } from '@ir-engine/common/src/config'

import { Button } from '../inputs/Button'
import styles from './styles.module.scss'

interface Props {
  open: boolean
  isProjectMenu?: boolean
  onClose: (e: any, reason: string) => void
  onConfirm: MouseEventHandler<HTMLButtonElement>
  onCancel: MouseEventHandler<HTMLButtonElement>
}

export const DeleteDialog = (props: Props): any => {
  const { t } = useTranslation()

  const dialogTitle =
    props.isProjectMenu && isDev ? t('editor:dialog.delete.not-allowed-local-dev') : t('editor:dialog.sure-confirm')

  return (
    <Dialog
      open={props.open}
      classes={{ paper: styles.deleteDialog }}
      onClose={props.onClose ?? props.onCancel}
      closeAfterTransition
      TransitionComponent={Fade}
      TransitionProps={{ in: props.open }}
    >
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent classes={{ root: styles.contentWrapper }}>
        <Button onClick={props.onCancel} className={styles.cancelBtn}>
          {t('editor:dialog.lbl-cancel')}
        </Button>
        <Button
          disabled={props.isProjectMenu && isDev}
          className={styles.confirmBtn}
          onClick={props.onConfirm}
          autoFocus
        >
          {t('editor:dialog.lbl-confirm')}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
