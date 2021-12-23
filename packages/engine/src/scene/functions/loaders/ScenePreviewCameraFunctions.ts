import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { CameraHelper, PerspectiveCamera, Matrix4 } from 'three'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentShouldDeserializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  getComponentCountOfType,
  hasComponent
} from '../../../ecs/functions/ComponentFunctions'
import { CopyTransformComponent } from '../../../transform/components/CopyTransformComponent'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { ScenePreviewCameraTagComponent } from '../../components/ScenePreviewCamera'

export const SCENE_COMPONENT_SCENE_PREVIEW_CAMERA = 'scene-preview-camera'
export const SCENE_COMPONENT_SCENE_PREVIEW_CAMERA_DEFAULT_VALUES = {}
export const SCENE_PREVIEW_CAMERA_HELPER = 'scene-preview-camera-helper'

export const deserializeScenePreviewCamera: ComponentDeserializeFunction = (entity: Entity, _: ComponentJson) => {
  if (!isClient) return

  addComponent(entity, ScenePreviewCameraTagComponent, {})
  if (Engine.isEditor) {
    const camera = new PerspectiveCamera(80, 16 / 9, 0.2, 8000)
    camera.userData.helper = new CameraHelper(camera)
    camera.userData.helper.name = SCENE_PREVIEW_CAMERA_HELPER
    camera.userData.helper.layers.set(1)

    addComponent(entity, Object3DComponent, { value: camera })
    getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_SCENE_PREVIEW_CAMERA)
  } else if (Engine.activeCameraEntity) {
    addComponent(Engine.activeCameraEntity, CopyTransformComponent, { input: entity })
  }
}

export const updateScenePreviewCamera: ComponentUpdateFunction = (entity: Entity) => {
  const obj3d = getComponent(entity, Object3DComponent).value
  const transformComponent = getComponent(entity, TransformComponent)

  new Matrix4()
    .copy(obj3d.parent!.matrixWorld)
    .invert()
    .multiply(Engine.camera.matrixWorld)
    .decompose(transformComponent.position, transformComponent.rotation, transformComponent.scale)
}

export const serializeScenePreviewCamera: ComponentSerializeFunction = (entity) => {
  if (hasComponent(entity, ScenePreviewCameraTagComponent)) {
    return {
      name: SCENE_COMPONENT_SCENE_PREVIEW_CAMERA,
      props: {}
    }
  }
}

export const shouldDeserializeScenePreviewCamera: ComponentShouldDeserializeFunction = () => {
  return getComponentCountOfType(ScenePreviewCameraTagComponent) <= 0
}
