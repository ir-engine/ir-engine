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
import { AnimationClip, AnimationMixer, Vector3 } from 'three'

import { getState } from '@etherealengine/hyperflux'

import { lerp } from '../../common/functions/MathLerpFunctions'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { AnimationState } from '../AnimationManager'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'

export const getAnimationAction = (name: string, mixer: AnimationMixer, animations?: AnimationClip[]) => {
  const manager = getState(AnimationState)
  const clip = AnimationClip.findByName(animations ?? manager.ikTargetsAnimations!, name)
  return mixer.clipAction(clip)
}

const moveLength = new Vector3()
let fallWeight = 0,
  runWeight = 0,
  walkWeight = 0,
  idleWeight = 1

//This is a stateless animation blend, it is not a graph
//To do: make a stateful blend tree
export const setAvatarLocomotionAnimation = (entity: Entity) => {
  const animationComponent = getComponent(entity, AnimationComponent)
  if (!animationComponent.animations) return
  const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)

  const idle = getAnimationAction('Idle', animationComponent.mixer, animationComponent.animations)
  const run = getAnimationAction('Run', animationComponent.mixer, animationComponent.animations)
  const walk = getAnimationAction('Walk', animationComponent.mixer, animationComponent.animations)
  const fall = getAnimationAction('Fall', animationComponent.mixer, animationComponent.animations)
  if (!idle || !run || !walk || !fall) return
  idle.play()
  run.play()
  walk.play()
  fall.play()

  fallWeight = lerp(
    fall.getEffectiveWeight(),
    clamp(Math.abs(avatarAnimationComponent.locomotion.y), 0, 1),
    getState(EngineState).deltaSeconds * 10
  )
  const magnitude = moveLength.copy(avatarAnimationComponent.locomotion).setY(0).lengthSq()
  walkWeight = lerp(
    walk.getEffectiveWeight(),
    clamp(1 / (magnitude - 1.65), 0, 1) - fallWeight,
    getState(EngineState).deltaSeconds * 4
  )
  runWeight = clamp(magnitude * 0.1 - walkWeight, 0, 1) - fallWeight
  idleWeight = clamp(1 - runWeight - walkWeight, 0, 1) - fallWeight
  run.setEffectiveWeight(runWeight)
  walk.setEffectiveWeight(walkWeight)
  fall.setEffectiveWeight(fallWeight)
  idle.setEffectiveWeight(idleWeight)
}

export const getRootSpeed = (clip: AnimationClip) => {
  //calculate the speed of the root motion of the clip
  const tracks = clip.tracks
  const rootTrack = tracks[0]
  if (!rootTrack) return 0
  const startPos = new Vector3(rootTrack.values[0], rootTrack.values[1], rootTrack.values[2])
  const endPos = new Vector3(
    rootTrack.values[rootTrack.values.length - 3],
    rootTrack.values[rootTrack.values.length - 2],
    rootTrack.values[rootTrack.values.length - 1]
  )
  const speed = new Vector3().subVectors(endPos, startPos).length() / clip.duration
  console.log(speed)
  return speed
}
