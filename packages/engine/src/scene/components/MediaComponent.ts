import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { PlayMode } from '../constants/PlayMode'

export type MediaComponentType = {
  paths: string[]
  playMode: PlayMode
  playing: boolean
  controls: boolean
  autoplay: boolean
  loop: boolean
  autoStartTime?: number
  startTimer?: any
  el?: HTMLMediaElement
}

export const MediaComponent = createMappedComponent<MediaComponentType>('MediaComponent')
