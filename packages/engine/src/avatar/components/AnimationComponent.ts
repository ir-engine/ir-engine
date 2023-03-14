import { AnimationClip, AnimationMixer } from 'three'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const AnimationComponent = defineComponent({
  name: 'AnimationComponent',

  onInit: (entity) => {
    return {
      mixer: null! as AnimationMixer,
      animations: [] as AnimationClip[],
      animationSpeed: 1
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (json.mixer) component.mixer.set(json.mixer)
    if (json.animations) component.animations.set(json.animations as AnimationClip[])
    if (json.animationSpeed) component.animationSpeed.set(json.animationSpeed)
  }
})
