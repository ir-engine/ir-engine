import { ComponentShouldDeserializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent, serializeComponent } from '../../../ecs/functions/ComponentFunctions'
import { addObjectToGroup } from '../../components/GroupComponent'
import { ScenePreviewCameraComponent } from '../../components/ScenePreviewCamera'

export const enterScenePreviewCamera = (entity: Entity) => {
  addObjectToGroup(entity, getComponent(entity, ScenePreviewCameraComponent).camera)
}

export const shouldDeserializeScenePreviewCamera: ComponentShouldDeserializeFunction = () => {
  return false
}

export const serializeScenePreviewCamera = (entity) => {
  return serializeComponent(entity, ScenePreviewCameraComponent)
}
