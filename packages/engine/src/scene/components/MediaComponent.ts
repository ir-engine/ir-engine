import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { PlayMode } from '../constants/PlayMode'

export type MediaComponentType = {
  /** scene data properties */
  paths: string[]
  playMode: PlayMode
  controls: boolean
  autoplay: boolean
  autoStartTime: number

  /** runtime properties */
  playing: boolean
  currentSource: number
  // TODO replace startTimer with accumulator
  startTimer: any
  stopOnNextTrack: boolean
}

export const MediaComponent = createMappedComponent<MediaComponentType>('MediaComponent')
