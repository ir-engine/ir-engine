import _ from 'lodash'
import { CylinderGeometry, Material, Matrix4, Mesh, MeshBasicMaterial, Object3D, Quaternion, Scene } from 'three'
import { Vector3 } from 'three'

import { defineState, getState, useState } from '@xrengine/hyperflux'

import { V_010 } from '../../common/constants/MathConstants'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { Physics, RaycastArgs } from '../../physics/classes/Physics'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { RaycastHit, SceneQueryType } from '../../physics/types/PhysicsTypes'
import { AvatarAnimationComponentType } from '../components/AvatarAnimationComponent'
import { AvatarControllerComponent, AvatarControllerComponentType } from '../components/AvatarControllerComponent'

const interactionGroups = getInteractionGroups(
  CollisionGroups.Avatars,
  CollisionGroups.Ground | CollisionGroups.Default
)
const raycastArgs = {
  type: SceneQueryType.Closest,
  origin: new Vector3(),
  direction: new Vector3(),
  maxDistance: 250,
  groups: interactionGroups
} as RaycastArgs

export const autopilotSetPosition = (entity: Entity) => {
  const avatarControllerComponent = getComponent(entity, AvatarControllerComponent)
  const markerState = getState(AutopilotMarker)
  if (avatarControllerComponent.gamepadLocalInput.lengthSq() > 0) return

  const physicsWorld = Engine.instance.currentWorld.physicsWorld
  const world = Engine.instance.currentWorld

  const castedRay = Physics.castRayFromCamera(world.camera, world.pointerState.position, physicsWorld, raycastArgs)
  const rayNormal = new Vector3(castedRay[0].normal.x, castedRay[0].normal.y, castedRay[0].normal.z)
  if (!castedRay.length || !assessWalkability(entity, rayNormal)) return undefined

  const autopilotPosition = castedRay[0].position
  markerState.walkTarget.set(autopilotPosition as Vector3)

  placeMarker(rayNormal)
}

export const ScaleFluctuate = (Marker: Object3D, sinOffset = 4, scaleMultiplier = 0.2, pulseSpeed = 10) => {
  const scalePulse = scaleMultiplier * (sinOffset + Math.sin(pulseSpeed * Engine.instance.currentWorld.elapsedSeconds))
  Marker.scale.set(scalePulse, 1, scalePulse)
  Marker.updateMatrixWorld()
}

export const AutopilotMarker = defineState({
  name: 'autopilotMarkerState',
  initial: () => ({
    markerObject: new Object3D(),
    walkTarget: undefined as Vector3 | undefined
  })
})

const SetupMarker = () => {
  const markerState = getState(AutopilotMarker)
  const markerGeometry = new CylinderGeometry(0.175, 0.175, 0.05, 24, 1)
  const material = new MeshBasicMaterial({ color: '#00E14E' })
  const mesh = new Mesh(markerGeometry, material)
  mesh.visible = false
  Engine.instance.currentWorld.scene.add(mesh)
  markerState.markerObject.set(mesh)
}

SetupMarker()

export async function placeMarker(rayNormal: Vector3) {
  const markerState = getState(AutopilotMarker)

  if (!markerState.walkTarget.value) return

  const state = getState(AutopilotMarker)
  const marker = state.markerObject.value
  marker.visible = true

  const newRotation = new Quaternion().setFromUnitVectors(V_010, rayNormal)

  marker.position.copy(markerState.walkTarget.value)
  marker.quaternion.copy(newRotation)
  marker.updateMatrixWorld()

  const waitForAutopilot = () => {
    const reached = (resolve) => {
      if (!markerState.walkTarget.value) resolve()
      else setTimeout((_) => reached(resolve), 250)
    }
    return new Promise(reached)
  }

  await waitForAutopilot()

  marker.visible = false
}

const minDot = 0.45
export const assessWalkability = (entity: Entity, rayNormal: Vector3): boolean => {
  const flatEnough = rayNormal.dot(V_010) > minDot
  return flatEnough
}
