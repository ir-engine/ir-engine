import type Hls from 'hls.js'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type VideoComponentType = {
  elementId: string
  maintainAspectRatio: boolean
  hls?: Hls
}

export const VideoComponent = createMappedComponent<VideoComponentType>('VideoComponent')

export const SCENE_COMPONENT_VIDEO = 'video'
export const VIDEO_MESH_NAME = 'VideoMesh'
export const SCENE_COMPONENT_VIDEO_DEFAULT_VALUES = {
  elementId: 'video-' + Date.now(),
  maintainAspectRatio: true
} as VideoComponentType
