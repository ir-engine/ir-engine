import { defineComponent } from '../../ecs/functions/ComponentFunctions'
import { DissolveEffect } from '../DissolveEffect'

export const AvatarDissolveComponent = defineComponent({
  name: 'AvatarDissolveComponent',

  onInit: (entity) => {
    return {
      effect: null! as DissolveEffect
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (json.effect) component.effect.set(json.effect as DissolveEffect)
  }
})
