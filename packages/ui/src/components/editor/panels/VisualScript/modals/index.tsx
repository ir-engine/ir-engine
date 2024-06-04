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

import { useOnPressKey } from '@etherealengine/editor/src/components/visualScript/VisualScriptUIModule'
import React, { PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'

/* Styles for the modal backdrop */
const modalBackdrop: any = {
  zIndex: '19',
  position: 'fixed',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  backgroundColor: 'var(--background)',
  overflowY: 'auto'
}

/* Styles for the modal container */
const modalContainer: any = {
  zIndex: '20',
  position: 'relative',
  top: '2px',
  marginLeft: 'auto',
  marginRight: 'auto',
  border: '1px solid var(--borderStyle)',
  width: '24rem',
  boxShadow: '0 2px 4px var(--background2)',
  backgroundColor: 'var(--panelBackground)',
  fontSize: '0.875rem',
  borderRadius: '0.375rem',
  color: 'var(--textColor)'
}

/* Styles for the modal header */
const modalHeader = {
  padding: '0.75rem',
  borderBottom: '1px solid var(--borderStyle)'
}

/* Styles for the modal title */
const modalTitle: any = {
  fontSize: '1.125rem',
  fontWeight: 'bold',
  textAlign: 'center',
  color: 'var(--textColor)'
}

/* Styles for the modal content */
const modalContent: any = {
  padding: '0.75rem',
  color: 'var(--textColor)'
}

/* Styles for the modal actions container */
const modalActions = {
  display: 'flex',
  gap: '0.75rem',
  padding: '0.75rem',
  borderTop: '1px solid var(--borderStyle)'
}

/* Styles for the primary and secondary action buttons */
const modalActionBtn = {
  color: 'var(--textColor)',
  padding: '0.5rem 1rem',
  width: '100%',
  cursor: 'pointer'
}

const modalPrimaryAction = {
  backgroundColor: 'var(--iconButtonBackground)' /* Equivalent to 'bg-teal-400' */
}

const modalSecondaryAction = {
  backgroundColor: 'var(--iconButtonBackground)' /* Equivalent to 'bg-gray-400' */
}

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
