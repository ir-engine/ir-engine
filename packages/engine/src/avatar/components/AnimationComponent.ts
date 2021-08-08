import { AnimationClip, AnimationMixer } from 'three'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type AnimationComponentType = {
  mixer: AnimationMixer
  animations: AnimationClip[]
  animationSpeed: number
}

export const AnimationComponent = createMappedComponent<AnimationComponentType>()