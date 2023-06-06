import { Vector3 } from 'three'

import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { changeState } from './AnimationGraph'

export const changeAvatarAnimationState = (entity: Entity, newStateName: string): void => {
  const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
  changeState(avatarAnimationComponent.animationGraph, newStateName)
}

const moveLength = new Vector3()
//will need 2d blending between axes of movement
export const setAvatarLocomotionAnimation = (entity: Entity) => {
  const animationComponent = getComponent(entity, AnimationComponent)
  const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
  //walk forward animation stored at index 1
  const walkForward = animationComponent.mixer.clipAction(animationComponent.animations[2])
  walkForward.setEffectiveWeight(moveLength.copy(avatarAnimationComponent.locomotion).setY(0).lengthSq())
}
