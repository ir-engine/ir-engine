import { createState } from '@xrengine/hyperflux/functions/StateFunctions'

import { Entity } from '../../ecs/classes/Entity'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const ChildrenComponent = defineComponent({
  name: 'ChildrenComponent',

  onAdd: () => createState([] as Entity[]),

  toJSON: (entity, component) => {
    return component.value
  }
})
