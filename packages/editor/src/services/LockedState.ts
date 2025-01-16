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
import { Entity } from '@ir-engine/ecs'
import { defineState, getMutableState } from '@ir-engine/hyperflux'

export const LockedState = defineState({
  name: 'LockedState',
  initial: () => ({
    lockedEntities: new Map<Entity, boolean>() // Map to store locked state of entities
  }),
  // Updates the locked state of a specific entity
  updateLocked: (entityId: Entity, isLocked: boolean) => {
    const state = getMutableState(LockedState)
    const updatedMap = new Map(state.lockedEntities.value) // Create a new Map to trigger reactivity
    updatedMap.set(entityId, isLocked)
    state.lockedEntities.set(updatedMap) // Replace the Map entirely
  },

  // Retrieves the lock status of a specific entity
  isEntityLocked: (entityId: Entity): boolean => {
    const state = getMutableState(LockedState)
    return state.lockedEntities.get()?.get(entityId) ?? false // Default to false if not set
  },

  // Clears all locked entities
  clearLockedEntities: () => {
    const state = getMutableState(LockedState)
    state.lockedEntities.set(new Map()) // Replace the Map entirely with an empty one
  }
})
