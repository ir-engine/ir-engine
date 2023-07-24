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

import { AnimationClip, InterpolateSmooth, QuaternionKeyframeTrack, VectorKeyframeTrack } from 'three'

import { getState } from '@etherealengine/hyperflux'

import { AnimationManager } from '../AnimationManager'
import { ikTargets } from '../components/AvatarAnimationComponent'

//Programatic keyframe placement for complex animations is not scalable
//Used here for an idle pose experimentally
export const getIdlePose = (map: ikTargets) => {
  const state = getState(AnimationManager)

  const idleTrackRightHand = new VectorKeyframeTrack(
    map.rightHandTarget.name + '.position',
    [0, 1, 2],
    [-0.195, 1, 0, -0.195, 1, 0, -0.195, 1, 0],
    InterpolateSmooth
  )

  const idleTrackRightHandRot = new QuaternionKeyframeTrack(
    map.rightHandTarget.name + '.quaternion',
    [0, 1, 2],
    [0, 0, -0.6, 1, 0, 0, -0.7, 1, 0, 0, -0.6, 1],
    InterpolateSmooth
  )

  const idleTrackLeftHand = new VectorKeyframeTrack(
    map.leftHandTarget.name + '.position',
    [0, 1, 2],
    [0.195, 0, 0, 0.195, 0, 0, 0.195, 0, 0],
    InterpolateSmooth
  )

  const idleTrackLeftHandRot = new QuaternionKeyframeTrack(
    map.leftHandTarget.name + '.quaternion',
    [0, 1, 2],
    [0, 0, 0.6, 1, 0, 0, 0.7, 1, 0, 0, 0.6, 1],
    InterpolateSmooth
  )

  const idleTrackRightLeg = new VectorKeyframeTrack(
    map.rightFootTarget.name + '.position',
    [0, 1, 2],
    [-0.1, -0.8, -0.2, -0.1, -0.8, -0.225, -0.1, -0.8, -0.2],
    InterpolateSmooth
  )

  const idleTrackLeftLeg = new VectorKeyframeTrack(
    map.leftFootTarget.name + '.position',
    [0, 1, 2],
    [0.1, -0.8, 0, 0.1, -0.8, 0.01, 0.1, -0.8, 0],
    InterpolateSmooth
  )

  const clip = new AnimationClip('idleTrack', 2, [
    idleTrackRightHand,
    idleTrackRightHandRot,
    idleTrackLeftHand,
    idleTrackLeftHandRot,
    idleTrackRightLeg,
    idleTrackLeftLeg
  ])
  return clip
}

export const getWalkForwardPose = (map: ikTargets) => {
  const state = getState(AnimationManager)

  const walkTrackLeftLeg = new VectorKeyframeTrack(
    map.leftFootTarget.name + '.position',
    [0, 0.5, 1],
    [-0.1, -0.8, 0, -0.1, -0.4, 0, -0.1, -0.8, 0],
    InterpolateSmooth
  )

  const walkTrackRightLeg = new VectorKeyframeTrack(
    map.rightFootTarget.name + '.position',
    [1, 1.5, 2],
    [0.1, -0.8, 0, 0.1, -0.4, 0, 0.1, -0.8, 0],
    InterpolateSmooth
  )

  const clip = new AnimationClip('walkForwardTrack', 2, [walkTrackLeftLeg, walkTrackRightLeg])
  return clip
}
