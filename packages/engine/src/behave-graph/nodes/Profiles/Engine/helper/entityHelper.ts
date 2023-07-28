import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { getState } from '@etherealengine/hyperflux'
import { MathUtils } from 'three'
import { Entity } from '../../../../../ecs/classes/Entity'
import { SceneState } from '../../../../../ecs/classes/Scene'
import { getComponent, hasComponent, setComponent } from '../../../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../../../ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '../../../../../ecs/functions/EntityTree'
import { UUIDComponent } from '../../../../../scene/components/UUIDComponent'
import { createNewEditorNode } from '../../../../../scene/systems/SceneLoadingSystem'

export const addEntityToScene = (
  componentName: string,
  parentEntity = getState(SceneState).sceneEntity as Entity | null,
  beforeEntity = null as Entity | null
) => {
  const newEntity = createEntity()
  let childIndex = undefined as undefined | number
  if (beforeEntity) {
    const beforeNode = getComponent(beforeEntity, EntityTreeComponent)
    if (beforeNode?.parentEntity && hasComponent(beforeNode.parentEntity, EntityTreeComponent)) {
      childIndex = getComponent(beforeNode.parentEntity, EntityTreeComponent).children.indexOf(beforeEntity)
    }
  }
  setComponent(newEntity, EntityTreeComponent, { parentEntity, childIndex })
  setComponent(newEntity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)

  createNewEditorNode(newEntity, componentName) //dont need for runtime TBD

  return newEntity
}
