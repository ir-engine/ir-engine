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

/**
 * @fileoverview Contains function declarations describing the heuristics used by ClientInputSystem.
 */

import { Object3DUtils } from '@etherealengine/common/src/utils/Object3DUtils'
import {
  defineQuery,
  Engine,
  Entity,
  EntityUUID,
  getComponent,
  getOptionalComponent,
  hasComponent,
  Not,
  UndefinedEntity,
  UUIDComponent
} from '@etherealengine/ecs'
import { InteractableComponent } from '@etherealengine/engine/src/interaction/components/InteractableComponent'
import { getState } from '@etherealengine/hyperflux'
import { Mesh, MeshBasicMaterial, Object3D, Quaternion, Ray, Raycaster, Vector3 } from 'three'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { ObjectDirection } from '../../common/constants/MathConstants'
import { EngineState } from '../../EngineState'
import { Physics, RaycastArgs } from '../../physics/classes/Physics'
import { PhysicsState } from '../../physics/state/PhysicsState'
import { GroupComponent } from '../../renderer/components/GroupComponent'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { ObjectLayers } from '../../renderer/constants/ObjectLayers'
import { TransformComponent } from '../../SpatialModule'
import { BoundingBoxComponent } from '../../transform/components/BoundingBoxComponents'
import { TransformGizmoTagComponent } from '../../transform/components/TransformComponent'
import { XRScenePlacementComponent } from '../../xr/XRScenePlacementComponent'
import { XRControlsState } from '../../xr/XRState'
import { XRUIComponent } from '../../xrui/components/XRUIComponent'
import { InputComponent } from '../components/InputComponent'
import { InputState } from '../state/InputState'

const _worldPosInputSourceComponent = new Vector3()
const _worldPosInputComponent = new Vector3()

export type IntersectionData = {
  entity: Entity
  distance: number
}

export type HeuristicData = {
  quaternion: Quaternion
  ray: Ray
  raycast: RaycastArgs
  caster: Raycaster
  hitTarget: Vector3
}

export type HeuristicFunctions = {
  editor: typeof ClientInputHeuristics.findEditor
  xrui: typeof ClientInputHeuristics.findXRUI
  physicsColliders: typeof ClientInputHeuristics.findPhysicsColliders
  bboxes: typeof ClientInputHeuristics.findBBoxes
  meshes: typeof ClientInputHeuristics.findMeshes
  proximity: typeof ClientInputHeuristics.findProximity
  raycastedInput: typeof ClientInputHeuristics.findRaycastedInput
}

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
  //use sourceEid if controller (one InputSource per controller), otherwise use avatar rather than InputSource-emulated-pointer
  const selfAvatarEntity = UUIDComponent.getEntityByUUID((Engine.instance.userID + '_avatar') as EntityUUID) //would prefer a better way to do this
  const inputSourceEntity =
    getState(XRControlsState).isCameraAttachedToAvatar && isSpatialInput ? sourceEid : selfAvatarEntity

  // Skip Proximity Heuristic when the entity is undefined
  // @note Clause Guard. This entire function was a block nested inside   if (inputSourceEntity !== UndefinedEntity) { ... }
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
  if (closestEntities.length === 0) return // @note Clause Guard. The rest of this function was nested inside   if (closestEntities.length > 0) { ... }

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
  // @note DRY change. This code was duplicated because the `if closestEntities.length` check was inverted
  sortedIntersections.push({
    entity: closestEntities[0].entity,
    distance: Math.sqrt(closestEntities[0].distance)
  })
}

/**Editor InputComponent raycast query */
const inputObjectsQuery = defineQuery([InputComponent, VisibleComponent, GroupComponent])

/** @todo abstract into heuristic api */
const gizmoPickerObjectsQuery = defineQuery([
  InputComponent,
  GroupComponent,
  VisibleComponent,
  TransformGizmoTagComponent
])

export function findEditor(intersectionData: Set<IntersectionData>, caster: Raycaster) {
  const pickerObj = gizmoPickerObjectsQuery() // gizmo heuristic
  const inputObj = inputObjectsQuery()

  const objects = (pickerObj.length > 0 ? pickerObj : inputObj) // gizmo heuristic
    .map((eid) => getComponent(eid, GroupComponent))
    .flat()
  pickerObj.length > 0
    ? caster.layers.enable(ObjectLayers.TransformGizmo)
    : caster.layers.disable(ObjectLayers.TransformGizmo)
  const hits = caster.intersectObjects<Object3D>(objects, true)
  for (const hit of hits) {
    const parentObject = Object3DUtils.findAncestor(hit.object, (obj) => !obj.parent)
    if (!parentObject?.entity) continue // @note Clause Guard. The next line was nested inside   if (parentObject?.entity) { ... }
    intersectionData.add({ entity: parentObject.entity, distance: hit.distance })
  }
}

const xruiQuery = defineQuery([VisibleComponent, XRUIComponent])

export function findXRUI(intersectionData: Set<IntersectionData>, ray: Ray) {
  for (const entity of xruiQuery()) {
    const xrui = getComponent(entity, XRUIComponent)
    const layerHit = xrui.hitTest(ray)
    if (
      !layerHit ||
      !layerHit.intersection.object.visible ||
      (layerHit.intersection.object as Mesh<any, MeshBasicMaterial>).material?.opacity < 0.01
    )
      continue
    intersectionData.add({ entity, distance: layerHit.intersection.distance })
  }
}

export function findPhysicsColliders(intersectionData: Set<IntersectionData>, raycast: RaycastArgs) {
  const physicsWorld = getState(PhysicsState).physicsWorld
  if (!physicsWorld) return // @note Clause Guard. The rest of this function was nested inside   if (physicsWorld) { ... }

  const hits = Physics.castRay(physicsWorld, raycast)
  for (const hit of hits) {
    if (!hit.entity) continue
    intersectionData.add({ entity: hit.entity, distance: hit.distance })
  }
}

const boundingBoxesQuery = defineQuery([VisibleComponent, BoundingBoxComponent])

export function findBBoxes(intersectionData: Set<IntersectionData>, ray: Ray, hitTarget: Vector3) {
  const inputState = getState(InputState)
  for (const entity of inputState.inputBoundingBoxes) {
    const boundingBox = getOptionalComponent(entity, BoundingBoxComponent)
    if (!boundingBox) continue
    const hit = ray.intersectBox(boundingBox.box, hitTarget)
    if (!hit) continue // @note Clause Guard. The next line was nested inside   if (hit) { ... }
    intersectionData.add({ entity, distance: ray.origin.distanceTo(hitTarget) })
  }
}

const meshesQuery = defineQuery([VisibleComponent, MeshComponent])

export function findMeshes(intersectionData: Set<IntersectionData>, isEditing: boolean, caster: Raycaster) {
  const inputState = getState(InputState)
  const objects = (isEditing ? meshesQuery() : Array.from(inputState.inputMeshes)) // gizmo heuristic
    .filter((eid) => hasComponent(eid, GroupComponent))
    .map((eid) => getComponent(eid, GroupComponent))
    .flat()

  const hits = caster.intersectObjects<Object3D>(objects, true)
  for (const hit of hits) {
    const parentObject = Object3DUtils.findAncestor(hit.object, (obj) => obj.entity != undefined)
    if (!parentObject) continue // @note Clause Guard. The next line was nested inside   if (parentObject) { ... }
    intersectionData.add({ entity: parentObject.entity, distance: hit.distance })
  }
}

export function findRaycastedInput(
  sourceEid: Entity,
  intersectionData: Set<IntersectionData>,
  data: HeuristicData,
  heuristic: HeuristicFunctions
) {
  const sourceRotation = TransformComponent.getWorldRotation(sourceEid, data.quaternion)
  data.raycast.direction.copy(ObjectDirection.Forward).applyQuaternion(sourceRotation)

  TransformComponent.getWorldPosition(sourceEid, data.raycast.origin).addScaledVector(data.raycast.direction, -0.01)
  data.ray.set(data.raycast.origin, data.raycast.direction)
  data.caster.set(data.raycast.origin, data.raycast.direction)
  data.caster.layers.enable(ObjectLayers.Scene)

  const isEditing = getState(EngineState).isEditing
  // only heuristic is scene objects when in the editor
  if (isEditing) {
    heuristic.editor(intersectionData, data.caster)
  } else {
    // 1st heuristic is XRUI
    heuristic.xrui(intersectionData, data.ray)
    // 2nd heuristic is physics colliders
    heuristic.physicsColliders(intersectionData, data.raycast)

    // 3rd heuristic is bboxes
    heuristic.bboxes(intersectionData, data.ray, data.hitTarget)
  }
  // 4th heuristic is meshes
  heuristic.meshes(intersectionData, isEditing, data.caster)
}

export const ClientInputHeuristics = {
  findProximity,
  findEditor,
  findXRUI,
  findPhysicsColliders,
  findBBoxes,
  findMeshes,
  findRaycastedInput
}
export default ClientInputHeuristics
