import { Mesh, MeshBasicMaterial } from 'three'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'
import { PLANE_GEO } from './ImageComponent'

export const VideoComponent = defineComponent({
  name: 'XRE_video',

  onAdd: (entity, json) => {
    return {
      mesh: new Mesh(PLANE_GEO, new MeshBasicMaterial())
    }
  },

  onRemove: (entity, component) => {
    component.mesh.removeFromParent()
    component.mesh.material.map?.dispose()
  }
})

export const SCENE_COMPONENT_VIDEO = 'video'
