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

import { useEffect } from 'react'
import { ArrowHelper, Clock, MathUtils, Matrix4, Raycaster, Vector3 } from 'three'

import { defineQuery, ECSState, Engine, useEntityContext } from '@etherealengine/ecs'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  removeComponent,
  setComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity, UndefinedEntity } from '@etherealengine/ecs/src/Entity'
import { getState } from '@etherealengine/hyperflux'

import { createConeOfVectors } from '../../common/functions/MathFunctions'
import { smoothDamp, smootheLerpAlpha } from '../../common/functions/MathLerpFunctions'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { ObjectLayerComponents } from '../../renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { ObjectLayers } from '../../renderer/constants/ObjectLayers'
import { TransformComponent } from '../../SpatialModule'
import { ComputedTransformComponent } from '../../transform/components/ComputedTransformComponent'
import { CameraSettingsState } from '../CameraSceneMetadata'
import { CameraMode } from '../types/CameraMode'
import { TargetCameraRotationComponent } from './TargetCameraRotationComponent'

export const coneDebugHelpers: ArrowHelper[] = []

export const FollowCameraComponent = defineComponent({
  name: 'FollowCameraComponent',
  onInit: (entity) => {
    /** @todo add a reactor to dynamically update to these values */
    const cameraSettings = getState(CameraSettingsState)

    // if (cameraSettings.projectionType === ProjectionType.Orthographic) {
    //   camera.camera = new OrthographicCamera(
    //     data.fov / -2,
    //     data.fov / 2,
    //     data.fov / 2,
    //     data.fov / -2,
    //     data.cameraNearClip,
    //     data.cameraFarClip
    //   )
    // } else if ((camera.camera as PerspectiveCamera).fov) {
    //   ;(camera.camera as PerspectiveCamera).fov = data.fov ?? 50
    // }

    const cameraRays = [] as Vector3[]
    const rayConeAngle = Math.PI / 6
    const camRayCastClock = new Clock()
    const camRayCastCache = {
      maxDistance: -1,
      targetHit: false
    }

    const raycastProps = {
      enabled: true,
      rayCount: 3,
      rayLength: 15.0,
      rayFrequency: 0.1,
      rayConeAngle,
      camRayCastClock,
      camRayCastCache,
      cameraRays
    }

    for (let i = 0; i < raycastProps.rayCount; i++) {
      cameraRays.push(new Vector3())
    }

    return {
      offset: new Vector3(),
      targetEntity: UndefinedEntity,
      currentTargetPosition: new Vector3(),
      targetPositionSmoothness: 0,
      mode: CameraMode.ThirdPerson,
      distance: cameraSettings.startCameraDistance,
      zoomLevel: 5,
      zoomVelocity: { value: 0 },
      minDistance: cameraSettings.minCameraDistance,
      maxDistance: cameraSettings.maxCameraDistance,
      theta: 180,
      phi: 10,
      minPhi: cameraSettings.minPhi,
      maxPhi: cameraSettings.maxPhi,
      shoulderSide: true,
      locked: true,
      raycastProps
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (typeof json.offset !== 'undefined') component.offset.set(json.offset)
    if (typeof json.targetEntity !== 'undefined') component.targetEntity.set(json.targetEntity)
    if (typeof json.mode !== 'undefined') component.mode.set(json.mode)
    if (typeof json.distance !== 'undefined') component.distance.set(json.distance)
    if (typeof json.zoomLevel !== 'undefined') component.zoomLevel.set(json.zoomLevel)
    if (typeof json.zoomVelocity !== 'undefined') component.zoomVelocity.set(json.zoomVelocity)
    if (typeof json.minDistance !== 'undefined') component.minDistance.set(json.minDistance)
    if (typeof json.maxDistance !== 'undefined') component.maxDistance.set(json.maxDistance)
    if (typeof json.theta !== 'undefined') component.theta.set(json.theta)
    if (typeof json.phi !== 'undefined') component.phi.set(json.phi)
    if (typeof json.minPhi !== 'undefined') component.minPhi.set(json.minPhi)
    if (typeof json.maxPhi !== 'undefined') component.maxPhi.set(json.maxPhi)
    if (typeof json.shoulderSide !== 'undefined') component.shoulderSide.set(json.shoulderSide)
    if (typeof json.locked !== 'undefined') component.locked.set(json.locked)
  },

  reactor: () => {
    const entity = useEntityContext()

    useEffect(() => {
      const followCamera = getComponent(entity, FollowCameraComponent)
      setComponent(entity, ComputedTransformComponent, {
        referenceEntities: [followCamera.targetEntity],
        computeFunction: () => computeCameraFollow(entity, followCamera.targetEntity)
      })

      return () => {
        removeComponent(entity, ComputedTransformComponent)
      }
    }, [])

    return null
  }
})

const targetPosition = new Vector3()
const direction = new Vector3()
const upVector = new Vector3(0, 1, 0)
const empty = new Vector3()
const mx = new Matrix4()
const tempVec1 = new Vector3()
const raycaster = new Raycaster()

const computeCameraFollow = (cameraEntity: Entity, referenceEntity: Entity) => {
  const followCamera = getComponent(cameraEntity, FollowCameraComponent)
  const cameraTransform = getComponent(cameraEntity, TransformComponent)
  const targetTransform = getComponent(referenceEntity, TransformComponent)

  if (!targetTransform || !followCamera) return

  // Limit the pitch
  followCamera.phi = Math.min(followCamera.maxPhi, Math.max(followCamera.minPhi, followCamera.phi))

  let maxDistance = followCamera.zoomLevel
  let isInsideWall = false

  targetPosition
    .copy(followCamera.offset)
    .applyQuaternion(TransformComponent.getWorldRotation(referenceEntity, targetTransform.rotation))
    .add(TransformComponent.getWorldPosition(referenceEntity, new Vector3()))

  const alpha = smootheLerpAlpha(followCamera.targetPositionSmoothness, getState(ECSState).deltaSeconds)
  followCamera.currentTargetPosition.lerp(targetPosition, alpha)

  // Run only if not in first person mode
  if (followCamera.raycastProps.enabled && followCamera.zoomLevel >= followCamera.minDistance) {
    const distanceResults = getMaxCamDistance(cameraEntity, followCamera.currentTargetPosition)
    maxDistance = distanceResults.maxDistance
    isInsideWall = distanceResults.targetHit
  }

  const newZoomDistance = Math.min(followCamera.zoomLevel, maxDistance)

  // Zoom smoothing
  const smoothingSpeed = isInsideWall ? 0.1 : 0.3
  const deltaSeconds = getState(ECSState).deltaSeconds

  followCamera.distance = smoothDamp(
    followCamera.distance,
    newZoomDistance,
    followCamera.zoomVelocity,
    smoothingSpeed,
    deltaSeconds
  )

  const theta = followCamera.theta
  const thetaRad = MathUtils.degToRad(theta)
  const phiRad = MathUtils.degToRad(followCamera.phi)

  cameraTransform.position.set(
    followCamera.currentTargetPosition.x + followCamera.distance * Math.sin(thetaRad) * Math.cos(phiRad),
    followCamera.currentTargetPosition.y + followCamera.distance * Math.sin(phiRad),
    followCamera.currentTargetPosition.z + followCamera.distance * Math.cos(thetaRad) * Math.cos(phiRad)
  )

  direction.copy(cameraTransform.position).sub(followCamera.currentTargetPosition).normalize()
  mx.lookAt(direction, empty, upVector)

  cameraTransform.rotation.setFromRotationMatrix(mx)

  updateCameraTargetRotation(cameraEntity)
}

const updateCameraTargetRotation = (cameraEntity: Entity) => {
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

  const delta = getState(ECSState).deltaSeconds
  followCamera.phi = smoothDamp(followCamera.phi, target.phi, target.phiVelocity, target.time, delta)
  followCamera.theta = smoothDamp(followCamera.theta, target.theta, target.thetaVelocity, target.time, delta)
}

const cameraLayerQuery = defineQuery([VisibleComponent, ObjectLayerComponents[ObjectLayers.Camera], MeshComponent])

const getMaxCamDistance = (cameraEntity: Entity, target: Vector3) => {
  const followCamera = getComponent(cameraEntity, FollowCameraComponent)

  // Cache the raycast result for 0.1 seconds
  const raycastProps = followCamera.raycastProps
  const { camRayCastCache, camRayCastClock, cameraRays, rayConeAngle } = raycastProps
  if (camRayCastCache.maxDistance != -1 && camRayCastClock.getElapsedTime() < raycastProps.rayFrequency) {
    return camRayCastCache
  }

  camRayCastClock.start()

  const sceneObjects = cameraLayerQuery().flatMap((e) => getComponent(e, MeshComponent))

  // Raycast to keep the line of sight with avatar
  const cameraTransform = getComponent(Engine.instance.cameraEntity, TransformComponent)
  const targetToCamVec = tempVec1.subVectors(cameraTransform.position, target)
  // raycaster.ray.origin.sub(targetToCamVec.multiplyScalar(0.1)) // move origin behind camera

  createConeOfVectors(targetToCamVec, cameraRays, rayConeAngle)

  let maxDistance = Math.min(followCamera.maxDistance, raycastProps.rayLength)

  // Check hit with mid ray
  raycaster.layers.set(ObjectLayers.Camera) // Ignore avatars
  // @ts-ignore - todo figure out why typescript freaks out at this
  raycaster.firstHitOnly = true // three-mesh-bvh setting
  raycaster.far = followCamera.maxDistance
  raycaster.set(target, targetToCamVec.normalize())
  const hits = raycaster.intersectObjects(sceneObjects, false)

  if (hits[0] && hits[0].distance < maxDistance) {
    maxDistance = hits[0].distance
  }

  //Check the cone for minimum distance
  cameraRays.forEach((rayDir, i) => {
    raycaster.set(target, rayDir)
    const hits = raycaster.intersectObjects(sceneObjects, false)

    if (hits[0] && hits[0].distance < maxDistance) {
      maxDistance = hits[0].distance
    }
  })

  camRayCastCache.maxDistance = maxDistance
  camRayCastCache.targetHit = !!hits[0]

  return camRayCastCache
}
