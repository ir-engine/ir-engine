import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type MediaComponentType = {
  playing: boolean
  controls: boolean
  autoplay: boolean
  autoStartTime: number
  loop: boolean
  startTimer?: any
  el?: HTMLMediaElement
}

export const MediaComponent = createMappedComponent<MediaComponentType>('MediaComponent')
