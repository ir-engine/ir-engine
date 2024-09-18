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

import React, { PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'
import { useOnPressKey } from '../hooks'

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

  return (
    <>
      <div className="fixed inset-0 z-20 h-full w-full overflow-y-auto bg-transparent" onClick={onClose}></div>
      <div className="border-borderStyle relative top-[2px] z-20 mx-auto w-96 rounded-md border bg-theme-primary text-sm text-gray-800 shadow-[0_2px_4px_var(--background2)]">
        <div className="border-b border-gray-600 p-3">
          <h2 className="text-center text-lg font-bold text-white">{title}</h2>
        </div>
        <div className="p-3 text-white">{children}</div>
        <div className="border-grey-600 flex gap-3 border-t p-3">
          {actions.map((action, ix) => (
            <button
              key={ix}
              className={twMerge(
                'w-full cursor-pointer p-2 text-white',
                ix === actions.length - 1 ? 'bg-zinc-700' : 'bg-gray-400'
              )}
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
