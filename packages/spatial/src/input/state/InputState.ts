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

import { defineQuery, getComponent } from '@etherealengine/ecs'
import { defineState, getState, syncStateWithLocalStorage } from '@etherealengine/hyperflux'
import { Raycaster, Vector2 } from 'three'
import { XRState } from '../../xr/XRState'
import { InputSourceComponent } from '../components/InputSourceComponent'

export const InputState = defineState({
  name: 'InputState',
  initial: () => ({
    preferredHand: 'right' as 'left' | 'right',
    /** A screenspace raycaster for the pointer */
    pointerScreenRaycaster: new Raycaster(),
    scroll: new Vector2()
  }),
  onCreate: (store, state) => {
    syncStateWithLocalStorage(InputState, ['preferredHand'])
  },

  /**
   * Gets the preferred controller entity - will return null if the entity is not in an active session or the controller is not available
   * @param {boolean} offhand specifies to return the non-preferred hand instead
   * @returns {Entity}
   */
  getPreferredInputSource: (offhand = false) => {
    const xrState = getState(XRState)
    if (!xrState.sessionActive) return
    const avatarInputSettings = getState(InputState)
    for (const inputSourceEntity of inputSourceQuery()) {
      const inputSourceComponent = getComponent(inputSourceEntity, InputSourceComponent)
      const source = inputSourceComponent.source
      if (source?.handedness === 'none') continue
      if (!offhand && avatarInputSettings.preferredHand == source?.handedness) return source
      if (offhand && avatarInputSettings.preferredHand !== source?.handedness) return source
    }
  }
})

const inputSourceQuery = defineQuery([InputSourceComponent])
