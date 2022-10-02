import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import TransformGizmo from '@xrengine/engine/src/scene/classes/TransformGizmo'
import { addObjectToGroup } from '@xrengine/engine/src/scene/components/GroupComponent'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { TransformGizmoComponent } from '@xrengine/engine/src/scene/components/TransformGizmo'
import { setTransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

export const createGizmoEntity = (gizmo: TransformGizmo): Entity => {
  const entity = createEntity()
  addComponent(entity, NameComponent, { name: 'Transform Gizmo' })
  addComponent(entity, TransformGizmoComponent, { gizmo })
  setTransformComponent(entity)
  addObjectToGroup(entity, gizmo)
  return entity
}
