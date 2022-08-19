import { AnimationAction } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type LoopAnimationComponentType = {
  activeClipIndex: number
  hasAvatarAnimations: boolean
  action?: AnimationAction
}

export const LoopAnimationComponent = createMappedComponent<LoopAnimationComponentType>('LoopAnimationComponent')

export const SCENE_COMPONENT_LOOP_ANIMATION = 'loop-animation'
export const SCENE_COMPONENT_LOOP_ANIMATION_DEFAULT_VALUE = {
  activeClipIndex: -1,
  hasAvatarAnimations: false
}
