import { Types } from 'bitecs'
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

const anim = getComponent(0, AnimationComponent)
anim.mixer.update(42)
anim.animationSpeed // Ta-Da

AnimationComponent.animationSpeed[0] // also Ta-Da