import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { createState, none } from '@etherealengine/hyperflux'

import { Entity } from '../../ecs/classes/Entity'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const UUIDComponent = defineComponent({
  name: 'UUIDComponent',

  onInit: () => '' as EntityUUID,

  onSet: (entity, component, uuid: EntityUUID) => {
    component.set(uuid)
    UUIDComponent.valueMap[entity] = uuid
    UUIDComponent.entitiesByUUID[uuid].set(entity)
  },

  onRemove: (entity, component) => {
    const uuid = component.value
    if (UUIDComponent.entitiesByUUID[uuid].value === entity) {
      UUIDComponent.entitiesByUUID[uuid].set(none)
    }
  },

  entitiesByUUID: createState({} as Record<EntityUUID, Entity>)
})
