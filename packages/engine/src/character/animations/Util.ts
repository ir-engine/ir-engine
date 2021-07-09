import { AnimationAction, AnimationActionLoopStyles, AnimationClip, Vector3 } from 'three'

/** State of the character animation */
export const CharacterStates = {
  DEFAULT: 'DEFAULT',
  IDLE: 'IDLE',
  WALK: 'WALK',
  RUN: 'RUN',
  JUMP: 'JUMP',
  INTERACTING: 'INTERACTING',
  ENTERING_VEHICLE: 'ENTERING_VEHICLE',
  EXITING_VEHICLE: 'EXITING_VEHICLE',
  EMOTE: 'EMOTE',
  LOOPABLE_EMOTE: 'LOOPABLE_EMOTE'
}

export const CharacterAnimations = {
  // Jump and falling
  JUMP: 'jump',
  FALLING: 'falling',
  LANDING_AFTER_FALL: 'falling_to_land',
  ROLLING_AFTER_FALL: 'falling_to_roll',

  // Driving
  DRIVING: 'driving',
  ENTERING_VEHICLE_DRIVER: 'vehicle_enter_driver',
  EXITING_VEHICLE_DRIVER: 'vehicle_exit_driver',
  ENTERING_VEHICLE_PASSENGER: 'vehicle_enter_passenger',
  EXITING_VEHICLE_PASSENGER: 'vehicle_exit_passenger',

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

/** Type of movement of the character in any given frame */
export interface MovementType {
  /** Velocity of the character */
  velocity: Vector3

  /** Distance from the ground of the character */
  distanceFromGround: number
}

/** Animation type */
export enum AnimationType {
  /** Static will be rendered on demand */
  STATIC,

  /** This type of animation will be rendred based on the velocity of the character */
  VELOCITY_BASED,
}

/** Type of calculate weights method parameters */
export interface CalculateWeightsParams {
  /** Movement of the character in the frame */
  movement?: MovementType

  /** Whether the weight are calculated at the time of mounting */
  isMounting?: boolean

  /** Whether reset currrent playing animation */
  resetAnimation?: boolean

  /** Other data to be passed with */
  [key: string]: any
}

/** Interface to hold animation details */
export interface Animation {
  /** Name of the animation which must match with the loaded animations */
  name: string

  /** Weight of this animation */
  weight: number

  /** Weigth at the time of unmounting process started */
  weightWhenUnmount?: number

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
