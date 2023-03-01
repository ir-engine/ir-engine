import { Matrix4 } from 'three'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeComponent } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'

import { accessSelectionState } from '../services/SelectionServices'

const IDENTITY_MAT_4 = new Matrix4().identity()

export function getSpaceMatrix() {
  const selectedEntities = accessSelectionState().selectedEntities.value.slice()

  if (selectedEntities.length === 0) return IDENTITY_MAT_4

  const lastSelectedEntity = selectedEntities[selectedEntities.length - 1]
  const isUuid = typeof lastSelectedEntity === 'string'

  if (isUuid) {
    return (
      Engine.instance.currentWorld.scene.getObjectByProperty('uuid', lastSelectedEntity)?.parent?.matrixWorld ||
      IDENTITY_MAT_4
    )
  } else {
    const entityNode = getComponent(lastSelectedEntity, EntityTreeComponent)
    const parentEntity = entityNode?.parentEntity || lastSelectedEntity
    return getComponent(parentEntity, TransformComponent).matrix
  }
}
