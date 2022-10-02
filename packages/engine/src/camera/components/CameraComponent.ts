import { OrthographicCamera, PerspectiveCamera } from 'three'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const CameraComponent = defineComponent({
  name: 'CameraComponent',
  onAdd: (entity) => {
    return {
      camera: new PerspectiveCamera(60, 1, 0.001, 10000) as PerspectiveCamera | OrthographicCamera
    }
  },
  onRemove: (entity, component) => {
    component.camera.removeFromParent()
  }
})
