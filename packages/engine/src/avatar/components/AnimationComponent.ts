import { Types } from 'bitecs'
import { AnimationClip, AnimationMixer } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

type AnimationComponentType = {
  mixer: AnimationMixer
  animations: AnimationClip[]
}

const AnimationSchema = {
  animationSpeed: Types.ui16
}

export const AnimationComponent = createMappedComponent<AnimationComponentType, typeof AnimationSchema>(
  'AnimationComponent',
  AnimationSchema
)
