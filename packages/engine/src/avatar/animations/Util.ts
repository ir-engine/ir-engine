import matches from 'ts-matches'
import { AnimationAction, AnimationActionLoopStyles, AnimationClip, Vector3 } from 'three'
import { matchesVector3 } from '../../ecs/functions/Action'

/** State of the avatar animation */

export const AvatarStates = {
  DEFAULT: 'DEFAULT',
  IDLE: 'IDLE',
  WALK: 'WALK',
  RUN: 'RUN',
  JUMP: 'JUMP',
  INTERACTING: 'INTERACTING',
  EMOTE: 'EMOTE',
  LOOPABLE_EMOTE: 'LOOPABLE_EMOTE'
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
  WALK_BACKWARD: 'walk_backward',
  WALK_STRAFE_RIGHT: 'walk_right',
  WALK_STRAFE_LEFT: 'walk_left',
  RUN_FORWARD: 'run_forward',
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
