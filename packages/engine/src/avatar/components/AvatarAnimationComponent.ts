import { Vector3 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { AnimationGraph } from '../animation/AnimationGraph'
import { AnimationState } from '../animation/AnimationState'
import { BoneStructure } from '../AvatarBoneMatching'

export type AvatarAnimationComponentType = {
  /** Animaiton graph of this entity */
  animationGraph: AnimationGraph

  /** Current animation state */
  currentState: AnimationState

  /** Previous animation state */
  prevState: AnimationState

  /** Previous velocity of the avatar */
  prevVelocity: Vector3

  /** Holds all the bones */
  rig: BoneStructure

  /** ratio between original and target skeleton's root.position.y */
  rootYRatio: number
}

export const AvatarAnimationComponent = createMappedComponent<AvatarAnimationComponentType>('AvatarAnimationComponent')
