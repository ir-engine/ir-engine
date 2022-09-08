import { Group } from 'three'

import { ComponentShouldDeserializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../../components/Object3DComponent'
import { ScenePreviewCameraComponent } from '../../components/ScenePreviewCamera'

export const enterScenePreviewCamera = (entity: Entity) => {
  if (!hasComponent(entity, Object3DComponent)) {
    addComponent(entity, Object3DComponent, { value: new Group() }).value
  }
  const group = getComponent(entity, Object3DComponent).value
  const scenePreviewCamera = getComponent(entity, ScenePreviewCameraComponent).camera
  group.add(scenePreviewCamera)
}

export const shouldDeserializeScenePreviewCamera: ComponentShouldDeserializeFunction = () => {
  return false
}
