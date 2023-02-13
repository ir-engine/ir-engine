import { Vector3 } from 'three'

import { matches } from '../../common/functions/MatchesUtils'
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
    if (matches.number.test(json.bias)) component.bias.set(json.bias)
    if (matches.object.test(json.center)) component.center.set(json.center)
    if (matches.number.test(json.radius)) component.radius.set(json.radius)
  }
})
