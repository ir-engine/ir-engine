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

import { Matrix4 } from 'three'

import { getMutableState, getState } from '@etherealengine/hyperflux'

import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import {
  compareDistanceToLocalClient,
  DistanceFromLocalClientComponent
} from '../../transform/components/DistanceComponents'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { InteractState } from '../systems/InteractiveSystem'

const mat4 = new Matrix4()
// const projectionMatrix = new Matrix4().makePerspective(
//   -0.1, // x1
//   0.1, // x2
//   -0.1, // y1
//   0.1, // y2
//   0.1, // near
//   2 // far
// )
// const frustum = new Frustum()

/**
 * Checks if entity can interact with any of entities listed in 'interactive' array, checking distance, guards and raycast
 * @param {Entity[]} interactables
 */

export const gatherAvailableInteractables = (interactables: Entity[]) => {
  if (!Engine.instance.localClientEntity) return

  const transform = getComponent(Engine.instance.localClientEntity, TransformComponent)
  const controller = getComponent(Engine.instance.localClientEntity, AvatarControllerComponent)

  if (!controller || !transform) return

  const maxDistance = getState(InteractState).maxDistance
  const maxDistanceSquare = maxDistance * maxDistance
  const availableInteractable = getMutableState(InteractState).available
  // const camera = getComponent(controller.cameraEntity, CameraComponent)

  // mat4.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
  // frustum.setFromProjectionMatrix(mat4)

  // const available = [] as Entity[]
  // for (const entityIn of interactables) {
  //   const targetTransform = getComponent(entityIn, TransformComponent)
  //   available.push(entityIn)
  // }

  availableInteractable.set(
    [...interactables]
      .filter((entity) => DistanceFromLocalClientComponent.squaredDistance[entity] < maxDistanceSquare)
      .sort(compareDistanceToLocalClient)
  )
}
