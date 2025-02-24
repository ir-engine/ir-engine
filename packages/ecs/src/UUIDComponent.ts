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

import { NO_PROXY_STEALTH, State, destroy, hookstate, useHookstate } from '@ir-engine/hyperflux'
import { v4 as uuidv4 } from 'uuid'
import { LayerComponent, LayerID, Layers, defineComponent, setComponent } from './ComponentFunctions'
import { Entity, EntityUUID, UndefinedEntity } from './Entity'
import { createEntity } from './EntityFunctions'
import { S } from './schemas/JSONSchemas'

export const UUIDComponent = defineComponent({
  name: 'UUIDComponent',

  schema: S.Required(
    S.EntityUUID({
      validate: (uuid, prev, entity) => {
        if (!uuid) {
          console.error('UUID cannot be empty')
          return false
        }
        if (uuid === prev) return true
        const layer = LayerComponent.get(entity)
        if (!UUIDComponent.entitiesByUUIDState[layer]) {
          UUIDComponent.entitiesByUUIDState[layer] = {}
          return true
        }
        // throw error if uuid is already in use
        const currentEntity = UUIDComponent.entitiesByUUIDState[layer][uuid]?.value
        if (currentEntity && currentEntity !== entity) {
          console.error(`UUID ${uuid} is already in use`, currentEntity, entity)
          return false
        }

        return true
      }
    })
  ),

  onSet(entity, component, uuid: EntityUUID) {
    const layer = LayerComponent.get(entity)
    const prev = component.value
    // remove old uuid
    if (prev) {
      const currentUUID = prev
      destroy(UUIDComponent.entitiesByUUIDState[layer][currentUUID])
      delete UUIDComponent.entitiesByUUIDState[layer][currentUUID]
    }

    // set new uuid
    UUIDComponentFunctions._getUUIDState(uuid, layer).set(entity)

    component.set(uuid)
  },

  onRemove: (entity, component) => {
    const uuid = component.value
    const layer = LayerComponent.get(entity)
    destroy(UUIDComponent.entitiesByUUIDState[layer][uuid])
    delete UUIDComponent.entitiesByUUIDState[layer][uuid]
  },

  entitiesByUUIDState: {} as Record<LayerID, Record<EntityUUID, State<Entity>>>,

  useEntityByUUID(uuid: EntityUUID, layer = Layers.Simulation as LayerID) {
    return useHookstate(UUIDComponentFunctions._getUUIDState(uuid, layer)).value
  },

  getEntityByUUID(uuid: EntityUUID, layer = Layers.Simulation as LayerID) {
    return UUIDComponentFunctions._getUUIDState(uuid, layer).get(NO_PROXY_STEALTH)
  },

  getOrCreateEntityByUUID(uuid: EntityUUID, layer = Layers.Simulation as LayerID) {
    const state = UUIDComponentFunctions._getUUIDState(uuid, layer)
    if (!state.value) {
      const entity = createEntity(layer)
      setComponent(entity, UUIDComponent, uuid)
    }
    return state.value
  },

  generateUUID() {
    return uuidv4() as EntityUUID
  }
})

function _getUUIDState(uuid: EntityUUID, layer = Layers.Simulation as LayerID) {
  let layerState = UUIDComponent.entitiesByUUIDState[layer]
  if (!layerState) {
    layerState = {}
    UUIDComponent.entitiesByUUIDState[layer] = layerState
  }
  let entityState = layerState[uuid]
  if (!entityState) {
    entityState = hookstate(UndefinedEntity)
    layerState[uuid] = entityState
  }
  return entityState
}

export const UUIDComponentFunctions = {
  /** @private Exposed only for unit tests */
  _getUUIDState
}
