import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type PlaySoundEffectType = {
  /** Audio track index to play. */
  index: number
}

export const PlaySoundEffect = createMappedComponent<PlaySoundEffectType>()
