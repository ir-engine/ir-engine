import { Matrix4 } from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

import { accessSelectionState } from '../services/SelectionServices'

const IDENTITY_MAT_4 = new Matrix4().identity()

export function getSpaceMatrix() {
  const selectedEntities = accessSelectionState().selectedEntities.value.slice()

  if (selectedEntities.length === 0) return IDENTITY_MAT_4

  const lastSelectedEntity = selectedEntities[selectedEntities.length - 1]
  const isUuid = typeof lastSelectedEntity === 'string'
  const matrix = isUuid
    ? Engine.instance.currentWorld.scene.getObjectByProperty('uuid', lastSelectedEntity)?.parent?.matrixWorld!
    : getComponent(lastSelectedEntity, TransformComponent)?.matrix

  if (!matrix) return IDENTITY_MAT_4
  return matrix
}
