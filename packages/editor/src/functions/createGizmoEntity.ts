import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import TransformGizmo from '@xrengine/engine/src/scene/classes/TransformGizmo'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { TransformGizmoComponent } from '@xrengine/engine/src/scene/components/TransformGizmo'

export const createGizmoEntity = (gizmo: TransformGizmo): Entity => {
  const entity = createEntity()
  addComponent(entity, Object3DComponent, { value: gizmo })
  addComponent(entity, TransformGizmoComponent, {})

  return entity
}
