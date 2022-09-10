import { PerspectiveCamera } from 'three'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const ScenePreviewCameraComponent = defineComponent({
  name: 'XRE_scenePreviewCamera',

  onAdd: (entity, json) => {
    return {
      camera: new PerspectiveCamera(80, 16 / 9, 0.2, 8000)
    }
  },

  onRemove: (entity, component) => {
    component.camera.remove()
  },

  toJSON: () => {
    return null
  }
})

export const SCENE_COMPONENT_SCENE_PREVIEW_CAMERA = 'scene-preview-camera'
