import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { PlayMode } from '../constants/PlayMode'

export type MediaComponentType = {
  /** scene data properties */
  paths: string[]
  playMode: PlayMode
  currentSource: number
  playing: boolean
  controls: boolean
  autoplay: boolean

  /** runtime properties */
  autoStartTime: number
  startTimer: any
  el: HTMLMediaElement
  stopOnNextTrack: boolean
}

export const MediaComponent = createMappedComponent<MediaComponentType>('MediaComponent')
