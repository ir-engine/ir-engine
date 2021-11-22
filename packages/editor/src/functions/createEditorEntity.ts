import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { SnapMode, TransformMode, TransformPivot } from '@xrengine/engine/src/scene/constants/transformConstants'
import { MathUtils, Vector2 } from 'three'
import { EditorControlComponent } from '../classes/EditorControlComponent'
import { FlyControlComponent } from '../classes/FlyControlComponent'
import { InputComponent } from '../classes/InputComponent'
import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'
import { SceneManager } from '../managers/SceneManager'

export const createEditorEntity = (): Entity => {
  const entity = createEntity()
  addComponent(entity, FlyControlComponent, {
    enable: false,
    boostSpeed: 4,
    moveSpeed: 4,
    lookSensitivity: 5,
    maxXRotation: MathUtils.degToRad(80)
  })

  addComponent(entity, EditorControlComponent, {
    enable: false,
    transformMode: TransformMode.Translate,
    translationSnap: 0.5,
    rotationSnap: 10,
    scaleSnap: 0.1,
    snapMode: SnapMode.Grid,
    transformPivot: TransformPivot.Selection,
    transformSpace: TransformSpace.World,
    selectStartPosition: new Vector2()
  })

  addComponent(entity, InputComponent, {
    mappings: new Map(),
    activeMapping: null,
    actionState: null,
    defaultState: null,
    resetKeys: null
  })

  SceneManager.instance.transformGizmo.setTransformMode(TransformMode.Translate)

  return entity
}
