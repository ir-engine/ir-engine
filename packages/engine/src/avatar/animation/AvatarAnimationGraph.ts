/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { clamp } from 'lodash'
import { AnimationClip, AnimationMixer, LoopOnce, LoopRepeat, Vector2, Vector3 } from 'three'
import { lerp } from 'three/src/math/MathUtils'

import { getState } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
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
let fallWeight = 0,
  runWeight = 0,
  idleWeight = 1

//This is a stateless blend tree, it is not a graph
//To do: make a stateful blend tree
export const setAvatarLocomotionAnimation = (entity: Entity) => {
  const animationComponent = getComponent(entity, AnimationComponent)
  const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
  const avatarControllerComponent = getComponent(entity, AvatarControllerComponent)

  const idle = getAnimationAction('Idle', animationComponent.mixer)
  const run = getAnimationAction('Run', animationComponent.mixer)
  const fall = getAnimationAction('Fall', animationComponent.mixer)
  idle.play()
  fall.play()
  run.play()

  fallWeight = lerp(fallWeight, avatarControllerComponent.isInAir ? 1 : 0, getState(EngineState).deltaSeconds * 10)
  runWeight = clamp(moveLength.copy(avatarAnimationComponent.locomotion).setY(0).lengthSq() * 0.1, 0, 1) - fallWeight
  idleWeight = clamp(1 - runWeight, 0, 1) - fallWeight
  run.setEffectiveWeight(runWeight)
  fall.setEffectiveWeight(fallWeight)
  idle.setEffectiveWeight(idleWeight)
}

export const startAnimation = (avatar: Entity, animationName: string, loop: boolean = false, speed: number = 1) => {
  const animationComponent = getComponent(avatar, AnimationComponent)
  const animationAction = getAnimationAction(animationName, animationComponent.mixer)
  animationAction.setLoop(loop ? LoopRepeat : LoopOnce, Infinity)
  //blend from animation component mixer's current animation to passed animation
}
