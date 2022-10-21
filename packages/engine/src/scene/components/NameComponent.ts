import { hookstate, none } from '@xrengine/hyperflux'

import { Entity } from '../../ecs/classes/Entity'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const NameComponent = defineComponent({
  name: 'NameComponent',

  onAdd: () => '',

  toJSON: (entity, component) => component,

  onUpdate: (entity, _, name) => {
    NameComponent.map[entity].set(name)
    NameComponent.entitiesByName[name].set(entity)
  },

  onRemove: (entity, name) => {
    if (NameComponent.entitiesByName[name].value === entity) {
      NameComponent.entitiesByName[name].set(none)
    }
  },

  entitiesByName: hookstate({} as Record<string, Entity>)
})
