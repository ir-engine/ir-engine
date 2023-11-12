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

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { createState, none } from '@etherealengine/hyperflux'

import { Entity } from '../../ecs/classes/Entity'
import { defineComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'

const entitiesByUUID = {} as Record<EntityUUID, Entity>

export const UUIDComponent = defineComponent({
  name: 'UUIDComponent',

  onInit: () => '' as EntityUUID,

  onSet: (entity, component, uuid: EntityUUID) => {
    if (component.value === uuid) return

    // throw error if uuid is already in use
    if (UUIDComponent.entitiesByUUID[uuid] !== undefined && UUIDComponent.entitiesByUUID[uuid] !== entity) {
      throw new Error(`UUID ${uuid} is already in use`)
    }

    // remove old uuid
    const currentUUID = component.value
    if (currentUUID !== '') {
      UUIDComponent.entitiesByUUIDState[currentUUID].set(none)
    }

    // set new uuid
    component.set(uuid)
    UUIDComponent.valueMap[entity] = uuid
    UUIDComponent.entitiesByUUIDState[uuid].set(entity)
  },

  onRemove: (entity, component) => {
    const uuid = component.value
    if (UUIDComponent.entitiesByUUIDState[uuid].value === entity) {
      UUIDComponent.entitiesByUUIDState[uuid].set(none)
    } else {
      throw new Error(`UUID ${uuid} is not associated with entity ${entity}`)
    }
  },

  entitiesByUUIDState: createState(entitiesByUUID),
  entitiesByUUID: entitiesByUUID as Readonly<typeof entitiesByUUID>,

  getEntityByUUID: (uuid: EntityUUID) => {
    let entity = UUIDComponent.entitiesByUUID[uuid]
    if (entity === undefined) {
      entity = createEntity()
      setComponent(entity, UUIDComponent, uuid)
    }
    return entity
  }
})
