import { DoubleSide, Mesh, MeshBasicMaterial } from 'three'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'
import { PLANE_GEO } from './ImageComponent'

export const VideoComponent = defineComponent({
  name: 'XRE_video',

  onAdd: (entity) => {
    const mesh = new Mesh(PLANE_GEO, new MeshBasicMaterial())
    mesh.material.side = DoubleSide
    return { mesh }
  },

  onRemove: (entity, component) => {
    component.mesh.removeFromParent()
    component.mesh.material.map?.dispose()
  }
})

export const SCENE_COMPONENT_VIDEO = 'video'
