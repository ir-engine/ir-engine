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

//Programatic keyframe placement for complex animations is horrible and NOT scalable
//To be replaced with keyframes from ik target glb
//For now programmatic keyframe placement makes debugging easier
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
    [0.1, -0.8, -0.2, 0.1, -0.8, -0.225, 0.1, -0.8, -0.2],
    InterpolateSmooth
  )

  const idleTrackLeftLeg = new VectorKeyframeTrack(
    state.ikTargetsMap.leftFootTarget.name + '.position',
    [0, 1, 2],
    [-0.1, -0.8, 0, -0.1, -0.8, 0.01, -0.1, -0.8, 0],
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
  const state = getState(animationManager)

  const walkTrackLeftLeg = new VectorKeyframeTrack(
    state.ikTargetsMap.leftFootTarget.name + '.position',
    [0, 0.5, 1],
    [-0.1, -0.8, 0, -0.1, -0.4, 0, -0.1, -0.8, 0],
    InterpolateSmooth
  )

  const walkTrackRightLeg = new VectorKeyframeTrack(
    state.ikTargetsMap.rightFootTarget.name + '.position',
    [1, 1.5, 2],
    [0.1, -0.8, 0, 0.1, -0.4, 0, 0.1, -0.8, 0],
    InterpolateSmooth
  )

  const clip = new AnimationClip('walkForwardTrack', 2, [walkTrackLeftLeg, walkTrackRightLeg])
  return clip
}
