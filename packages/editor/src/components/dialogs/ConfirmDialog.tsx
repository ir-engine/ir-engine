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

import Dialog from './Dialog'

/**
 * ProgressContainer used as a wrapper element for the ProgressMessage and ProgressBar components.
 *
 * @type {Object}
 */
const confirmContainerStyle = {
  color: 'var(--textColor)',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  /* This forces Firefox to give the contents a proper height. */
  overflow: 'hidden',
  padding: '8px'
}

/**
 * ProgressMessage used to provide styles to the message content on ProgressDialog.
 *
 * @type {Object}
 */
const confirmMessageStyle = {
  paddingBottom: '24px',
  whiteSpace: 'pre'
}

/**
 * ConfirmDialog component used to render view.
 *
 * @param       {string} message    [content to be shown on the ProgressDialog]
 * @param       {function} onConfirm
 * @param       {boolean} cancelable
 * @param       {function} onCancel
 * @param       {any} props
 * @constructor
 */
export function ConfirmDialog(props) {
  console.log(props)
  // if (!props) return console.warn('hmm no props here buddy', props);
  return (
    <Dialog onCancel={props.cancelable ? props.onCancel : null} {...props}>
      <div style={confirmContainerStyle as React.CSSProperties}>
        <div style={confirmMessageStyle as React.CSSProperties}>{props.message}</div>
      </div>
    </Dialog>
  )
}

ConfirmDialog.defaultProps = {
  title: 'Confirm',
  message: 'Confirm action?'
}

export default ConfirmDialog
