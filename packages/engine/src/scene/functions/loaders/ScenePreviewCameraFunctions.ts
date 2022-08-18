import { Matrix4, PerspectiveCamera } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentShouldDeserializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  getComponentCountOfType,
  hasComponent
} from '../../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { ScenePreviewCameraTagComponent } from '../../components/ScenePreviewCamera'

export const SCENE_COMPONENT_SCENE_PREVIEW_CAMERA = 'scene-preview-camera'
export const SCENE_COMPONENT_SCENE_PREVIEW_CAMERA_DEFAULT_VALUES = {}

export const deserializeScenePreviewCamera: ComponentDeserializeFunction = (entity: Entity, _: ComponentJson<{}>) => {
  addComponent(entity, ScenePreviewCameraTagComponent, true)

  if (Engine.instance.isEditor) {
    const camera = new PerspectiveCamera(80, 16 / 9, 0.2, 8000)
    addComponent(entity, Object3DComponent, { value: camera })
  }
}

export const updateCameraTransform = (entity: Entity) => {
  const obj3d = getComponent(entity, Object3DComponent).value
  const transformComponent = getComponent(entity, TransformComponent)

  return new Matrix4()
    .copy(obj3d.parent!.matrixWorld)
    .invert()
    .multiply(Engine.instance.currentWorld.camera.matrixWorld)
    .decompose(transformComponent.position, transformComponent.rotation, transformComponent.scale)
}

export const updateScenePreviewCamera: ComponentUpdateFunction = (entity: Entity) => {}

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
