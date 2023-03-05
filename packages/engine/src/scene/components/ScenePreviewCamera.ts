import { useEffect } from 'react'
import { CameraHelper, PerspectiveCamera } from 'three'

import { getState, none, useHookstate } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { defineComponent, getComponent, hasComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { RendererState } from '../../renderer/RendererState'
import { LocalTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { setObjectLayers } from '../functions/setObjectLayers'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'

export const ScenePreviewCameraComponent = defineComponent({
  name: 'XRE_scenePreviewCamera',

  onInit: (entity) => {
    const camera = new PerspectiveCamera(80, 16 / 9, 0.2, 8000)
    addObjectToGroup(entity, camera)
    const transform = getComponent(entity, TransformComponent)
    const cameraTransform = getComponent(Engine.instance.currentWorld.cameraEntity, TransformComponent)
    cameraTransform.position.copy(transform.position)
    cameraTransform.rotation.copy(transform.rotation)
    return {
      camera,
      helper: null as CameraHelper | null
    }
  },

  onRemove: (entity, component) => {
    component.camera.value.removeFromParent()
    if (component.helper.value) removeObjectFromGroup(entity, component.helper.value)
  },

  toJSON: () => {
    return {} as any
  },

  reactor: function ({ root }) {
    if (!hasComponent(root.entity, ScenePreviewCameraComponent)) throw root.stop()

    const debugEnabled = useHookstate(getState(RendererState).nodeHelperVisibility)
    const camera = useComponent(root.entity, ScenePreviewCameraComponent)

    useEffect(() => {
      if (debugEnabled.value && !camera.helper.value) {
        const helper = new CameraHelper(camera.camera.value)
        helper.name = `scene-preview-helper-${root.entity}`
        setObjectLayers(helper, ObjectLayers.NodeHelper)
        addObjectToGroup(root.entity, helper)
        camera.helper.set(helper)
      }

      if (!debugEnabled.value && camera.helper.value) {
        removeObjectFromGroup(root.entity, camera.helper.value)
        camera.helper.set(none)
      }
    }, [debugEnabled])

    return null
  }
})

export const SCENE_COMPONENT_SCENE_PREVIEW_CAMERA = 'scene-preview-camera'
