import { DoubleSide, Group, Mesh, MeshBasicMaterial, Side, Vector2 } from 'three'

import { hookstate } from '@xrengine/hyperflux'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'
import { ContentFitType } from '../../xrui/functions/ObjectFitFunctions'
import { PLANE_GEO } from './ImageComponent'

export const VideoComponent = defineComponent({
  name: 'EE_video',

  onAdd: (entity) => {
    const videoGroup = new Group()
    videoGroup.name = 'video-group'
    const videoMesh = new Mesh(PLANE_GEO, new MeshBasicMaterial())
    videoGroup.add(videoMesh)
    videoMesh.matrixAutoUpdate = false

    const state = hookstate({
      side: DoubleSide as Side,
      size: new Vector2(1, 1),
      fit: 'contain' as ContentFitType,
      mediaUUID: '',
      videoGroup,
      videoMesh
    })

    return state
  },

  toJSON: (entity, component) => {
    return {
      /**
       * An entity with with an attached MediaComponent;if an empty string, then the current entity is assumed
       */
      mediaUUID: '',
      side: component.side.value,
      size: component.size.value,
      fit: component.fit.value
    }
  },

  onUpdate: (entity, component, json) => {
    if (typeof json.mediaUUID === 'string') component.mediaUUID.set(json.mediaUUID)
    if (typeof json.side === 'number') component.side.set(json.side)
    if (json.size) component.size.set(new Vector2(json.size.x, json.size.y))
    if (json.fit) component.fit.set(json.fit)
  },

  onRemove: (entity, component) => {
    component.videoGroup.value.removeFromParent()
    component.videoMesh.value.material.map?.dispose()
  }
})

export const SCENE_COMPONENT_VIDEO = 'video'
