import { Types } from 'bitecs'
import { AnimationClip, AnimationMixer } from 'three'
import { createMappedComponent, getComponent } from '../../ecs/functions/EntityFunctions'

export type AnimationComponentType = {
  mixer: AnimationMixer
  animations: AnimationClip[]
}

export const AnimationComponent = createMappedComponent<AnimationComponentType>({ animationSpeed: Types.ui16 })

const anim = getComponent(0, AnimationComponent)

AnimationComponent