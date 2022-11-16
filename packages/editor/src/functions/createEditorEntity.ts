import { AvatarInputSchema } from '@xrengine/engine/src/avatar/AvatarInputSchema'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { setComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { InputComponent } from '@xrengine/engine/src/input/components/InputComponent'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { TransformMode } from '@xrengine/engine/src/scene/constants/transformConstants'

import { EditorControlComponent } from '../classes/EditorControlComponent'
import { EditorInputComponent } from '../classes/InputComponent'
import { SceneState } from './sceneRenderFunctions'

export const createEditorEntity = (): Entity => {
  const entity = createEntity()

  setComponent(entity, NameComponent, 'Editor Control Entity')

  setComponent(entity, InputComponent, {
    schema: AvatarInputSchema,
    data: new Map()
  })

  setComponent(entity, EditorControlComponent, {})

  setComponent(entity, EditorInputComponent, {
    mappings: new Map(),
    activeMapping: null!,
    actionState: null!,
    defaultState: null!,
    resetKeys: null!
  })

  SceneState.transformGizmo.setTransformMode(TransformMode.Translate)

  return entity
}
