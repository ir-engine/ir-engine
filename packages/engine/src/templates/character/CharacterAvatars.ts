import { CharacterAnimationsIds } from "./CharacterAnimationsIds";
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
  [CharacterAnimationsIds.IDLE]: { name: 'idle' },
  [CharacterAnimationsIds.IDLE_ROTATE_RIGHT]: { name: 'turn_right' },
  [CharacterAnimationsIds.IDLE_ROTATE_LEFT]: { name: 'left_turn' },
  [CharacterAnimationsIds.JUMP]: { name: 'jump_up', loop: LoopOnce },
  [CharacterAnimationsIds.JUMP_RUNNING]: { name: 'jump', loop: LoopOnce },
  [CharacterAnimationsIds.FALLING]: { name: 'falling' },
  [CharacterAnimationsIds.FALLING_LONG]: { name: 'falling' },
  [CharacterAnimationsIds.DROP]: { name: 'falling_to_land' },
  [CharacterAnimationsIds.DROP_ROLLING]: { name: 'falling_to_roll' },
  [CharacterAnimationsIds.WALK_FORWARD]: { name: 'walking' },
  [CharacterAnimationsIds.WALK_BACKWARD]: { name: 'walking_backward' },
  [CharacterAnimationsIds.WALK_STRAFE_RIGHT]: { name: 'walk_right' },
  [CharacterAnimationsIds.WALK_STRAFE_LEFT]: { name: 'walk_left' },
  [CharacterAnimationsIds.RUN_FORWARD]: { name: 'run_forward' },
  [CharacterAnimationsIds.RUN_BACKWARD]: { name: 'run_backward' },
  [CharacterAnimationsIds.RUN_STRAFE_RIGHT]: { name: 'run_right' },
  [CharacterAnimationsIds.RUN_STRAFE_LEFT]: { name: 'run_left' },
  [CharacterAnimationsIds.DRIVING]: { name: 'driving' },
  [CharacterAnimationsIds.ENTERING_CAR]: { name: 'entering_car', loop: LoopOnce },
  [CharacterAnimationsIds.EXITING_CAR]: { name: 'exiting_car', loop: LoopOnce },
};

export const CharacterAvatars: CharacterAvatarData[] = [
  {
    id: "Allison",
    title: "Allison",
    src: "/models/avatars/Allison.glb",
    animations: defaultAvatarAnimations
  },
  {
    id: "Andy",
    title: "Andy",
    src: "/models/avatars/Andy.glb"
  },
  {
    id: "Erik",
    title: "Erik",
    src: "/models/avatars/Erik.glb"
  },
  {
    id: "Geoff",
    title: "Geoff",
    src: "/models/avatars/Geoff.glb"
  },
  {
    id: "Jace",
    title: "Jace",
    src: "/models/avatars/Jace.glb"
  },
  {
    id: "Rose",
    title: "Rose",
    src: "/models/avatars/Rose.glb"
  },
  {
    id: "VRMAvatar",
    title: "VRMAvatar",
    src: "/models/vrm/three-vrm-girl.vrm",
    animationsSource: "vrm"
  }
];