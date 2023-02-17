import { ArrayCamera, PerspectiveCamera } from 'three'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'
import { addObjectToGroup, removeObjectFromGroup } from '../../scene/components/GroupComponent'

export const CameraComponent = defineComponent({
  name: 'CameraComponent',
  onInit: (entity) => {
    const camera = new ArrayCamera()
    camera.fov = 60
    camera.aspect = 1
    camera.near = 0.001
    camera.far = 100000
    camera.cameras = [new PerspectiveCamera().copy(camera, false)]
    return camera
  },
  onSet: (entity, component, json: undefined) => {
    addObjectToGroup(entity, component.value)
  },
  onRemove: (entity, component) => {
    removeObjectFromGroup(entity, component.value)
  },
  toJSON: () => {
    return null
  }
})
