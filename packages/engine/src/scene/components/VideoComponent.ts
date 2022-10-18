import { useEffect } from 'react'
import { DoubleSide, Group, Mesh, MeshBasicMaterial, Side, Vector2 } from 'three'

import { hookstate, useState } from '@xrengine/hyperflux/functions/StateFunctions'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntityReactor } from '../../ecs/functions/EntityFunctions'
import { ContentFitType, ObjectFitFunctions } from '../../xrui/functions/ObjectFitFunctions'
import { addObjectToGroup } from './GroupComponent'
import { PLANE_GEO, resizeImageMesh } from './ImageComponent'

export const VideoComponent = defineComponent({
  name: 'EE_video',

  onAdd: (entity) => {
    const videoGroup = new Group()
    videoGroup.name = 'video-group'
    const videoMesh = new Mesh(PLANE_GEO, new MeshBasicMaterial())
    videoGroup.add(videoMesh)
    videoMesh.matrixAutoUpdate = false

    addObjectToGroup(entity, videoGroup)

    const state = hookstate({
      side: DoubleSide as Side,
      size: new Vector2(1, 1),
      fit: 'contain' as ContentFitType,
      mediaUUID: '',
      videoGroup,
      videoMesh
    })

    createEntityReactor(entity, () => {
      const s = useState(state)

      // update side
      useEffect(
        function updateSide() {
          videoMesh.material.side = s.side.value
        },
        [s.side]
      )

      // update mesh
      useEffect(
        function updateMesh() {
          resizeImageMesh(videoMesh)
          const scale = ObjectFitFunctions.computeContentFitScale(
            videoMesh.scale.x,
            videoMesh.scale.y,
            s.size.width.value,
            s.size.height.value,
            s.fit.value
          )
          videoMesh.scale.multiplyScalar(scale)
          videoMesh.updateMatrix()
        },
        [s.size, s.fit, s.videoMesh.material.map]
      )
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
