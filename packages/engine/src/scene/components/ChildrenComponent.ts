import { Entity } from '../../ecs/classes/Entity'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const ChildrenComponent = defineComponent({
  name: 'ChildrenComponent',

  onInit: () => [] as Entity[],

  toJSON: (entity, component) => {
    return component.value
  }
})
