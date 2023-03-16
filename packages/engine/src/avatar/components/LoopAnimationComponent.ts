import { AnimationAction } from 'three'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const LoopAnimationComponent = defineComponent({
  name: 'LoopAnimationComponent',
  onInit: (entity) => {
    return {
      activeClipIndex: -1,
      hasAvatarAnimations: false,
      action: null as AnimationAction | null
    }
  },
  onSet: (entity, component, json) => {
    if (!json) return

    if (typeof json.activeClipIndex === 'number') component.activeClipIndex.set(json.activeClipIndex)
    if (typeof json.hasAvatarAnimations === 'boolean') component.hasAvatarAnimations.set(json.hasAvatarAnimations)
    if (typeof json.action !== 'undefined') component.action.set(json.action as AnimationAction)
  }
})

export const SCENE_COMPONENT_LOOP_ANIMATION = 'loop-animation'
export const SCENE_COMPONENT_LOOP_ANIMATION_DEFAULT_VALUE = {
  activeClipIndex: -1,
  hasAvatarAnimations: false
}
