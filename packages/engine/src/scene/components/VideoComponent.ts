import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type VideoComponentType = {
  videoSource: string
  isLiveStream: boolean
  elementId: string
}

export const VideoComponent = createMappedComponent<VideoComponentType>('VideoComponent')
