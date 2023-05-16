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
import { ikTargets } from '../components/AvatarAnimationComponent'

//Programatic keyframe placement for complex animations is not scalable
//Used here for an idle pose experimentally
export const getIdlePose = (map: ikTargets) => {
  const state = getState(animationManager)

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
  const state = getState(animationManager)

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
