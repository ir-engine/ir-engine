import { Vector3 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { AnimationGraph } from '../animations/AnimationGraph'
import { AnimationState } from '../animations/AnimationState'

export type AvatarAnimationComponentType = {
  /** Animaiton graph of this entity */
  animationGraph: AnimationGraph

  /** Current animation state */
  currentState: AnimationState

  /** Previous animation state */
  prevState: AnimationState

  /** Previous velocity of the avatar */
  prevVelocity: Vector3
}

export const AvatarAnimationComponent = createMappedComponent<AvatarAnimationComponentType>('AvatarAnimationComponent')
