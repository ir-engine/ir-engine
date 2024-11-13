/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { getComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { getState } from '@ir-engine/hyperflux'

import { EngineState } from '../EngineState'
import { Vector3_One } from '../common/constants/MathConstants'
import { ReferenceSpace, XRState } from '../xr/XRState'
import { EntityTreeComponent } from './components/EntityTree'
import { TransformComponent } from './components/TransformComponent'
import { computeTransformMatrix } from './systems/TransformSystem'

// TODO: only update the world origin in one place; move logic for moving based on viewer hit into the function above
export const updateWorldOriginFromScenePlacement = () => {
  const xrState = getState(XRState)
  const scenePosition = xrState.scenePosition
  const sceneRotation = xrState.sceneRotation
  const worldScale = XRState.worldScale
  const originTransform = getComponent(getState(EngineState).localFloorEntity, TransformComponent)
  originTransform.position.copy(scenePosition)
  originTransform.rotation.copy(sceneRotation)
  const children = getComponent(getState(EngineState).localFloorEntity, EntityTreeComponent).children
  for (const child of children) {
    const childTransform = getComponent(child, TransformComponent)
    childTransform.scale.setScalar(worldScale)
  }
  originTransform.matrix.compose(originTransform.position, originTransform.rotation, Vector3_One).invert()
  originTransform.matrixWorld.copy(originTransform.matrix)
  originTransform.matrixWorld.decompose(originTransform.position, originTransform.rotation, originTransform.scale)
  if (ReferenceSpace.localFloor) {
    const xrRigidTransform = new XRRigidTransform(scenePosition, sceneRotation)
    ReferenceSpace.origin = ReferenceSpace.localFloor.getOffsetReferenceSpace(xrRigidTransform)
  }
}

export const updateWorldOrigin = () => {
  if (ReferenceSpace.localFloor) {
    const originTransform = getComponent(getState(EngineState).localFloorEntity, TransformComponent)
    const xrRigidTransform = new XRRigidTransform(originTransform.position, originTransform.rotation)
    ReferenceSpace.origin = ReferenceSpace.localFloor.getOffsetReferenceSpace(xrRigidTransform.inverse)
  }
}

export const computeAndUpdateWorldOrigin = () => {
  computeTransformMatrix(getState(EngineState).localFloorEntity)
  updateWorldOrigin()
}
