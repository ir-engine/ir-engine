import matches from 'ts-matches'
import {
  AnimationAction,
  AnimationActionLoopStyles,
  AnimationClip,
  Vector3,
  Quaternion,
  SkinnedMesh,
  Bone
} from 'three'
import { matchesVector3 } from '../../ecs/functions/Action'
import { lerp } from '../../common/functions/MathLerpFunctions'

/** State of the avatar animation */

export const AvatarStates = {
  DEFAULT: 'DEFAULT',
  IDLE: 'IDLE',
  WALK: 'WALK',
  RUN: 'RUN',
  JUMP: 'JUMP',
  INTERACTING: 'INTERACTING',
  EMOTE: 'EMOTE',
  LOOPABLE_EMOTE: 'LOOPABLE_EMOTE',

  LOCOMOTION: 'Locomotion'
}

export const matchesAvatarState = matches.some(
  ...Object.keys(AvatarStates).map((k: keyof typeof AvatarStates) => matches.literal(k))
)

export const AvatarAnimations = {
  // Jump and falling
  JUMP: 'jump',
  FALLING: 'falling',
  LANDING_AFTER_FALL: 'falling_to_land',
  ROLLING_AFTER_FALL: 'falling_to_roll',

  // Walking and running
  IDLE: 'idle',
  FALLING_LONG: 'abcd',
  WALK_FORWARD: 'walk_forward',
  WALK_FORWARD_ROOT: 'walk_forward_root',
  WALK_BACKWARD: 'walk_backward',
  WALK_STRAFE_RIGHT: 'walk_right',
  WALK_STRAFE_LEFT: 'walk_left',
  RUN_FORWARD: 'run_forward',
  RUN_FORWARD_ROOT: 'run_forward_root',
  RUN_BACKWARD: 'run_backward',
  RUN_STRAFE_RIGHT: 'run_right',
  RUN_STRAFE_LEFT: 'run_left',

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

export function mapPositionTrackToDistanceTrack(track, rot: Quaternion, scale: Vector3) {
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

export function findAnimationClipTrack(animation, objName: string, attr: string) {
  const trackName = `${objName}.${attr}`
  return animation.tracks.find((track) => track.name === trackName)
}

export const computeRootAnimationVelocity = (track, quat: Quaternion, scale: Vector3) => {
  return computeRootAnimationDistance(track, quat, scale) / getTrackDuration(track)
}

const getTrackDuration = (track) => {
  return track.times[track.times.length - 1]
}

const computeRootAnimationDistance = (track, quat, scale) => {
  const rootVec = computeRootMotionVector(track)
  rootVec.applyQuaternion(quat).multiply(scale)
  rootVec.y = 0
  return rootVec.length()
}

const computeRootMotionVector = (track) => {
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

export const getMaxDistanceFromDistanceTrack = (track) => track.values[track.values.length - 1]

export const findTimeFromDistanceTrack = (track, distance) => {
  const values = track.values,
    times = track.times

  let first = 1,
    last = track.times.length - 1,
    count = last - first

  while (count > 0) {
    const step = Math.floor(count / 2),
      middle = first + step

    if (distance > values[middle]) {
      first = middle + 1
      count -= step + 1
    } else {
      count = step
    }
  }

  const distA = values[first - 1],
    distB = values[first],
    diff = distB - distA,
    alpha = diff < 0.00001 ? 0.0 : (distance - distA) / diff

  return lerp(times[first - 1], times[first], alpha)
}

export const findDistanceFromDistanceTrack = (track, time) => {
  const values = track.values,
    times = track.times

  let first = 1,
    last = track.times.length - 1,
    count = last - first

  while (count > 0) {
    const step = Math.floor(count / 2),
      middle = first + step

    if (time > times[middle]) {
      first = middle + 1
      count -= step + 1
    } else {
      count = step
    }
  }

  const timeA = times[first - 1],
    timeB = times[first],
    diff = timeB - timeA,
    alpha = diff < 0.00001 ? 0.0 : (time - timeA) / diff

  return lerp(values[first - 1], values[first], alpha)
}
