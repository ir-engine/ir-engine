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

import { v4 as uuidv4 } from 'uuid'

import { hookstate, NO_PROXY_STEALTH, State, useHookstate } from '@ir-engine/hyperflux'

import { defineComponent, setComponent } from './ComponentFunctions'
import { Entity, EntityUUID, UndefinedEntity } from './Entity'
import { createEntity } from './EntityFunctions'

export const UUIDComponent = defineComponent({
  name: 'UUIDComponent',
  jsonID: 'EE_uuid',

  onInit: () => '' as EntityUUID,

  onSet: (entity, component, uuid: EntityUUID) => {
    if (!uuid) throw new Error('UUID cannot be empty')

    if (component.value === uuid) return

    // throw error if uuid is already in use
    const currentEntity = UUIDComponent.getEntityByUUID(uuid)
    if (currentEntity !== UndefinedEntity && currentEntity !== entity) {
      throw new Error(`UUID ${uuid} is already in use`)
    }

    // remove old uuid
    if (component.value) {
      const currentUUID = component.value
      _getUUIDState(currentUUID).set(UndefinedEntity)
    }

    // set new uuid
    component.set(uuid)
    _getUUIDState(uuid).set(entity)
  },

  toJSON(entity, component) {
    return component.value
  },

  onRemove: (entity, component) => {
    const uuid = component.value
    _getUUIDState(uuid).set(UndefinedEntity)
  },

  entitiesByUUIDState: {} as Record<EntityUUID, State<Entity>>,

  useEntityByUUID(uuid: EntityUUID) {
    return useHookstate(_getUUIDState(uuid)).value
  },

  getEntityByUUID(uuid: EntityUUID) {
    return _getUUIDState(uuid).get(NO_PROXY_STEALTH)
  },

  getOrCreateEntityByUUID(uuid: EntityUUID) {
    const state = _getUUIDState(uuid)
    if (!state.value) {
      const entity = createEntity()
      setComponent(entity, UUIDComponent, uuid)
    }
    return state.value
  },

  generateUUID() {
    return uuidv4() as EntityUUID
  }
})

function _getUUIDState(uuid: EntityUUID) {
  let entityState = UUIDComponent.entitiesByUUIDState[uuid]
  if (!entityState) {
    entityState = hookstate(UndefinedEntity)
    UUIDComponent.entitiesByUUIDState[uuid] = entityState
  }
  return entityState
}
