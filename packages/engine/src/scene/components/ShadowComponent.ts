import { matches } from '../../common/functions/MatchesUtils'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const ShadowComponent = defineComponent({
  name: 'ShadowComponent',
  jsonID: 'shadow',

  onInit: (entity) => {
    return {
      cast: true,
      receive: true
    }
  },

  toJSON: (entity, component) => {
    return {
      cast: component.cast.value,
      receive: component.receive.value
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.boolean.test(json.cast)) component.cast.set(json.cast)
    if (matches.boolean.test(json.receive)) component.receive.set(json.receive)
  }
})
