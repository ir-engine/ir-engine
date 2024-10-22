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

import { Frustum, Matrix4 } from 'three'

import { getComponent, getOptionalComponent } from '@ir-engine/ecs'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { defineState, getMutableState, getState } from '@ir-engine/hyperflux'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { createTransitionState } from '@ir-engine/spatial/src/common/functions/createTransitionState'
import {
  DistanceFromLocalClientComponent,
  compareDistanceToLocalClient
} from '@ir-engine/spatial/src/transform/components/DistanceComponents'

import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { inFrustum } from '@ir-engine/spatial/src/camera/functions/CameraFunctions'
import { InteractableComponent } from '../components/InteractableComponent'

const mat4 = new Matrix4()
const frustum = new Frustum()

/**
 * Checks if entity is in range based on its own threshold
 * @param entity
 * @constructor
 */
const inRangeAndFrustumToInteract = (entity: Entity): boolean => {
  const interactable = getOptionalComponent(entity, InteractableComponent)
  if (!interactable) return false
  const maxDistanceSquare = interactable.activationDistance * interactable.activationDistance
  let inRangeAndFrustum = DistanceFromLocalClientComponent.squaredDistance[entity] < maxDistanceSquare
  if (inRangeAndFrustum) {
    inRangeAndFrustum = inFrustum(entity)
  }
  return inRangeAndFrustum
}

export const InteractableState = defineState({
  name: 'InteractableState',
  initial: () => {
    return {
      /**
       * all interactables within threshold range, in view of the camera, sorted by distance
       */
      available: [] as Entity[]
    }
  }
})

/**
 * Checks if entity can interact with any of entities listed in 'interactable' array, checking distance, guards and raycast
 * sorts the interactables by closest to the player
 * @param {Entity[]} interactables
 */
export const gatherAvailableInteractables = (interactables: Entity[]) => {
  const availableInteractable = getMutableState(InteractableState).available

  const viewerEntity = getState(EngineState).viewerEntity
  if (!viewerEntity) return

  const camera = getComponent(viewerEntity, CameraComponent)

  mat4.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
  frustum.setFromProjectionMatrix(mat4)

  availableInteractable.set(
    [...interactables].filter((entity) => inRangeAndFrustumToInteract(entity)).sort(compareDistanceToLocalClient)
  )
}

export const InteractableTransitions = new Map<Entity, ReturnType<typeof createTransitionState>>()
