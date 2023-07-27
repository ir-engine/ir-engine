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
import styled from 'styled-components'

import CircularProgress from '@mui/material/CircularProgress'

import Dialog from './Dialog'

/**
 * ProgressContainer used as a wrapper element for the ProgressMessage and ProgressBar components.
 *
 * @type {Styled component}
 */
const ProgressContainer = (styled as any).div`
  color: var(--textColor);
  display: flex;
  flex: 1;
  flex-direction: column;
  /* This forces firefox to give the contents a proper height. */
  overflow: hidden;
  padding: 8px;
`

/**
 * ProgressMessage used to provide styles to the message content on ProgressDialog.
 *
 * @type {styled component}
 */
const ProgressMessage = (styled as any).div`
  margin: auto;
  white-space: pre;
`

interface Props {
  cancelable?: boolean
  message: string
  tag?
  title?
  bottomNav?
  children?
  cancelLabel?
  confirmLabel?
  onCancel?
  onConfirm?
}

/**
 * ProgressDialog component used to render view.
 *
 * @param       {string} message    [content to be shown on the ProgressDialog]
 * @param       {function} onConfirm
 * @param       {boolean} cancelable
 * @param       {function} onCancel
 * @param       {any} props
 * @constructor
 */
export function ProgressDialog(props: Props) {
  if (!props) return null
  return (
    <Dialog onCancel={props.cancelable ? props.onCancel : null} {...props}>
      <ProgressContainer>
        <ProgressMessage>{props.message}</ProgressMessage>
        <CircularProgress style={{ margin: 'auto' }} />
        {/* <ProgressBar /> */}
      </ProgressContainer>
    </Dialog>
  )
}

ProgressDialog.defaultProps = {
  title: i18n.t('editor:dialog.progress.title') || 'Loading...',
  message: i18n.t('editor:dialog.progress.message') || 'Loading...',
  cancelable: false,
  cancelLabel: i18n.t('editor:dialog.progress.lbl-cancel') || 'Cancel'
}
