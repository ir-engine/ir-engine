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

import React, { useEffect } from 'react'
import { MathUtils, Matrix4, PerspectiveCamera, Raycaster, Vector3 } from 'three'

import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { deleteSearchParams } from '@etherealengine/common/src/utils/deleteSearchParams'
import { defineActionQueue, dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { FlyControlComponent } from '../../avatar/components/FlyControlComponent'
import { switchCameraMode } from '../../avatar/functions/switchCameraMode'
import { createConeOfVectors } from '../../common/functions/MathFunctions'
import { smoothDamp } from '../../common/functions/MathLerpFunctions'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import {
  defineQuery,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { NetworkObjectOwnedTag } from '../../networking/components/NetworkObjectComponent'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import {
  ComputedTransformComponent,
  setComputedTransformComponent
} from '../../transform/components/ComputedTransformComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CameraSettingsState } from '../CameraSceneMetadata'
import { CameraComponent } from '../components/CameraComponent'
import { FollowCameraComponent, coneDebugHelpers, debugRays } from '../components/FollowCameraComponent'
import { SpectatorComponent } from '../components/SpectatorComponent'
import { TargetCameraRotationComponent } from '../components/TargetCameraRotationComponent'
import { CameraFadeBlackEffectSystem } from './CameraFadeBlackEffectSystem'

const direction = new Vector3()
const upVector = new Vector3(0, 1, 0)
const empty = new Vector3()
const mx = new Matrix4()
const tempVec1 = new Vector3()
const raycaster = new Raycaster()

/**
 * Calculates and returns view vector for give angle. View vector will be at the given angle after the calculation
 * @param viewVector Current view vector
 * @param angle angle to which view vector will be rotated
 * @param isDegree Whether the angle is in degree or radian
 * @returns View vector having given angle in the world space
 */
export const rotateViewVectorXZ = (viewVector: Vector3, angle: number, isDegree?: boolean): Vector3 => {
  if (isDegree) {
    angle = (angle * Math.PI) / 180 // Convert to Radian
  }

  const oldAngle = Math.atan2(viewVector.x, viewVector.z)

  // theta - newTheta ==> To rotate Left on mouse drage Right -> Left
  // newTheta - theta ==> To rotate Right on mouse drage Right -> Left
  const dif = oldAngle - angle

  if (Math.abs(dif) % Math.PI > 0.0001) {
    viewVector.setX(Math.sin(oldAngle - dif))
    viewVector.setZ(Math.cos(oldAngle - dif))
  }

  return viewVector
}

export const updateCameraTargetRotation = (cameraEntity: Entity) => {
  if (!cameraEntity) return
  const followCamera = getComponent(cameraEntity, FollowCameraComponent)
  const target = getOptionalComponent(cameraEntity, TargetCameraRotationComponent)
  if (!target) return

  const epsilon = 0.001

  target.phi = Math.min(followCamera.maxPhi, Math.max(followCamera.minPhi, target.phi))

  if (Math.abs(target.phi - followCamera.phi) < epsilon && Math.abs(target.theta - followCamera.theta) < epsilon) {
    removeComponent(followCamera.targetEntity, TargetCameraRotationComponent)
    return
  }

  const delta = Engine.instance.deltaSeconds
  followCamera.phi = smoothDamp(followCamera.phi, target.phi, target.phiVelocity, target.time, delta)
  followCamera.theta = smoothDamp(followCamera.theta, target.theta, target.thetaVelocity, target.time, delta)
}

export const getMaxCamDistance = (cameraEntity: Entity, target: Vector3) => {
  const followCamera = getComponent(cameraEntity, FollowCameraComponent)

  // Cache the raycast result for 0.1 seconds
  const raycastProps = followCamera.raycastProps
  const { camRayCastCache, camRayCastClock, cameraRays, rayConeAngle } = raycastProps
  if (camRayCastCache.maxDistance != -1 && camRayCastClock.getElapsedTime() < raycastProps.rayFrequency) {
    return camRayCastCache
  }

  camRayCastClock.start()

  const sceneObjects = Array.from(Engine.instance.objectLayerList[ObjectLayers.Camera] || [])

  // Raycast to keep the line of sight with avatar
  const cameraTransform = getComponent(Engine.instance.cameraEntity, TransformComponent)
  const targetToCamVec = tempVec1.subVectors(cameraTransform.position, target)
  // raycaster.ray.origin.sub(targetToCamVec.multiplyScalar(0.1)) // move origin behind camera

  createConeOfVectors(targetToCamVec, cameraRays, rayConeAngle)

  let maxDistance = Math.min(followCamera.maxDistance, raycastProps.rayLength)

  // Check hit with mid ray
  raycaster.layers.set(ObjectLayers.Camera) // Ignore avatars
  raycaster.firstHitOnly = true // three-mesh-bvh setting
  raycaster.far = followCamera.maxDistance
  raycaster.set(target, targetToCamVec.normalize())
  const hits = raycaster.intersectObjects(sceneObjects, true)

  if (hits[0] && hits[0].distance < maxDistance) {
    maxDistance = hits[0].distance
  }

  //Check the cone for minimum distance
  cameraRays.forEach((rayDir, i) => {
    raycaster.set(target, rayDir)
    const hits = raycaster.intersectObjects(sceneObjects, true)

    if (hits[0] && hits[0].distance < maxDistance) {
      maxDistance = hits[0].distance
    }

    if (debugRays) {
      const helper = coneDebugHelpers[i]
      helper.setDirection(rayDir)
      helper.position.copy(target)

      if (hits[0]) {
        helper.setColor('red')
      } else {
        helper.setColor('green')
      }
    }
  })

  camRayCastCache.maxDistance = maxDistance
  camRayCastCache.targetHit = !!hits[0]

  return camRayCastCache
}

export const calculateCameraTarget = (entity: Entity, target: Vector3) => {
  const avatar = getComponent(entity, AvatarComponent)
  const transform = getComponent(entity, TransformComponent)

  if (!transform) return

  if (avatar) {
    target.set(0, avatar.avatarHeight - 0.1, 0.1)
    target.applyQuaternion(transform.rotation)
    target.add(transform.position)
  } else {
    target.copy(transform.position)
  }
}

const targetPosition = new Vector3()

const computeCameraFollow = (cameraEntity: Entity, referenceEntity: Entity) => {
  const followCamera = getComponent(cameraEntity, FollowCameraComponent)
  const cameraTransform = getComponent(cameraEntity, TransformComponent)
  const targetTransform = getComponent(referenceEntity, TransformComponent)

  if (!targetTransform || !followCamera) return

  // Limit the pitch
  followCamera.phi = Math.min(followCamera.maxPhi, Math.max(followCamera.minPhi, followCamera.phi))

  let maxDistance = followCamera.zoomLevel
  let isInsideWall = false

  targetPosition.copy(targetTransform.position)
  if (hasComponent(referenceEntity, AvatarComponent)) {
    targetPosition.y += getComponent(referenceEntity, AvatarComponent).avatarHeight * 0.95
  }

  // Run only if not in first person mode
  if (followCamera.raycastProps.enabled && followCamera.zoomLevel >= followCamera.minDistance) {
    const distanceResults = getMaxCamDistance(cameraEntity, targetPosition)
    maxDistance = distanceResults.maxDistance
    isInsideWall = distanceResults.targetHit
  }

  const newZoomDistance = Math.min(followCamera.zoomLevel, maxDistance)

  // Zoom smoothing
  let smoothingSpeed = isInsideWall ? 0.1 : 0.3

  followCamera.distance = smoothDamp(
    followCamera.distance,
    newZoomDistance,
    followCamera.zoomVelocity,
    smoothingSpeed,
    Engine.instance.deltaSeconds
  )

  const theta = followCamera.theta
  const thetaRad = MathUtils.degToRad(theta)
  const phiRad = MathUtils.degToRad(followCamera.phi)

  cameraTransform.position.set(
    targetPosition.x + followCamera.distance * Math.sin(thetaRad) * Math.cos(phiRad),
    targetPosition.y + followCamera.distance * Math.sin(phiRad),
    targetPosition.z + followCamera.distance * Math.cos(thetaRad) * Math.cos(phiRad)
  )

  direction.copy(cameraTransform.position).sub(targetPosition).normalize()

  mx.lookAt(direction, empty, upVector)
  cameraTransform.rotation.setFromRotationMatrix(mx)

  updateCameraTargetRotation(cameraEntity)
}

export function cameraSpawnReceptor(spawnAction: ReturnType<typeof WorldNetworkAction.spawnCamera>) {
  const entity = Engine.instance.getNetworkObject(spawnAction.$from, spawnAction.networkId)
  if (!entity) return

  console.log('Camera Spawn Receptor Call', entity)

  setComponent(entity, CameraComponent)
}

const followCameraQuery = defineQuery([FollowCameraComponent, TransformComponent])
const ownedNetworkCamera = defineQuery([CameraComponent, NetworkObjectOwnedTag])
const spectatorQuery = defineQuery([SpectatorComponent])
const cameraSpawnActions = defineActionQueue(WorldNetworkAction.spawnCamera.matches)
const spectateUserActions = defineActionQueue(EngineActions.spectateUser.matches)
const exitSpectateActions = defineActionQueue(EngineActions.exitSpectate.matches)

function CameraReactor() {
  const cameraSettings = useHookstate(getMutableState(CameraSettingsState))

  useEffect(() => {
    if (!cameraSettings?.cameraNearClip) return
    const camera = Engine.instance.camera as PerspectiveCamera
    if (camera?.isPerspectiveCamera) {
      camera.near = cameraSettings.cameraNearClip.value
      camera.far = cameraSettings.cameraFarClip.value
      camera.updateProjectionMatrix()
    }
    switchCameraMode(Engine.instance.cameraEntity, cameraSettings.value)
  }, [cameraSettings.cameraNearClip, cameraSettings.cameraFarClip])

  return null
}

const execute = () => {
  for (const action of cameraSpawnActions()) cameraSpawnReceptor(action)

  for (const action of spectateUserActions()) {
    const cameraEntity = Engine.instance.cameraEntity
    if (action.user) setComponent(cameraEntity, SpectatorComponent, { userId: action.user as UserId })
    else
      setComponent(cameraEntity, FlyControlComponent, {
        boostSpeed: 4,
        moveSpeed: 4,
        lookSensitivity: 5,
        maxXRotation: MathUtils.degToRad(80)
      })
  }

  for (const action of exitSpectateActions()) {
    const cameraEntity = Engine.instance.cameraEntity
    removeComponent(cameraEntity, SpectatorComponent)
    deleteSearchParams('spectate')
    dispatchAction(EngineActions.leaveWorld({}))
  }

  for (const cameraEntity of followCameraQuery.enter()) {
    const followCamera = getComponent(cameraEntity, FollowCameraComponent)
    setComputedTransformComponent(cameraEntity, followCamera.targetEntity, computeCameraFollow)
  }

  for (const cameraEntity of followCameraQuery.exit()) {
    removeComponent(cameraEntity, ComputedTransformComponent)
  }

  // as spectator: update local camera from network camera
  for (const cameraEntity of spectatorQuery.enter()) {
    const cameraTransform = getComponent(cameraEntity, TransformComponent)
    const spectator = getComponent(cameraEntity, SpectatorComponent)
    const networkCameraEntity = Engine.instance.getOwnedNetworkObjectWithComponent(spectator.userId, CameraComponent)
    const networkTransform = getComponent(networkCameraEntity, TransformComponent)
    setComputedTransformComponent(cameraEntity, networkCameraEntity, () => {
      cameraTransform.position.copy(networkTransform.position)
      cameraTransform.rotation.copy(networkTransform.rotation)
    })
  }

  // as spectatee: update network camera from local camera
  for (const networkCameraEntity of ownedNetworkCamera.enter()) {
    const networkTransform = getComponent(networkCameraEntity, TransformComponent)
    const cameraTransform = getComponent(Engine.instance.cameraEntity, TransformComponent)
    setComputedTransformComponent(networkCameraEntity, Engine.instance.cameraEntity, () => {
      networkTransform.position.copy(cameraTransform.position)
      networkTransform.rotation.copy(cameraTransform.rotation)
    })
  }
}

const reactor = () => {
  return <CameraReactor />
}

export const CameraSystem = defineSystem({
  uuid: 'ee.engine.CameraSystem',
  execute,
  reactor,
  subSystems: [CameraFadeBlackEffectSystem]
})
