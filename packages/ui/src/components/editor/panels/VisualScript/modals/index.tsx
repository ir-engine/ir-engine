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
      <div style={modalBackdrop} onClick={onClose}></div>
      <div style={modalContainer}>
        <div style={modalHeader}>
          <h2 style={modalTitle}>{title}</h2>
        </div>
        <div style={modalContent}>{children}</div>
        <div style={modalActions}>
          {actions.map((action, ix) => (
            <button
              key={ix}
              style={{ ...modalActionBtn, ...(ix === actions.length - 1 ? modalPrimaryAction : modalSecondaryAction) }}
              onMouseOver={(event) => {
                ;(event.target as any).style.backgroundColor = 'var(--iconButtonSelectedBackground)'
              }}
              onMouseOut={(event) => {
                ;(event.target as any).style.backgroundColor = 'var(--iconButtonBackground)'
              }}
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
