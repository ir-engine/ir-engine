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

import { VRMHumanBone } from '@pixiv/three-vrm'
import {
  AnimationAction,
  AnimationActionLoopStyles,
  AnimationClip,
  KeyframeTrack,
  Quaternion,
  SkinnedMesh,
  Vector3
} from 'three'

import config from '@etherealengine/common/src/config'
import { matches, matchesVector3 } from '../../common/functions/MatchesUtils'

export const ikTargets = {
  rightHand: 'rightHand',
  leftHand: 'leftHand',
  rightFoot: 'rightFoot',
  leftFoot: 'leftFoot',
  head: 'head',
  hips: 'hips',

  rightElbowHint: 'rightElbowHint',
  leftElbowHint: 'leftElbowHint',
  rightKneeHint: 'rightKneeHint',
  leftKneeHint: 'leftKneeHint'
}

export const animationStates = {
  dance1: 'dance1',
  dance2: 'dance2',
  dance3: 'dance3',
  dance4: 'dance4',
  clap: 'clap',
  wave: 'wave',
  kiss: 'kiss',
  cry: 'cry',
  laugh: 'laugh',
  defeat: 'defeat',
  locomotion: 'locomotion',
  falling: 'falling'
}

export const defaultAnimationPath = `${config.client.fileServer}/projects/default-project/assets/animations/`

export const matchesIkTarget = matches.some(
  ...Object.keys(ikTargets).map((k: keyof typeof ikTargets) => matches.literal(k))
)

const matchesMovementType = matches.shape({
  /** Velocity of the avatar */
  velocity: matchesVector3,
  /** Distance from the ground of the avatar */
  distanceFromGround: matches.number
})

/** Type of movement of the avatar in any given frame */
export type MovementType = typeof matchesMovementType._TYPE

/** Animation type */
export enum AnimationType {
  /** Static will be rendered on demand */
  STATIC,

  /** This type of animation will be rendred based on the velocity of the avatar */
  VELOCITY_BASED
}

/** Type of calculate weights method parameters */
export const matchesWeightsParameters = matches.partial({
  movement: matchesMovementType,
  resetAnimation: matches.boolean,
  forceTransition: matches.boolean
})

export type WeightsParameterType = {
  /** Movement of the avatar in the frame */
  movement?: MovementType

  /** Whether reset currrent playing animation. Useful while intra state transition */
  resetAnimation?: boolean

  /** Skip validation check and force state transition */
  forceTransition?: boolean

  /** Other data to be passed with */
  [key: string]: any
}

/** Interface to hold animation details */
export interface Animation {
  /** Name of the animation which must match with the loaded animations */
  name: string

  /** Weight of this animation */
  weight: number

  /** Weight when transition will start. Value will be used to interpolate */
  transitionStartWeight: number

  /** Weight when transition will end. Value will be used to interpolate */
  transitionEndWeight: number

  /** Type of the loop */
  loopType: AnimationActionLoopStyles

  /** Total loop counts */
  loopCount: number

  /** Time scale of the animation. Default is 1. Value less then 1 will slow down the animation. */
  timeScale: number

  /** Animation clip from the loaded animations */
  clip: AnimationClip

  /** Animation action for this animation */
  action: AnimationAction

  /** A Decorator function to apply custom behaviour to the animation action */
  decorateAction: (action: AnimationAction) => void
}

export function mapPositionTrackToDistanceTrack(track: KeyframeTrack, rot: Quaternion, scale: Vector3) {
  const { times, values } = track

  const distTrack = { times: times, values: new Float32Array(times.length) }

  if (!times.length) {
    return distTrack
  }

  const startPos = new Vector3()
  const vec1 = new Vector3()

  startPos.set(values[0], values[1], values[2]).applyQuaternion(rot).multiply(scale)
  startPos.y = 0

  times.forEach((time, i) => {
    const j = i * 3
    vec1
      .set(values[j], values[j + 1], values[j + 2])
      .applyQuaternion(rot)
      .multiply(scale)
    vec1.y = 0

    distTrack.values[i] = vec1.sub(startPos).length()
  })

  return distTrack
}

export function findAnimationClipTrack(animation: AnimationClip, objName: string, attr: string) {
  const trackName = `${objName}.${attr}`
  return animation.tracks.find((track) => track.name === trackName)!
}

export const computeRootAnimationVelocity = (track: KeyframeTrack, quat: Quaternion, scale: Vector3) => {
  return computeRootAnimationDistance(track, quat, scale) / getTrackDuration(track)
}

const getTrackDuration = (track: KeyframeTrack) => {
  return track.times[track.times.length - 1]
}

const computeRootAnimationDistance = (track: KeyframeTrack, quat: Quaternion, scale: Vector3) => {
  const rootVec = computeRootMotionVector(track)
  rootVec.applyQuaternion(quat).multiply(scale)
  rootVec.y = 0
  return rootVec.length()
}

const computeRootMotionVector = (track: KeyframeTrack) => {
  const startPos = new Vector3(),
    endPos = new Vector3(),
    values = track.values,
    length = values.length

  startPos.set(values[0], values[1], values[2])
  endPos.set(values[length - 3], values[length - 2], values[length - 1])

  return endPos.sub(startPos)
}

export function findRootBone(skinnedMesh: SkinnedMesh) {
  return skinnedMesh.skeleton.bones.find((obj) => obj.parent?.type !== 'Bone')
}

export const processRootAnimation = (clip: AnimationClip, rootBone: VRMHumanBone | undefined): any => {
  if (!rootBone || !clip || !clip.name.endsWith('root')) return null

  const meshQuat = new Quaternion(),
    meshScale = new Vector3()
  meshScale.setScalar(1)

  const posTrack = findAnimationClipTrack(clip, rootBone.node.name, 'position')
  const velocity = computeRootAnimationVelocity(posTrack, meshQuat, meshScale)
  const distTrack = mapPositionTrackToDistanceTrack(posTrack, meshQuat, meshScale)

  return {
    velocity: velocity,
    distanceTrack: distTrack
  }
}
