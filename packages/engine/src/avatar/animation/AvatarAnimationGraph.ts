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

import { AnimationClip, AnimationMixer, Vector2, Vector3 } from 'three'

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
