import { CharacterStateTypes } from "./CharacterStateTypes";
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
  [CharacterStateTypes.IDLE]: { name: 'idle' },
  [CharacterStateTypes.JUMP]: { name: 'jump_up', loop: LoopOnce },
  [CharacterStateTypes.FALLING]: { name: 'falling' },
  [CharacterStateTypes.FALLING_LONG]: { name: 'falling' },
  [CharacterStateTypes.DROP]: { name: 'falling_to_land' },
  [CharacterStateTypes.DROP_ROLLING]: { name: 'falling_to_roll' },
  [CharacterStateTypes.WALK_FORWARD]: { name: 'walking' },
  [CharacterStateTypes.WALK_BACKWARD]: { name: 'walking_backward' },
  [CharacterStateTypes.WALK_STRAFE_RIGHT]: { name: 'walk_right' },
  [CharacterStateTypes.WALK_STRAFE_LEFT]: { name: 'walk_left' },
  [CharacterStateTypes.RUN_FORWARD]: { name: 'run_forward' },
  [CharacterStateTypes.RUN_BACKWARD]: { name: 'run_backward' },
  [CharacterStateTypes.RUN_STRAFE_RIGHT]: { name: 'run_right' },
  [CharacterStateTypes.RUN_STRAFE_LEFT]: { name: 'run_left' },
  [CharacterStateTypes.DRIVING]: { name: 'driving' },
  [CharacterStateTypes.ENTERING_CAR]: { name: 'entering_car', loop: LoopOnce },
  [CharacterStateTypes.EXITING_CAR]: { name: 'exiting_car', loop: LoopOnce },
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