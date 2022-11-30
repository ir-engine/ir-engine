import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { setComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'

import { EditorControlComponent } from '../classes/EditorControlComponent'

export const createEditorEntity = (): Entity => {
  const entity = createEntity()

  setComponent(entity, NameComponent, 'Editor Control Entity')

  setComponent(entity, EditorControlComponent, {})

  return entity
}
