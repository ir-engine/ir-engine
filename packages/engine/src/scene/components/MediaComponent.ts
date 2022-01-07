import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type MediaComponentType = {
  controls: boolean
  autoplay: boolean
  autoStartTime: number
  loop: boolean
  startTimer?: any
}

export const MediaComponent = createMappedComponent<MediaComponentType>('MediaComponent')
