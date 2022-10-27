import { OrthographicCamera, PerspectiveCamera } from 'three'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'
import { addObjectToGroup, removeObjectFromGroup } from '../../scene/components/GroupComponent'

export const CameraComponent = defineComponent({
  name: 'CameraComponent',
  onInit: (entity) => {
    return {
      camera: new PerspectiveCamera(60, 1, 0.001, 10000) as PerspectiveCamera | OrthographicCamera
    }
  },
  onSet: (entity, component, json: undefined) => {
    addObjectToGroup(entity, component.camera.value)
  },
  onRemove: (entity, component) => {
    removeObjectFromGroup(entity, component.camera.value)
  },
  toJSON: () => {
    return null! as {
      camera: PerspectiveCamera | OrthographicCamera
    }
  }
})
