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

import { CylinderGeometry, Mesh, MeshBasicMaterial, Quaternion, Vector3 } from 'three'

import { getComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { createEntity } from '@etherealengine/ecs/src/EntityFunctions'
import { defineState, getMutableState, getState } from '@etherealengine/hyperflux'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { Vector3_Up } from '@etherealengine/spatial/src/common/constants/MathConstants'
import { InputPointerComponent } from '@etherealengine/spatial/src/input/components/InputPointerComponent'
import { Physics, PhysicsWorld, RaycastArgs } from '@etherealengine/spatial/src/physics/classes/Physics'
import { CollisionGroups } from '@etherealengine/spatial/src/physics/enums/CollisionGroups'
import { getInteractionGroups } from '@etherealengine/spatial/src/physics/functions/getInteractionGroups'
import { PhysicsState } from '@etherealengine/spatial/src/physics/state/PhysicsState'
import { SceneQueryType } from '@etherealengine/spatial/src/physics/types/PhysicsTypes'
import { addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { setVisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'

import { AvatarControllerComponent } from '../components/AvatarControllerComponent'

export const interactionGroups = getInteractionGroups(
  CollisionGroups.Avatars,
  CollisionGroups.Ground | CollisionGroups.Default
)

const autopilotRaycastArgs = {
  type: SceneQueryType.Closest,
  origin: new Vector3(),
  direction: new Vector3(),
  maxDistance: 250,
  groups: interactionGroups
} as RaycastArgs

export const autopilotSetPosition = (entity: Entity) => {
  const avatarControllerComponent = getComponent(entity, AvatarControllerComponent)
  const markerState = getMutableState(AutopilotMarker)
  if (avatarControllerComponent.gamepadLocalInput.lengthSq() > 0) return

  const { physicsWorld } = getState(PhysicsState)

  const inputPointerEntity = InputPointerComponent.getPointersForCanvas(Engine.instance.viewerEntity)
  if (!inputPointerEntity) return
  const pointerPosition = getComponent(inputPointerEntity, InputPointerComponent).position

  const castedRay = Physics.castRayFromCamera(
    getComponent(Engine.instance.cameraEntity, CameraComponent),
    pointerPosition,
    physicsWorld,
    autopilotRaycastArgs
  )

  if (!castedRay.length) return

  const rayNormal = new Vector3(castedRay[0].normal.x, castedRay[0].normal.y, castedRay[0].normal.z)

  if (!assessWalkability(entity, rayNormal, castedRay[0].position as Vector3, physicsWorld)) return

  const autopilotPosition = castedRay[0].position
  markerState.walkTarget.set(autopilotPosition as Vector3)

  placeMarker(rayNormal)
}

export const AutopilotMarker = defineState({
  name: 'autopilotMarkerState',
  initial: () => ({
    markerEntity: null as Entity | null,
    walkTarget: null as Vector3 | null
  })
})

const setupMarker = () => {
  const markerState = getMutableState(AutopilotMarker)
  const markerGeometry = new CylinderGeometry(0.175, 0.175, 0.05, 24, 1)
  const material = new MeshBasicMaterial({ color: '#FFF' })
  const mesh = new Mesh(markerGeometry, material)
  const markerEntity = createEntity()
  addObjectToGroup(markerEntity, mesh)
  markerState.markerEntity.set(markerEntity)
}

export const scaleFluctuate = (sinOffset = 4, scaleMultiplier = 0.2, pulseSpeed = 10) => {
  const markerEntity = getState(AutopilotMarker).markerEntity!
  const elapsedSeconds = getState(ECSState).elapsedSeconds
  const scalePulse = scaleMultiplier * (sinOffset + Math.sin(pulseSpeed * elapsedSeconds))
  const transformComponent = getComponent(markerEntity, TransformComponent)
  transformComponent.scale.set(scalePulse, 1, scalePulse)
}

export async function placeMarker(rayNormal: Vector3) {
  const markerState = getState(AutopilotMarker)

  if (!markerState.walkTarget) return

  if (!markerState.markerEntity) setupMarker()

  const marker = markerState.markerEntity!
  setVisibleComponent(marker, true)

  const newRotation = new Quaternion().setFromUnitVectors(Vector3_Up, rayNormal)

  const markerTransform = getComponent(marker, TransformComponent)
  markerTransform.position.copy(markerState.walkTarget)
  markerTransform.rotation.copy(newRotation)
}

const minDot = 0.45
const toWalkPoint = new Vector3()
export const assessWalkability = (
  entity: Entity,
  rayNormal: Vector3,
  targetPosition: Vector3,
  world: PhysicsWorld
): boolean => {
  const transform = getComponent(entity, TransformComponent)
  autopilotRaycastArgs.origin.copy(transform.position).setY(transform.position.y + 1.5)
  autopilotRaycastArgs.direction.copy(targetPosition).sub(autopilotRaycastArgs.origin)
  const castedRay = Physics.castRay(world, autopilotRaycastArgs)

  toWalkPoint.copy(castedRay[0].position as Vector3).sub(targetPosition)

  const flatEnough = rayNormal.dot(Vector3_Up) > minDot && toWalkPoint.lengthSq() < 0.5
  return flatEnough
}

export const clearWalkPoint = () => {
  const markerState = getMutableState(AutopilotMarker)
  markerState.walkTarget.set(null)
  if (!markerState.markerEntity.value) return
  setVisibleComponent(markerState.markerEntity.value, false)
}
