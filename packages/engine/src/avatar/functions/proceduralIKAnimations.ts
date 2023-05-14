import {
  AnimationClip,
  InterpolateSmooth,
  InterpolationModes,
  QuaternionKeyframeTrack,
  Vector3,
  VectorKeyframeTrack
} from 'three'

import { getState } from '@etherealengine/hyperflux'

import { Entity } from '../../ecs/classes/Entity'
import { animationManager } from '../AnimationManager'

export const getIdlePose = () => {
  const state = getState(animationManager)

  //tentatively, space is local relative to the hips
  const idleTrackRightHand = new VectorKeyframeTrack(
    state.ikTargetsMap.rightHandTarget.name + '.position',
    [0, 1, 2],
    [0.175, 0, 0, 0.175, 0.01, 0, 0.175, 0, 0],
    InterpolateSmooth
  )

  const idleTrackRightHandRot = new QuaternionKeyframeTrack(
    state.ikTargetsMap.rightHandTarget.name + '.quaternion',
    [0, 1, 2],
    [0, 0, -0.6, 1, 0, 0, -0.7, 1, 0, 0, -0.6, 1],
    InterpolateSmooth
  )

  const idleTrackLeftHand = new VectorKeyframeTrack(
    state.ikTargetsMap.leftHandTarget.name + '.position',
    [0, 1, 2],
    [-0.175, 0, 0, -0.175, 0.01, 0, -0.175, 0, 0],
    InterpolateSmooth
  )

  const idleTrackLeftHandRot = new QuaternionKeyframeTrack(
    state.ikTargetsMap.leftHandTarget.name + '.quaternion',
    [0, 1, 2],
    [0, 0, 0.6, 1, 0, 0, 0.7, 1, 0, 0, 0.6, 1],
    InterpolateSmooth
  )

  const idleTrackRightLeg = new VectorKeyframeTrack(
    state.ikTargetsMap.rightFootTarget.name + '.position',
    [0, 1, 2],
    [0.1, -0.7, -0.2, 0.1, -0.4, -0.2, 0.1, -0.7, -0.2],
    InterpolateSmooth
  )

  const idleTrackLeftLeg = new VectorKeyframeTrack(
    state.ikTargetsMap.leftFootTarget.name + '.position',
    [0, 1, 2],
    [-0.1, -1, 0, -0.1, -1, 0.01, -0.1, -1, 0],
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

export const getWalkForwardPose = () => {
  const clip = new AnimationClip('walkForwardTrack', 1)
  return clip
}
