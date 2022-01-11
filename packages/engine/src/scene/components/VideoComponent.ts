import Hls from 'hls.js'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type VideoComponentType = {
  videoSource: string
  elementId: string
  hls: Hls
}

export const VideoComponent = createMappedComponent<VideoComponentType>('VideoComponent')
