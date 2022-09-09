import { ComponentShouldDeserializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { addObjectToGroup } from '../../components/GroupComponent'
import { ScenePreviewCameraComponent } from '../../components/ScenePreviewCamera'

export const enterScenePreviewCamera = (entity: Entity) => {
  addObjectToGroup(entity, getComponent(entity, ScenePreviewCameraComponent).camera)
}

export const shouldDeserializeScenePreviewCamera: ComponentShouldDeserializeFunction = () => {
  return false
}
