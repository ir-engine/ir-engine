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

/**
 * Popover state for tailwind routes
 */
export const PopoverState = defineState({
  name: 'ee.client.PopoverState',
  initial: {
    elements: [] as (JSX.Element | null)[]
  },

  /**shows a popupover. if a previous popover was already present, the `element` popover will be current showed */
  showPopupover: (element: JSX.Element) => {
    getMutableState(PopoverState).elements.merge([element])
  },
  /**close the current popover. if a previous popover was present, the previous one will be shown */
  hidePopupover: () => {
    getMutableState(PopoverState).elements.set((prevElements) => {
      prevElements.pop()
      return prevElements
    })
  },
  /**Returns true if there are any open popovers, false otherwise, based on the length of the elements array in PopoverState.*/
  isPopupoverOpen: () => getMutableState(PopoverState).elements.length > 0
})
