import { Matrix4 } from 'three'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'

import { accessSelectionState } from '../services/SelectionServices'

const IDENTITY_MAT_4 = new Matrix4().identity()

export function getSpaceMatrix() {
  const selectedEntities = accessSelectionState().selectedEntities.value

  if (selectedEntities.length === 0) return IDENTITY_MAT_4

  const lastSelectedEntity = selectedEntities[selectedEntities.length - 1]
  const obj3d = getComponent(lastSelectedEntity, Object3DComponent).value
  obj3d.updateMatrixWorld()

  if (!obj3d.parent) return IDENTITY_MAT_4

  return obj3d.parent.matrixWorld
}
