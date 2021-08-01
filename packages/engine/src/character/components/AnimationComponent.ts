import { AnimationClip, AnimationMixer } from 'three'
import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'
export class AnimationComponent extends Component<AnimationComponent> {
  mixer: AnimationMixer
  animations: AnimationClip[] = []
  animationSpeed = 1
}

AnimationComponent._schema = {
  mixer: { type: Types.Ref, default: null }
}
