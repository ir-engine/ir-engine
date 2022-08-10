import {
  AnimationAction,
  AnimationActionLoopStyles,
  AnimationClip,
  Bone,
  KeyframeTrack,
  Quaternion,
  SkinnedMesh,
  Vector3
} from 'three'

import { matches, matchesVector3 } from '../../common/functions/MatchesUtils'

/** State of the avatar animation */

export const AvatarStates = {
  LOCOMOTION: 'LOCOMOTION' as const,
  JUMP_UP: 'JUMP_UP' as const,
  JUMP_DOWN: 'JUMP_DOWN' as const,
  FALL_IDLE: 'FALL_IDLE' as const,
  //Emotes
  CLAP: 'CLAP' as const,
  CRY: 'CRY' as const,
  KISS: 'KISS' as const,
  WAVE: 'WAVE' as const,
  LAUGH: 'LAUGH' as const,
  DEFEAT: 'DEFEAT' as const,
  DANCE1: 'DANCE1' as const,
  DANCE2: 'DANCE2' as const,
  DANCE3: 'DANCE3' as const,
  DANCE4: 'DANCE4' as const,

  // Mount Point
  SIT_ENTER: 'SIT_ENTER' as const,
  SIT_LEAVE: 'SIT_LEAVE' as const,
  SIT_IDLE: 'SIT_IDLE' as const
}

export const matchesAvatarState = matches.some(
  ...Object.keys(AvatarStates).map((k: keyof typeof AvatarStates) => matches.literal(k))
)

export const AvatarAnimations = {
  // Jump and falling
  JUMP_UP: 'jump_up',
  JUMP_DOWN: 'jump_down',
  FALL_IDLE: 'falling_idle',

  // Walking and running
  // TODO: Probably can remove non-root
  // locomotion animations to save some bandwith
  IDLE: 'idle',
  FALLING_LONG: 'abcd',
  WALK_FORWARD: 'walk_forward',
  WALK_FORWARD_ROOT: 'walk_forward_root',
  WALK_BACKWARD: 'walk_backward',
  WALK_BACKWARD_ROOT: 'walk_backward_root',
  WALK_STRAFE_RIGHT: 'walk_right',
  WALK_STRAFE_RIGHT_ROOT: 'walk_right_root',
  WALK_STRAFE_LEFT: 'walk_left',
  WALK_STRAFE_LEFT_ROOT: 'walk_left_root',
  RUN_FORWARD: 'run_forward',
  RUN_FORWARD_ROOT: 'run_forward_root',
  RUN_BACKWARD: 'run_backward',
  RUN_BACKWARD_ROOT: 'run_backward_root',
  RUN_STRAFE_RIGHT: 'run_right',
  RUN_STRAFE_RIGHT_ROOT: 'run_right_root',
  RUN_STRAFE_LEFT: 'run_left',
  RUN_STRAFE_LEFT_ROOT: 'run_left_root',

  // Emotes
  CLAP: 'clapping',
  DANCING_1: 'dance1',
  DANCING_2: 'dance2',
  DANCING_3: 'dance3',
  DANCING_4: 'dance4',
  LAUGH: 'laugh',
  WAVE: 'wave',
  KISS: 'kiss',
  DEFEAT: 'defeat',
  PAUSE: 'pause',
  CRY: 'cry'
}

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

export const processRootAnimation = (clip: AnimationClip, rootBone: Bone | undefined): any => {
  if (!rootBone || !clip || !clip.name.endsWith('root')) return null

  const meshQuat = new Quaternion(),
    meshScale = new Vector3()
  meshScale.setScalar(1)

  const posTrack = findAnimationClipTrack(clip, rootBone.name, 'position')
  const velocity = computeRootAnimationVelocity(posTrack, meshQuat, meshScale)
  const distTrack = mapPositionTrackToDistanceTrack(posTrack, meshQuat, meshScale)

  return {
    velocity: velocity,
    distanceTrack: distTrack
  }
}
