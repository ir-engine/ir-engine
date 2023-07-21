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
import { PropsWithChildren } from 'react'

import { useOnPressKey } from '../../hooks/useOnPressKey.js'

export type ModalAction = {
  label: string
  onClick: () => void
}

export type ModalProps = {
  open?: boolean
  onClose: () => void
  title: string
  actions: ModalAction[]
}

export const Modal: React.FC<PropsWithChildren<ModalProps>> = ({ open = false, onClose, title, children, actions }) => {
  useOnPressKey('Escape', onClose)

  if (open === false) return null

  const actionColors = {
    primary: 'bg-teal-400 hover:bg-teal-500',
    secondary: 'bg-gray-400 hover:bg-gray-500'
  }

  return (
    <>
      <div
        className="z-[19] fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
        onClick={onClose}
      ></div>
      <div className="z-20 relative top-20 mx-auto border w-96 shadow-lg bg-white text-sm rounded-md">
        <div className="p-3 border-b">
          <h2 className="text-lg text-center font-bold">{title}</h2>
        </div>
        <div className="p-3">{children}</div>
        <div className="flex gap-3 p-3 border-t">
          {actions.map((action, ix) => (
            <button
              key={ix}
              className={
                'text-white p-2 w-full cursor-pointer ' +
                (ix === actions.length - 1 ? actionColors.primary : actionColors.secondary)
              }
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
