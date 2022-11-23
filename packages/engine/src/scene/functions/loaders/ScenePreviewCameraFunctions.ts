import { ComponentShouldDeserializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent, serializeComponent } from '../../../ecs/functions/ComponentFunctions'
import { LocalTransformComponent, TransformComponent } from '../../../transform/components/TransformComponent'
import { addObjectToGroup } from '../../components/GroupComponent'
import { ScenePreviewCameraComponent } from '../../components/ScenePreviewCamera'

export const enterScenePreviewCamera = (entity: Entity) => {
  addObjectToGroup(entity, getComponent(entity, ScenePreviewCameraComponent).camera)
  const transform = getComponent(entity, TransformComponent)
  const cameraTransform = getComponent(Engine.instance.currentWorld.cameraEntity, LocalTransformComponent)
  cameraTransform.position.copy(transform.position)
  cameraTransform.rotation.copy(transform.rotation)
}

export const shouldDeserializeScenePreviewCamera: ComponentShouldDeserializeFunction = () => {
  return false
}

export const serializeScenePreviewCamera = (entity) => {
  return serializeComponent(entity, ScenePreviewCameraComponent)
}
