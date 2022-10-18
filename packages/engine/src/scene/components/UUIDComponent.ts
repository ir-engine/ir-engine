import { createState, none } from '@xrengine/hyperflux'

import { Entity } from '../../ecs/classes/Entity'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const UUIDComponent = defineComponent({
  name: 'UUIDComponent',

  onAdd: () => '',

  toJSON: (entity, uuid: string) => {
    return uuid
  },

  onUpdate: (entity, _, uuid: string) => {
    UUIDComponent.map[entity].set(uuid)
    UUIDComponent.entitiesByUUID[uuid].set(entity)
  },

  onRemove: (entity, name) => {
    if (UUIDComponent.entitiesByUUID[name].value === entity) {
      UUIDComponent.entitiesByUUID[name].set(none)
    }
  },

  entitiesByUUID: createState({} as Record<string, Entity>)
})
