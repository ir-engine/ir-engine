import { Matrix4, PerspectiveCamera } from 'three'

import { ComponentShouldDeserializeFunction } from '../../../common/constants/PrefabFunctionType'
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

export const updateCameraTransform = (entity: Entity) => {
  if (!hasComponent(entity, Object3DComponent) && Engine.instance.isEditor) {
    const camera = new PerspectiveCamera(80, 16 / 9, 0.2, 8000)
    addComponent(entity, Object3DComponent, { value: camera })
  }

  const transformComponent = getComponent(entity, TransformComponent)

  return new Matrix4()
    .copy(Engine.instance.currentWorld.scene.matrixWorld)
    .invert()
    .multiply(Engine.instance.currentWorld.camera.matrixWorld)
    .decompose(transformComponent.position, transformComponent.rotation, transformComponent.scale)
}

export const shouldDeserializeScenePreviewCamera: ComponentShouldDeserializeFunction = () => {
  return getComponentCountOfType(ScenePreviewCameraTagComponent) <= 0
}
