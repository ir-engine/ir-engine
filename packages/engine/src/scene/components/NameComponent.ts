import { createState } from '@xrengine/hyperflux/functions/StateFunctions'
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

  entitiesByName: createState({} as Record<string, Entity>)
  
})
