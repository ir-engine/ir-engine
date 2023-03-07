import { World } from '@dimforge/rapier3d-compat'
import _ from 'lodash'
import { CylinderGeometry, Mesh, MeshBasicMaterial, Object3D, Quaternion, Scene } from 'three'
import { Vector3 } from 'three'

import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { V_000, V_010 } from '../../common/constants/MathConstants'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { Physics, RaycastArgs } from '../../physics/classes/Physics'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { SceneQueryType } from '../../physics/types/PhysicsTypes'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'

const interactionGroups = getInteractionGroups(
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

  const physicsWorld = Engine.instance.physicsWorld

  const castedRay = Physics.castRayFromCamera(
    Engine.instance.camera,
    Engine.instance.pointerState.position,
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
    markerObject: undefined as undefined | Object3D,
    walkTarget: undefined as Vector3 | undefined
  })
})

const setupMarker = () => {
  const markerState = getMutableState(AutopilotMarker)
  const markerGeometry = new CylinderGeometry(0.175, 0.175, 0.05, 24, 1)
  const material = new MeshBasicMaterial({ color: '#FFF' })
  const mesh = new Mesh(markerGeometry, material)
  mesh.visible = false
  Engine.instance.scene.add(mesh)
  markerState.merge({ markerObject: mesh })
}

export const scaleFluctuate = (sinOffset = 4, scaleMultiplier = 0.2, pulseSpeed = 10) => {
  const marker = getMutableState(AutopilotMarker).markerObject.value!
  const scalePulse = scaleMultiplier * (sinOffset + Math.sin(pulseSpeed * Engine.instance.elapsedSeconds))
  marker.scale.set(scalePulse, 1, scalePulse)
  marker.updateMatrixWorld()
}

export async function placeMarker(rayNormal: Vector3) {
  const markerState = getMutableState(AutopilotMarker)

  if (!markerState.walkTarget.value) return

  if (!markerState.markerObject.value) setupMarker()

  const state = getMutableState(AutopilotMarker)
  const marker = state.markerObject.value!
  marker.visible = true

  const newRotation = new Quaternion().setFromUnitVectors(V_010, rayNormal)

  marker.position.copy(markerState.walkTarget.value)
  marker.quaternion.copy(newRotation)
  marker.updateMatrixWorld()
}

const minDot = 0.45
const toWalkPoint = new Vector3()
export const assessWalkability = (
  entity: Entity,
  rayNormal: Vector3,
  targetPosition: Vector3,
  world: World
): boolean => {
  const transform = getComponent(entity, TransformComponent)
  autopilotRaycastArgs.origin.copy(transform.position).setY(transform.position.y + 1.5)
  autopilotRaycastArgs.direction.copy(targetPosition).sub(autopilotRaycastArgs.origin)
  const castedRay = Physics.castRay(world, autopilotRaycastArgs)

  toWalkPoint.copy(castedRay[0].position as Vector3).sub(targetPosition)

  const flatEnough = rayNormal.dot(V_010) > minDot && toWalkPoint.lengthSq() < 0.5
  return flatEnough
}

export const clearWalkPoint = () => {
  const markerState = getMutableState(AutopilotMarker)
  markerState.walkTarget.set(undefined)
  markerState.markerObject.value!.visible = false
}
