import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type SoundEffectType = {
  /** Audio track container. */
  audio: any[]
  /** Source of the audio track. */
  src: any[]
}

export const SoundEffect = createMappedComponent<SoundEffectType>()
