import { AnimationClip, AnimationMixer, LoopOnce, Vector3 } from 'three'

import { getState } from '@etherealengine/hyperflux'

import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { AnimationManager } from '../AnimationManager'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { changeState } from './AnimationGraph'

export const changeAvatarAnimationState = (entity: Entity, newStateName: string): void => {
  const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
  changeState(avatarAnimationComponent.animationGraph, newStateName)
}

export const getAnimationAction = (name: string, mixer: AnimationMixer, animations?: AnimationClip[]) => {
  const manager = getState(AnimationManager)
  const clip = AnimationClip.findByName(animations ?? manager.targetsAnimation!, name)
  return mixer.clipAction(clip)
}

const moveLength = new Vector3()

//will need 2d blending between axes of movement
export const setAvatarLocomotionAnimation = (entity: Entity) => {
  const animationComponent = getComponent(entity, AnimationComponent)
  const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)

  const idle = getAnimationAction('Idle', animationComponent.mixer)
  const run = getAnimationAction('Run', animationComponent.mixer)
  run.play()
  idle.play()
  run.setEffectiveWeight(moveLength.copy(avatarAnimationComponent.locomotion).setY(0).lengthSq())
}
