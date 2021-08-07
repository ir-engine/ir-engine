import { Vector3 } from 'three'
import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'
import { AnimationGraph } from '../animations/AnimationGraph'
import { AnimationState } from '../animations/AnimationState'

export class AvatarAnimationComponent extends Component<AvatarAnimationComponent> {
  /** Animaiton graph of this entity */
  animationGraph: AnimationGraph

  /** Current animation state */
  currentState: AnimationState

  /** Previous animation state */
  prevState: AnimationState

  /** Previous velocity of the character */
  prevVelocity: Vector3
}

AvatarAnimationComponent._schema = {
  mixer: { type: Types.Ref, default: null }
}
