import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { Vector3 } from 'ethereal'
import { EditorCameraComponent } from '../classes/EditorCameraComponent'

export const createCameraEntity = (): Entity => {
  const entity = createEntity()
  addComponent(entity, Object3DComponent, { value: Engine.camera })
  addComponent(entity, EditorCameraComponent, { center: new Vector3() })

  return entity
}
