import { Vector3 } from 'three'

import { matches } from '../../common/functions/MatchesUtils'
import { Entity } from '../../ecs/classes/Entity'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const DropShadowComponent = defineComponent({
  name: 'DropShadowComponent',
  onInit: (entity) => {
    return {
      radius: 0,
      center: undefined as Vector3 | undefined,
      bias: 2,
      entity: 0 as Entity
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.number.test(json.bias)) component.bias.set(json.bias)
    if (matches.object.test(json.center)) component.center.set(json.center)
    if (matches.number.test(json.radius)) component.radius.set(json.radius)
    if (matches.number.test(json.entity)) component.entity.set(json.entity)
  }
})
