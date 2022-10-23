import { createState, none } from '@xrengine/hyperflux'

import { Entity } from '../../ecs/classes/Entity'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const UUIDComponent = defineComponent({
  name: 'UUIDComponent',

  onAdd: () => '',

  onUpdate: (entity, component, uuid: string) => {
    component.set(uuid)
    UUIDComponent.entitiesByUUID[uuid].set(entity)
  },

  onRemove: (entity, component) => {
    const uuid = component.value
    if (UUIDComponent.entitiesByUUID[uuid].value === entity) {
      UUIDComponent.entitiesByUUID[uuid].set(none)
    }
  },

  entitiesByUUID: createState({} as Record<string, Entity>)
})
