import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

/** Component class for background music. */
export type BackgroundMusicType = {
  /** Audio track container. */
  audio: any
  /** Source of the audio track. */
  src: any
  /** Volumne of the sound track. **Default** value is 0.5. */
  volume: number
}

export const BackgroundMusic = createMappedComponent<BackgroundMusicType>('BackgroundMusic')
