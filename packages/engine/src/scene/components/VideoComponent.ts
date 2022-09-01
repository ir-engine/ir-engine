import type Hls from 'hls.js'
import { Mesh, MeshBasicMaterial } from 'three'

import { defineMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { PLANE_GEO } from './ImageComponent'

export type VideoComponentType = {
  mesh: Mesh<any, MeshBasicMaterial>
  elementId: string
  maintainAspectRatio: boolean
  hls?: Hls
}

export const VideoComponent = defineMappedComponent('VideoComponent')
  .withData(() => {
    return {
      ...SCENE_COMPONENT_VIDEO_DEFAULT_VALUES,
      mesh: new Mesh(PLANE_GEO, new MeshBasicMaterial())
    } as VideoComponentType
  })
  .build()

export const SCENE_COMPONENT_VIDEO = 'video'
export const VIDEO_MESH_NAME = 'VideoMesh'
export const SCENE_COMPONENT_VIDEO_DEFAULT_VALUES = {
  elementId: 'video-' + Date.now(),
  maintainAspectRatio: true
} as VideoComponentType
