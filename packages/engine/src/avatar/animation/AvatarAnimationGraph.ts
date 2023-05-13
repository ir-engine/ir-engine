import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { changeState } from './AnimationGraph'

export const changeAvatarAnimationState = (entity: Entity, newStateName: string): void => {
  const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
  changeState(avatarAnimationComponent.animationGraph, newStateName)
}
