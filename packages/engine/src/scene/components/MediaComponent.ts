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

export const SCENE_COMPONENT_MEDIA = 'media'
export const SCENE_COMPONENT_MEDIA_DEFAULT_VALUES = {
  controls: false,
  autoplay: false,
  autoStartTime: 0,
  paths: [],
  playMode: PlayMode.Loop
} as Partial<MediaComponentType>
