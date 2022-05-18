import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type PlaySoundEffectType = {
  /** Audio track index to play. */
  index: number
  /** Volume of the track. */
  volume: number
}

export const PlaySoundEffect = createMappedComponent<PlaySoundEffectType>('PlaySoundEffect')
