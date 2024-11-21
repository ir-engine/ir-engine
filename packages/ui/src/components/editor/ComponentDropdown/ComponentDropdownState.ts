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

import { Entity, EntityUUID, UUIDComponent, getOptionalComponent } from '@ir-engine/ecs'
import { defineState, getMutableState, none } from '@ir-engine/hyperflux'

export const ComponentDropdownState = defineState({
  name: 'ComponentDropdownState',
  initial: () => ({
    componentStates: {} as Record<EntityUUID, Record<string, boolean>> //use name as key
  }),

  addOrUpdateEntity: (entity: Entity, componentName: string, value: boolean, updateIfExists: boolean = true) => {
    const entityUUID = getOptionalComponent(entity, UUIDComponent)
    if (!entityUUID) return

    const componentStates = getMutableState(ComponentDropdownState).componentStates
    // Ensure entityUUID entry exists; if not, initialize it as an empty object
    if (!componentStates.value[entityUUID]) {
      componentStates[entityUUID].set({} as Record<string, boolean>)

      // Set the componentName state within the specific entityUUID
      componentStates[entityUUID][componentName].set(value)
    }

    //default to true, this way we can make initialization calls that only run if there is not yet an entry by passing false
    if (updateIfExists) {
      // Set the componentName state within the specific entityUUID
      componentStates[entityUUID][componentName].set(value)
    }
  },

  addOrUpdateUUID: (entityUUID: EntityUUID, componentName: string, value: boolean) => {
    const componentStates = getMutableState(ComponentDropdownState).componentStates
    // Ensure entityUUID entry exists; if not, initialize it as an empty object
    if (!componentStates.value[entityUUID]) {
      componentStates[entityUUID].set({} as Record<string, boolean>)
    }

    // Set the componentName state within the specific entityUUID
    componentStates[entityUUID][componentName].set(value)
  },

  removeEntityUUIDs: (entityUUIDs: EntityUUID[]) => {
    const componentStates = getMutableState(ComponentDropdownState).componentStates
    for (const entityUUID of entityUUIDs) {
      componentStates[entityUUID].set(none)
    }
  },

  removeComponentEntry: (entities: Entity[], componentName: string) => {
    for (const entity of entities) {
      const entityUUID = getOptionalComponent(entity, UUIDComponent)
      if (!entityUUID) continue

      const componentStates = getMutableState(ComponentDropdownState).componentStates
      if (!componentStates.value[entityUUID]) continue

      componentStates[entityUUID][componentName].set(none)

      const record = componentStates[entityUUID].value
      if (Object.keys(record).length === 0) {
        componentStates[entityUUID].set(none)
      }
    }
  }
})
