import { AnimationAction, AnimationActionLoopStyles, AnimationClip, Vector3 } from 'three'

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
  // CHEERING_1: 'cheering_1',
  // CHEERING_2: 'cheering_2',
  // CLAPPING: 'clapping',
  DANCING_1: 'dance1',
  DANCING_2: 'dance2',
  DANCING_3: 'dance3',
  DANCING_4: 'dance4'
  // LAUGHING: 'laughing',
  // WAVE_LEFT: 'wave_left',
  // WAVE_RIGHT: 'wave_right',
}

/** Type of movement of the avatar in any given frame */
export type MovementType = {
  /** Velocity of the avatar */
  velocity: Vector3

  /** Distance from the ground of the avatar */
  distanceFromGround: number
}

/** Animation type */
export enum AnimationType {
  /** Static will be rendered on demand */
  STATIC,

  /** This type of animation will be rendred based on the velocity of the avatar */
  VELOCITY_BASED
}

/** Type of calculate weights method parameters */
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
  transitionStartWeight?: number

  /** Weight when transition will end. Value will be used to interpolate */
  transitionEndWeight?: number

  /** Type of the loop */
  loopType: AnimationActionLoopStyles

  /** Total loop counts */
  loopCount?: number

  /** Time scale of the animation. Default is 1. Value less then 1 will slow down the animation. */
  timeScale?: number

  /** Animation clip from the loaded animations */
  clip?: AnimationClip

  /** Animation action for this animation */
  action?: AnimationAction

  /** A Decorator function to apply custom behaviour to the animation action */
  decorateAction?: (action: AnimationAction) => void
}
