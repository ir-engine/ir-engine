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

import { defineState, getMutableState } from '@ir-engine/hyperflux'

type BackdropType = 'blur' | 'transparent'

export interface ModalData {
  element: JSX.Element | null
  onClickOutside: VoidFunction
}

/**
 * Modal state for tailwind routes
 */
export const ModalState = defineState({
  name: 'ee.client.ModalState',
  initial: {
    modals: [] as ModalData[],
    backdrop: 'blur' as BackdropType
  },

  /**shows a modal.
   * if a previous modal was already present, the `element` modal will be current showed */
  openModal: (
    element: JSX.Element,
    onClickOutside?: ModalData['onClickOutside'],
    backdrop = 'blur' as BackdropType
  ) => {
    getMutableState(ModalState).modals.merge([
      {
        element,
        onClickOutside: onClickOutside || ModalState.closeModal
      }
    ])
    if (backdrop === 'transparent') {
      /* if atleast one Modal is asking to use transparent backdrop, all the Modals "in this nesting" will use transparent backdrop. */
      getMutableState(ModalState).backdrop.set('transparent')
    }
  },
  /**close the current modal.
   * if a previous modal was present, the previous one will be shown */
  closeModal: () => {
    const currentCount = getMutableState(ModalState).modals.length
    getMutableState(ModalState).modals.set((prevElements) => {
      prevElements.pop()
      return prevElements
    })
    if (currentCount === 1) {
      /* if the current modal is the last one, the backdrop will be reset to blur */
      getMutableState(ModalState).backdrop.set('blur')
    }
  },
  /**Returns true if there are any open modals, false otherwise, based on the length of the elements array in ModalState.*/
  isModalOpen: () => getMutableState(ModalState).modals.length > 0
})
