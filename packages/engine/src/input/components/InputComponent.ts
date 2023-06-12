import { Entity } from '../../ecs/classes/Entity'
import { defineComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { BoundingBoxComponent } from '../../interaction/components/BoundingBoxComponents'

export const InputComponent = defineComponent({
  name: 'InputComponent',

  onInit: () => {
    return {
      /** populated automatically by ClientInputSystem */
      inputSources: [] as Entity[]
      // priority: 0
    }
  },

  onSet: (entity, component, json) => {
    setComponent(entity, BoundingBoxComponent)
  }
})
