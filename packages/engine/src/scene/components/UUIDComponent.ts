import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { createState, none } from '@etherealengine/hyperflux'

import { Entity } from '../../ecs/classes/Entity'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'

const entitiesByUUID = {} as Record<EntityUUID, Entity>

export const UUIDComponent = defineComponent({
  name: 'UUIDComponent',

  onInit: () => '' as EntityUUID,

  onSet: (entity, component, uuid: EntityUUID) => {
    if (component.value === uuid) return

    // throw error if uuid is already in use
    if (
      UUIDComponent.entitiesByUUIDState[uuid].value !== undefined &&
      UUIDComponent.entitiesByUUIDState[uuid].value !== entity
    ) {
      throw new Error(`UUID ${uuid} is already in use`)
    }

    component.set(uuid)
    UUIDComponent.valueMap[entity] = uuid
    UUIDComponent.entitiesByUUIDState[uuid].set(entity)
  },

  onRemove: (entity, component) => {
    const uuid = component.value
    if (UUIDComponent.entitiesByUUIDState[uuid].value === entity) {
      UUIDComponent.entitiesByUUIDState[uuid].set(none)
    }
  },

  entitiesByUUIDState: createState(entitiesByUUID),
  entitiesByUUID: entitiesByUUID as Readonly<typeof entitiesByUUID>
})
