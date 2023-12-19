/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { getState } from '@etherealengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { ReferenceSpace, XRState } from '../xr/XRState'
import { TransformComponent } from './components/TransformComponent'
import { computeTransformMatrix } from './systems/TransformSystem'

// TODO: only update the world origin in one place; move logic for moving based on viewer hit into the function above
export const updateWorldOriginFromScenePlacement = () => {
  const xrState = getState(XRState)
  const scenePosition = xrState.scenePosition
  const sceneRotation = xrState.sceneRotation
  const worldScale = XRState.worldScale
  const originTransform = getComponent(Engine.instance.originEntity, TransformComponent)
  originTransform.position.copy(scenePosition)
  originTransform.rotation.copy(sceneRotation)
  originTransform.scale.setScalar(worldScale)
  originTransform.matrix.compose(originTransform.position, originTransform.rotation, originTransform.scale).invert()
  originTransform.matrixWorld.copy(originTransform.matrix)
  originTransform.matrixWorld.decompose(originTransform.position, originTransform.rotation, originTransform.scale)
  if (ReferenceSpace.localFloor) {
    const xrRigidTransform = new XRRigidTransform(scenePosition, sceneRotation)
    ReferenceSpace.origin = ReferenceSpace.localFloor.getOffsetReferenceSpace(xrRigidTransform)
  }
}

export const updateWorldOrigin = () => {
  if (ReferenceSpace.localFloor) {
    const originTransform = getComponent(Engine.instance.originEntity, TransformComponent)
    const xrRigidTransform = new XRRigidTransform(originTransform.position, originTransform.rotation)
    ReferenceSpace.origin = ReferenceSpace.localFloor.getOffsetReferenceSpace(xrRigidTransform.inverse)
  }
}

export const computeAndUpdateWorldOrigin = () => {
  computeTransformMatrix(Engine.instance.originEntity)
  TransformComponent.dirtyTransforms[Engine.instance.originEntity] = false
  updateWorldOrigin()
}
