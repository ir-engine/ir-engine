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

import i18n from 'i18next'
import React from 'react'

import CircularProgress from '@mui/material/CircularProgress'

import Dialog from './Dialog'

const progressContainerStyles = {
  color: 'var(--textColor)',
  display: 'flex',
  flex: '1',
  flexDirection: 'column',
  overflow: 'hidden',
  padding: '8px'
}

const progressMessageStyles = {
  margin: 'auto',
  whiteSpace: 'pre'
}

interface Props {
  cancelable?: boolean
  message: string
  tag?: any
  title?: string
  bottomNav?: any
  children?: any
  cancelLabel?: string
  confirmLabel?: string
  onCancel?: any
  onConfirm?: any
}

export function ProgressDialog(props: Props) {
  if (!props) return null
  return (
    <Dialog onCancel={props.cancelable ? props.onCancel : null} {...props}>
      <div style={progressContainerStyles as React.CSSProperties}>
        <div style={progressMessageStyles as React.CSSProperties}>{props.message}</div>
        <CircularProgress style={{ margin: 'auto' }} />
        {/* <ProgressBar /> */}
      </div>
    </Dialog>
  )
}

ProgressDialog.defaultProps = {
  title: i18n.t('editor:dialog.progress.title') || 'Loading...',
  message: i18n.t('editor:dialog.progress.message') || 'Loading...',
  cancelable: false,
  cancelLabel: i18n.t('editor:dialog.progress.lbl-cancel') || 'Cancel'
}

export default ProgressDialog
