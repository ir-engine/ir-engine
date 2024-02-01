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

/**
 * Interface for Modal props
 */
export interface ModalProps {
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

  title?: string

  open: boolean
}

/**
 * A Modal component which displays its children within a dialog.
 * The dialog can be closed by clicking the close button.
 *
 * @param {ModalProps} props - The properties that define the Modal component.
 * @returns {JSX.Element} The rendered Modal component.
 */
const Modal = (props: ModalProps): JSX.Element => {
  const { id, children, className, title, open } = props

  return open ? (
    <>
      <div className="fixed top-0 left-0 w-screen h-screen z-10 bg-gray-500 bg-opacity-75 transition-opacity px-16 py-24 lg:py-48 lg:px-96">
        <div
          className="rounded-xl drop-shadow-2xl"
          style={{
            // TODO: replace with bg-primary
            backgroundColor: 'white'
          }}
        >
          <div className="flex p-5 border-b-2 border-slate-200">
            {title && <h3 className="text-center flex-1">{title}</h3>}
            <button className="ml-auto">
              <svg width="24px" height="24px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <g>
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" />
                </g>
              </svg>
            </button>
          </div>

          <div className="px-6 py-2 border-b-2 border-slate-200 rounded-xl">{children}</div>
        </div>
      </div>
    </>
  ) : (
    <></>
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
  className: '',

  title: 'Test title'
}

export default Modal
