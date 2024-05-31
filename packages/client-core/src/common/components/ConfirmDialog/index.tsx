/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@etherealengine/client-core/src/common/components/Button'
import Dialog from '@etherealengine/ui/src/primitives/mui/Dialog'
import DialogActions from '@etherealengine/ui/src/primitives/mui/DialogActions'
import DialogContent from '@etherealengine/ui/src/primitives/mui/DialogContent'
import DialogContentText from '@etherealengine/ui/src/primitives/mui/DialogContentText'
import DialogTitle from '@etherealengine/ui/src/primitives/mui/DialogTitle'
import LoadingView from '@etherealengine/ui/src/primitives/tailwind/LoadingView'

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
        {processing && <LoadingView className="h-6 w-6" title={t('common:components.processing')} />}
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
