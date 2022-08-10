import type Hls from 'hls.js'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type VideoComponentType = {
  elementId: string
  maintainAspectRatio: boolean
  hls?: Hls
}

export const VideoComponent = createMappedComponent<VideoComponentType>('VideoComponent')
