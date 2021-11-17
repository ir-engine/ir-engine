import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { MathUtils } from 'three'
import { FlyControlComponent } from '../classes/FlyControlComponent'
import { InputComponent } from '../classes/InputComponent'

export const createEditorEntity = (): Entity => {
  const entity = createEntity()
  addComponent(entity, FlyControlComponent, {
    enable: false,
    boostSpeed: 2,
    moveSpeed: 2,
    lookSensitivity: 10,
    maxXRotation: MathUtils.degToRad(80)
  })

  addComponent(entity, InputComponent, {
    mappings: new Map(),
    activeMapping: null,
    actionState: null,
    defaultState: null,
    resetKeys: null
  })

  return entity
}
