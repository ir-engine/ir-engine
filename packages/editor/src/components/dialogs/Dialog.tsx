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

import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import React, { useCallback } from 'react'

const DialogForm = ({ tag, onSubmit, children }) => {
  return tag ? React.createElement(tag, { onSubmit }, children) : <form onSubmit={onSubmit}>{children}</form>
}
/**
 * Dialog used to render view for Dialog which contains form.
 *
 * @param  {Props}
 * @constructor
 */
interface Props {
  tag?: any
  title?: string
  bottomNav?: any
  children?: any
  cancelLabel?: string
  confirmLabel?: string
  onCancel?: any
  onConfirm?: any
}

const Dialog = (props: Props) => {
  // callback function used to handle form submit
  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault()

      if (props.onConfirm) {
        props.onConfirm(e)
      }
    },
    [props.onConfirm]
  )
  // returning view for Dialog component
  return (
    <DialogForm tag={props.tag} onSubmit={onSubmitForm}>
      <div className="flex max-h-[80vh] min-h-[150px] min-w-[250px] max-w-3xl flex-col rounded-lg">
        <div className="flex min-h-[100px] flex-1 flex-row overflow-hidden p-2 font-['Figtree'] text-xs">
          {props.children}
        </div>
        {(props.onConfirm || props.onCancel || props.bottomNav) && (
          <div className="mb-2.5 flex p-2">
            {props.bottomNav}
            {props.onCancel && (
              <Button variant="outline" onClick={props.onCancel} className="m-[10px] min-w-[75px]">
                {props.cancelLabel || 'Cancel'}
              </Button>
            )}
            {props.onConfirm && (
              <Button onClick={props.tag === 'form' ? null : props.onConfirm} className="m-2.5 min-w-[75px]">
                {props.confirmLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </DialogForm>
  )
}

export default Dialog
