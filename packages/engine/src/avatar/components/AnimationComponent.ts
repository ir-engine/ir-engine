import { Types } from '../../ecs/bitecs'
import { AnimationClip, AnimationMixer } from 'three'
import { createMappedComponent, getComponent } from '../../ecs/functions/EntityFunctions'

type AnimationComponentType = {
  mixer: AnimationMixer
  animations: AnimationClip[]
}

const AnimationSchema = {
  animationSpeed: Types.ui16
}

export const AnimationComponent = createMappedComponent<AnimationComponentType, typeof AnimationSchema>(AnimationSchema)
