import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type SoundEffectType = {
  /** Audio track container. */
  audio: any
  /** Source of the audio track. */
  src: any
  /** Volumne of the sound track. **Default** value is 0.5. */
  volume: number
}

export const SoundEffect = createMappedComponent<SoundEffectType>()
