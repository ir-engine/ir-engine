import { Tween } from '@tweenjs/tween.js'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const TweenComponent = defineComponent({
  name: 'TweenComponent',

  onInit(entity) {
    return null! as Tween<any>
  },

  onSet(entity, component, json) {
    component.set(json as Tween<any>)
  }
})
