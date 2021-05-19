import { AnimationConfigInterface } from "./AnimationConfigInterface";


export interface CharacterAvatarData {
  id: string;
  title: string;
  src: string;
  height?: number;
  animations?: { [key: number]: AnimationConfigInterface; };
  /**
   * default - animations from Animations.glb
   * vrm - animations from AnimationsVRM file
   * own - animations from avatar file
   */
  animationsSource?: 'default' | 'vrm' | 'own';
}
