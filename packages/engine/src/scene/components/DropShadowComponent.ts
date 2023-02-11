import { Vector3 } from 'three'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const DropShadowComponent = defineComponent({
  name: 'DropShadowComponent',
  onInit: (entity) => {
    return {
      radius: 0,
      center: undefined as Vector3 | undefined,
      bias: 2
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.bias !== 'undefined') component.bias.set(json.bias)
    if (typeof json.center !== 'undefined') component.center.set(json.center)
    if (typeof json.radius !== 'undefined') component.radius.set(json.radius)
  }
})
