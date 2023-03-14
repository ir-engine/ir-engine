import { Vector3 } from 'three'

import { defineComponent } from '../ecs/functions/ComponentFunctions'

export const DebugArrowComponent = defineComponent({
  name: 'DebugArrowComponent',

  onInit: (entity) => {
    return {
      color: 0xffffff,
      direction: new Vector3(),
      position: new Vector3()
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (json.color) component.color.set(json.color)
    if (json.direction) component.direction.set(json.direction)
    if (json.position) component.position.set(json.position)
  }
})
