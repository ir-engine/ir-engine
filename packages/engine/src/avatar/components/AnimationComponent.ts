import { AnimationClip, AnimationMixer } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { BoneStructure } from '../AvatarBoneMatching'

type AnimationComponentType = {
  mixer: AnimationMixer
  animations: AnimationClip[]
  animationSpeed: number
  rig: BoneStructure
  /** ratio between original and target skeleton's root.position.y */
  rootYRatio: number
}

export const AnimationComponent = createMappedComponent<AnimationComponentType>('AnimationComponent')
