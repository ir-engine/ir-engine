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

import { Entity, getComponent } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { Frustum, Matrix4, Vector3 } from 'three'

const mat4 = new Matrix4()
const frustum = new Frustum()
const worldPosVec3 = new Vector3()

/**
 * Check if an entity is in the camera's frustum
 * @param entityToCheck The entity to check if it's in the camera's frustum
 * @param cameraEntity The camera entity to check against
 * @returns True if the entityToCheck is in the cameraEntity's camera frustum
 */
export const inFrustum = (
  entityToCheck: Entity,
  cameraEntity: Entity = getState(EngineState).viewerEntity
): boolean => {
  if (!cameraEntity) return false

  const camera = getComponent(cameraEntity, CameraComponent)

  mat4.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
  frustum.setFromProjectionMatrix(mat4)

  TransformComponent.getWorldPosition(entityToCheck, worldPosVec3)
  return frustum.containsPoint(worldPosVec3)
}
