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

import React, { PropsWithChildren } from 'react'

import { useOnPressKey } from '../../hooks/useOnPressKey'

import './Modal.css'

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
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
        </div>
        <div className="modal-content">{children}</div>
        <div className="modal-actions">
          {actions.map((action, ix) => (
            <button
              key={ix}
              className={`modal-action-btn ${
                ix === actions.length - 1 ? 'modal-primary-action' : 'modal-secondary-action'
              }`}
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
