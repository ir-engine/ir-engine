import { hookstate, useState } from '@xrengine/hyperflux/functions/StateFunctions'
import { subscribable } from '@hookstate/subscribable'
import { DoubleSide, Mesh, MeshBasicMaterial, Side, Vector2, Group } from 'three'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'
import { PLANE_GEO, resizeImageMesh } from './ImageComponent'
import { ContentFitType, ObjectFitFunctions } from '../../xrui/functions/ObjectFitFunctions'
import { addEntityReactor } from '../../ecs/functions/EntityFunctions'
import { useEffect } from 'react'

export const VideoComponent = defineComponent({
  name: 'XRE_video',

  onAdd: (entity) => {
    
    const videoGroup = new Group
    videoGroup.name = 'video-group'
    const videoMesh = new Mesh(PLANE_GEO, new MeshBasicMaterial())
    videoGroup.add(videoMesh)
    videoMesh.matrixAutoUpdate = false

    const state = hookstate({
      side: DoubleSide as Side,
      size: new Vector2(1,1),
      fit: 'contain' as ContentFitType,
      mediaEntity: '',
      videoGroup,
      videoMesh
    })

    const updateSide = () => void(videoMesh.material.side = state.side.value)

    const updateMesh = () => {
      resizeImageMesh(videoMesh)
      const scale = ObjectFitFunctions.computeContentFitScale(videoMesh.scale.x, videoMesh.scale.y, state.size.width.value, state.size.height.value, state.fit.value)
      videoMesh.scale.multiplyScalar(scale)
      videoMesh.updateMatrix()
    }

    addEntityReactor(entity, () => {
      const s = useState(state)
      useEffect(updateSide, [s.side])
      useEffect(updateMesh, [s.size, s.fit, s.videoMesh.material.map])
    })

    return state
  },

  toJSON: (entity, component) => {
    return {
      /**
       * An entity with with an attached MediaComponent;if an empty string, then the current entity is assumed 
       */
      mediaEntity: '',
      side: component.side.value,
      size: component.size.value,
      fit: component.fit.value
    }
  },

  onUpdate: (entity, component, json) => {
    if (typeof json.mediaEntity === 'string') component.mediaEntity.set(json.mediaEntity)
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
