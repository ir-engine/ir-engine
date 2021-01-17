import { CharacterAnimationsIds } from "./CharacterAnimationsIds";

export interface CharacterAvatarData {
  id: string;
  title: string;
  src: string;
  height?: number;
  animations?: {[key:number]: string}
}

export const defaultAvatarAnimations: {[key:number]: string} = {
  [CharacterAnimationsIds.IDLE]: 'idle',
  [CharacterAnimationsIds.JUMP]: 'jump',
  [CharacterAnimationsIds.JUMP_RUNNING]: 'falling',
  [CharacterAnimationsIds.DROP]: 'drop',
  [CharacterAnimationsIds.DROP_ROLLING]: 'sb_drop_running_roll',
  [CharacterAnimationsIds.WALK_FORWARD]: 'walk',
  [CharacterAnimationsIds.WALK_BACKWARD]: 'walking_backward',
  [CharacterAnimationsIds.WALK_STRAFE_RIGHT]: 'walk_right',
  [CharacterAnimationsIds.WALK_STRAFE_LEFT]: 'walk_left',
  [CharacterAnimationsIds.RUN_FORWARD]: 'run_forward',
  [CharacterAnimationsIds.RUN_BACKWARD]: 'run_backward',
  [CharacterAnimationsIds.RUN_STRAFE_RIGHT]: 'run_left',
  [CharacterAnimationsIds.RUN_STRAFE_LEFT]: 'run_left',
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
  // {
  //   id: "VRMAvatar",
  //   title: "VRMAvatar",
  //   src: "/models/vrm/three-vrm-girl.vrm"
  // }
];