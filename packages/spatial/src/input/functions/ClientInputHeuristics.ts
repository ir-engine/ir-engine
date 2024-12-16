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

/**
 * @fileoverview Contains function declarations describing the heuristics used by ClientInputSystem.
 */

import {
  defineQuery,
  Entity,
  EntityUUID,
  getComponent,
  getOptionalComponent,
  hasComponent,
  Not,
  UndefinedEntity,
  UUIDComponent
} from '@ir-engine/ecs'
import { InteractableComponent } from '@ir-engine/engine/src/interaction/components/InteractableComponent'
import { defineState, getState } from '@ir-engine/hyperflux'
import { Object3D, Quaternion, Ray, Raycaster, Vector3 } from 'three'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { ObjectDirection } from '../../common/constants/MathConstants'
import { EngineState } from '../../EngineState'
import { GroupComponent } from '../../renderer/components/GroupComponent'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { ObjectLayers } from '../../renderer/constants/ObjectLayers'
import { BoundingBoxComponent } from '../../transform/components/BoundingBoxComponents'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Object3DUtils } from '../../transform/Object3DUtils'
import { XRScenePlacementComponent } from '../../xr/XRScenePlacementComponent'
import { XRState } from '../../xr/XRState'
import { InputComponent } from '../components/InputComponent'
import { InputState } from '../state/InputState'

const _worldPosInputSourceComponent = new Vector3()
const _worldPosInputComponent = new Vector3()

export type IntersectionData = {
  entity: Entity
  distance: number
}

/**
 * 1 = early - used for heuristics that should take precedence (like helpers and gizmos)
 * 0 = mid - used for most heuristics
 * -1 = late - used for catchall heuristics
 */
export type HeuristicOrder = -1 | 0 | 1

export type HeuristicFunctions = (
  intersectionData: Set<IntersectionData>,
  position: Vector3,
  direction: Vector3
) => void

export const InputHeuristicState = defineState({
  name: 'ir.spatial.input.InputHeuristicState',
  initial: [] as Array<{ order: HeuristicOrder; heuristic: HeuristicFunctions }>
})

/**Proximity query */
const spatialInputObjectsQuery = defineQuery([
  InputComponent,
  VisibleComponent,
  TransformComponent,
  Not(CameraComponent),
  Not(XRScenePlacementComponent)
])

export function findProximity(
  isSpatialInput: boolean,
  sourceEid: Entity,
  sortedIntersections: IntersectionData[],
  intersectionData: Set<IntersectionData>
) {
  const userID = getState(EngineState).userID
  if (!userID) return

  const isCameraAttachedToAvatar = XRState.isCameraAttachedToAvatar

  // @todo need a better way to do this
  const selfAvatarEntity = UUIDComponent.getEntityByUUID((userID + '_avatar') as EntityUUID)

  // use sourceEid if controller (one InputSource per controller), otherwise use avatar rather than InputSource-emulated-pointer
  const inputSourceEntity = isCameraAttachedToAvatar && isSpatialInput ? sourceEid : selfAvatarEntity

  // Skip Proximity Heuristic when the entity is undefined
  if (inputSourceEntity === UndefinedEntity) return

  TransformComponent.getWorldPosition(inputSourceEntity, _worldPosInputSourceComponent)

  //TODO spatialInputObjects or inputObjects?  - inputObjects requires visible and group components
  for (const inputEntity of spatialInputObjectsQuery()) {
    if (inputEntity === selfAvatarEntity) continue
    const inputComponent = getComponent(inputEntity, InputComponent)

    TransformComponent.getWorldPosition(inputEntity, _worldPosInputComponent)
    const distSquared = _worldPosInputSourceComponent.distanceToSquared(_worldPosInputComponent)

    //closer than our current closest AND within inputSource's activation distance
    if (inputComponent.activationDistance * inputComponent.activationDistance > distSquared) {
      //using this object type out of convenience (intersectionsData is also guaranteed empty in this flow)
      intersectionData.add({ entity: inputEntity, distance: distSquared }) //keeping it as distSquared for now to avoid extra square root calls
    }
  }

  const closestEntities = Array.from(intersectionData)
  if (closestEntities.length === 0) return
  if (closestEntities.length > 1) {
    //sort if more than 1 entry
    closestEntities.sort((a, b) => {
      //prioritize anything with an InteractableComponent if otherwise equal
      const aNum = hasComponent(a.entity, InteractableComponent) ? -1 : 0
      const bNum = hasComponent(b.entity, InteractableComponent) ? -1 : 0
      //aNum - bNum : 0 if equal, -1 if a has tag and b doesn't, 1 if a doesnt have tag and b does
      return Math.sign(a.distance - b.distance) + (aNum - bNum)
    })
  }
  sortedIntersections.push({
    entity: closestEntities[0].entity,
    distance: Math.sqrt(closestEntities[0].distance)
  })
}

const hitTarget = new Vector3()
const ray = new Ray()

export function boundingBoxHeuristic(intersectionData: Set<IntersectionData>, position: Vector3, direction: Vector3) {
  const isEditing = getState(EngineState).isEditing
  if (isEditing) return

  ray.origin.copy(position)
  ray.direction.copy(direction)

  const inputState = getState(InputState)
  for (const entity of inputState.inputBoundingBoxes) {
    const boundingBox = getOptionalComponent(entity, BoundingBoxComponent)
    if (!boundingBox) continue
    const hit = ray.intersectBox(boundingBox.box, hitTarget)
    if (hit) {
      intersectionData.add({ entity, distance: ray.origin.distanceTo(hitTarget) })
    }
  }
}

const _raycaster = new Raycaster()
_raycaster.layers.set(ObjectLayers.Scene)
const meshesQuery = defineQuery([VisibleComponent, MeshComponent])

export function meshHeuristic(intersectionData: Set<IntersectionData>, position: Vector3, direction: Vector3) {
  const isEditing = getState(EngineState).isEditing
  const inputState = getState(InputState)
  const objects = (isEditing ? meshesQuery() : Array.from(inputState.inputMeshes))
    .filter((eid) => hasComponent(eid, GroupComponent))
    .map((eid) => getComponent(eid, GroupComponent))
    .flat()

  _raycaster.set(position, direction)

  const hits = _raycaster.intersectObjects<Object3D>(objects, true)
  for (const hit of hits) {
    const parentObject = Object3DUtils.findAncestor(hit.object, (obj) => obj.entity != undefined)
    if (parentObject) {
      intersectionData.add({ entity: parentObject.entity, distance: hit.distance })
    }
  }
}

const position = new Vector3()
const direction = new Vector3()
const sourceRotation = new Quaternion()

export function findRaycastedInput(sourceEid: Entity, intersectionData: Set<IntersectionData>) {
  TransformComponent.getWorldRotation(sourceEid, sourceRotation)
  direction.copy(ObjectDirection.Forward).applyQuaternion(sourceRotation)

  TransformComponent.getWorldPosition(sourceEid, position).addScaledVector(direction, -0.01)

  const heuristics = [...getState(InputHeuristicState)].sort((a, b) => b.order - a.order)

  for (const { heuristic } of heuristics) heuristic(intersectionData, position, direction)
}
