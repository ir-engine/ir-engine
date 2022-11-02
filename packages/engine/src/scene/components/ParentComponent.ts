import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const ParentComponent = defineComponent({
  name: 'ParentComponent',

  onInit: () => UndefinedEntity,

  toJSON: (entity, component) => {
    return component.value
  },

  onSet: (entity, component, parentEntity?: Entity) => {
    component.set(parentEntity ?? UndefinedEntity)
  }
})
