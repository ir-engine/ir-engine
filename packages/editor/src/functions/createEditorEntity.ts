import { MathUtils } from 'three'

import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { TransformMode } from '@xrengine/engine/src/scene/constants/transformConstants'

import { EditorControlComponent } from '../classes/EditorControlComponent'
import { FlyControlComponent } from '../classes/FlyControlComponent'
import { EditorInputComponent } from '../classes/InputComponent'
import { SceneState } from './sceneRenderFunctions'

export const createEditorEntity = (): Entity => {
  const entity = createEntity()
  addComponent(entity, FlyControlComponent, {
    boostSpeed: 4,
    moveSpeed: 4,
    lookSensitivity: 5,
    maxXRotation: MathUtils.degToRad(80)
  })

  addComponent(entity, EditorControlComponent, {})

  addComponent(entity, EditorInputComponent, {
    mappings: new Map(),
    activeMapping: null!,
    actionState: null!,
    defaultState: null!,
    resetKeys: null!
  })

  SceneState.transformGizmo.setTransformMode(TransformMode.Translate)

  return entity
}
