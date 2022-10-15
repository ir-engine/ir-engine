import { createState } from '@xrengine/hyperflux/functions/StateFunctions'

import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const ParentComponent = defineComponent({
  name: 'ParentComponent',

  onAdd: () => createState(UndefinedEntity),

  toJSON: (entity, component) => {
    return component.value
  },

  onUpdate: (entity, component, parentEntity) => {
    component.set(parentEntity as Entity)
  }
})
