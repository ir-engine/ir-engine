import { CharacterAnimations } from './CharacterAnimations'
import { AnimationActionLoopStyles } from 'three'

export interface CharacterAvatarData {
  id: string
  title: string
  src: string
  height?: number
  animations?: { [key: number]: AnimationConfigInterface }
  /**
   * default - animations from Animations.glb
   * own - animations from avatar file
   */
  animationsSource?: 'default' | 'own'
}

export interface AnimationConfigInterface {
  name: string
  loop?: AnimationActionLoopStyles
}

export const defaultAvatarAnimations: { [key: number]: AnimationConfigInterface } = {
  [CharacterAnimations.IDLE]: { name: 'idle' },
  [CharacterAnimations.JUMP]: { name: 'jump' },
  [CharacterAnimations.RUN_FORWARD]: { name: 'run_forward' },
  [CharacterAnimations.RUN_BACKWARD]: { name: 'run_backward' },
  [CharacterAnimations.RUN_STRAFE_RIGHT]: { name: 'run_right' },
  [CharacterAnimations.RUN_STRAFE_LEFT]: { name: 'run_left' },
  [CharacterAnimations.WALK_FORWARD]: { name: 'walk_forward' },
  [CharacterAnimations.WALK_BACKWARD]: { name: 'walk_backward' },
  [CharacterAnimations.WALK_STRAFE_RIGHT]: { name: 'walk_right' },
  [CharacterAnimations.WALK_STRAFE_LEFT]: { name: 'walk_left' },

  // TODO: These aren't in the animation file currently
  [CharacterAnimations.FALLING]: { name: 'falling' },
  [CharacterAnimations.FALLING_LONG]: { name: 'falling' },
  [CharacterAnimations.DROP]: { name: 'falling_to_land' },
  [CharacterAnimations.DROP_ROLLING]: { name: 'falling_to_roll' }
}
