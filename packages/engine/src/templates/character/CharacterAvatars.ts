import { CharacterAnimations } from "./CharacterAnimations";
import { AnimationActionLoopStyles, LoopOnce } from 'three';

export interface CharacterAvatarData {
  id: string;
  title: string;
  src: string;
  height?: number;
  animations?: {[key:number]: AnimationConfigInterface};
  /**
   * default - animations from Animations.glb
   * vrm - animations from AnimationsVRM file
   * own - animations from avatar file
   */
  animationsSource?: 'default'|'vrm'|'own'
}

export interface AnimationConfigInterface {
  name: string
  loop?: AnimationActionLoopStyles
}

export const defaultAvatarAnimations: {[key:number]: AnimationConfigInterface} = {
  [CharacterAnimations.IDLE]: { name: 'idle' },
  [CharacterAnimations.JUMP]: { name: 'jump' },
  [CharacterAnimations.FALLING]: { name: 'falling' },
  [CharacterAnimations.FALLING_LONG]: { name: 'falling' },
  [CharacterAnimations.DROP]: { name: 'falling_to_land' },
  [CharacterAnimations.DROP_ROLLING]: { name: 'falling_to_roll' },
  [CharacterAnimations.WALK_FORWARD]: { name: 'walking' },
  [CharacterAnimations.WALK_BACKWARD]: { name: 'walking_backward' },
  [CharacterAnimations.WALK_STRAFE_RIGHT]: { name: 'walk_right' },
  [CharacterAnimations.WALK_STRAFE_LEFT]: { name: 'walk_left' },
  [CharacterAnimations.RUN_FORWARD]: { name: 'run_forward' },
  [CharacterAnimations.RUN_BACKWARD]: { name: 'run_backward' },
  [CharacterAnimations.RUN_STRAFE_RIGHT]: { name: 'run_right' },
  [CharacterAnimations.RUN_STRAFE_LEFT]: { name: 'run_left' },
  [CharacterAnimations.DRIVING]: { name: 'driving' },
  [CharacterAnimations.ENTERING_VEHICLE]: { name: 'entering_car', loop: LoopOnce },
  [CharacterAnimations.EXITING_VEHICLE]: { name: 'exiting_car', loop: LoopOnce },
};
