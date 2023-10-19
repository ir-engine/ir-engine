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

import React, { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

/**
 * Interface for Modal props
 */
interface ModalProps {
  /**
   * The ID for the modal component, which can be used for referencing.
   */
  id?: string
  /**
   * The content to be rendered within the modal.
   */
  children?: ReactNode
  /**
   * The CSS class name to apply to the modal dialog.
   */
  className?: string
}

/**
 * A Modal component which displays its children within a dialog.
 * The dialog can be closed by clicking the close button.
 *
 * @param {ModalProps} props - The properties that define the Modal component.
 * @returns {JSX.Element} The rendered Modal component.
 */
const Modal = (props: ModalProps): JSX.Element => {
  const { id, children, className } = props

  return (
    <dialog id={id} className={twMerge('modal w-full h-full', className)}>
      <form method="dialog" className="modal-box w-full h-full">
        <div className="w-full h-full grid columns-1">
          <div className="grow w-full">{children}</div>
          <div className="fixed w-full bottom-10">
            <button className="btn float-right">Close</button>
          </div>
        </div>
      </form>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  )
}

/**
 * Specifies the name of the component for debugging purposes.
 */
Modal.displayName = 'Modal'

/**
 * Default properties for the Modal component.
 */
Modal.defaultProps = {
  /**
   * Default value for the id is an empty string.
   */
  id: '',
  /**
   * Default value for the children is null.
   */
  children: null,
  /**
   * Default value for the className is an empty string.
   */
  className: ''
}

export default Modal
