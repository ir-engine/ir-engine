import { Object3D } from 'three'

import { matches } from '../../common/functions/MatchesUtils'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const AvatarComponent = defineComponent({
  name: 'AvatarComponent',

  onInit: (entity) => {
    return {
      model: null as Object3D | null,
      avatarHeight: 0,
      avatarHalfHeight: 0
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.object.test(json.model)) component.model.set(json.model as Object3D)
    if (matches.number.test(json.avatarHeight)) component.avatarHeight.set(json.avatarHeight)
    if (matches.number.test(json.avatarHalfHeight)) component.avatarHalfHeight.set(json.avatarHalfHeight)
  }
})
