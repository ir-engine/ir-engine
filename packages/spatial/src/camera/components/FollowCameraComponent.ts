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

import { ECSState, defineQuery, useEntityContext } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'

import { Entity } from '@ir-engine/ecs/src/Entity'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { getState, useImmediateEffect, useMutableState } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { Clock, MathUtils, Raycaster, Vector3 } from 'three'
import { EngineState } from '../../EngineState'
import { Vector3_Up, Vector3_Zero } from '../../common/constants/MathConstants'
import { createConeOfVectors } from '../../common/functions/MathFunctions'
import { smoothDamp, smootherStep } from '../../common/functions/MathLerpFunctions'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { ObjectLayerComponents } from '../../renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { ObjectLayers } from '../../renderer/constants/ObjectLayers'
import { ComputedTransformComponent } from '../../transform/components/ComputedTransformComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CameraSettingsState } from '../CameraSceneMetadata'
import { setTargetCameraRotation } from '../functions/CameraFunctions'
import { FollowCameraMode, FollowCameraShoulderSide } from '../types/FollowCameraMode'
import { TargetCameraRotationComponent } from './TargetCameraRotationComponent'

const window = 'window' in globalThis ? globalThis.window : ({} as any as Window)

export const FollowCameraComponent = defineComponent({
  name: 'FollowCameraComponent',

  schema: S.Object({
    lerpValue: S.Number(0),
    originalPosition: S.Vec3(),
    originalOffset: S.Vec3(),
    originalRotation: S.Quaternion(),
    targetRotation: S.Quaternion(),
    targetPosition: S.Vec3(),
    targetOffset: S.Vec3(),
    targetToCamera: S.Vec3(),
    direction: S.Vec3(),
    lookAtMatrix: S.Mat4(),
    firstPersonOffset: S.Vec3(),
    thirdPersonOffset: S.Vec3(),
    currentOffset: S.Vec3(),
    offsetSmoothness: S.Number(0.1),
    targetEntity: S.Entity(),
    currentTargetPosition: S.Vec3(),
    targetPositionSmoothness: S.Number(0),
    mode: S.Enum(FollowCameraMode, FollowCameraMode.ThirdPerson),
    allowedModes: S.Array(S.Enum(FollowCameraMode), [
      FollowCameraMode.ThirdPerson,
      FollowCameraMode.FirstPerson,
      FollowCameraMode.TopDown,
      FollowCameraMode.ShoulderCam
    ]),
    distance: S.Number(0),
    targetDistance: S.Number(0),
    zoomVelocity: S.Object({
      value: S.Number(0)
    }),
    thirdPersonMinDistance: S.Number(0),
    thirdPersonMaxDistance: S.Number(0),
    effectiveMinDistance: S.Number(0),
    effectiveMaxDistance: S.Number(0),
    theta: S.Number(180),
    phi: S.Number(10),
    minPhi: S.Number(0),
    maxPhi: S.Number(0),
    locked: S.Bool(false),
    enabled: S.Bool(true),
    shoulderSide: S.Enum(FollowCameraShoulderSide, FollowCameraShoulderSide.Left),
    raycastProps: S.Object({
      enabled: S.Bool(true),
      rayCount: S.Number(3),
      rayLength: S.Number(15.0),
      rayFrequency: S.Number(0.1),
      rayConeAngle: S.Number(Math.PI / 12),
      camRayCastClock: S.Class(() => new Clock()),
      camRayCastCache: S.Object({
        maxDistance: S.Number(-1),
        targetHit: S.Bool(false)
      }),
      cameraRays: S.Array(S.Vec3(), [])
    }),
    accumulatedZoomTriggerDebounceTime: S.Number(-1),
    lastZoomStartDistance: S.Number(0)
  }),

  reactor: () => {
    const entity = useEntityContext()
    const follow = useComponent(entity, FollowCameraComponent)
    const cameraSettingsState = useMutableState(CameraSettingsState)

    useImmediateEffect(() => {
      const cameraSettings = cameraSettingsState.value

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
      for (let i = 0; i < follow.raycastProps.rayCount.value; i++) {
        cameraRays.push(new Vector3())
      }
      follow.raycastProps.cameraRays.set(cameraRays)

      const windowHeight = 'innerHeight' in window ? window.innerHeight : 1
      const windowWidth = 'innerWidth' in window ? window.innerWidth : 2
      const distance = (windowHeight / windowWidth) * cameraSettings.startCameraDistance

      follow.merge({
        distance: cameraSettings.startCameraDistance,
        targetDistance: cameraSettings.startCameraDistance,
        thirdPersonMinDistance: cameraSettings.minCameraDistance,
        thirdPersonMaxDistance: cameraSettings.maxCameraDistance,
        effectiveMinDistance: cameraSettings.minCameraDistance,
        effectiveMaxDistance: cameraSettings.maxCameraDistance,
        minPhi: cameraSettings.minPhi,
        maxPhi: cameraSettings.maxPhi,
        lastZoomStartDistance: (cameraSettings.minCameraDistance + cameraSettings.minCameraDistance) / 2
      })
    }, [cameraSettingsState])

    useEffect(() => {
      const followCamera = getComponent(entity, FollowCameraComponent)

      setComponent(entity, ComputedTransformComponent, {
        referenceEntities: [followCamera.targetEntity],
        computeFunction: () => computeCameraFollow(entity, followCamera.targetEntity)
      })
      return () => {
        removeComponent(entity, ComputedTransformComponent)
        followCamera.originalPosition.copy(Vector3_Zero)
      }
    }, [])

    useImmediateEffect(() => {
      if (follow.mode.value === FollowCameraMode.FirstPerson) {
        follow.targetDistance.set(0)
      }
    }, [follow.mode])

    useEffect(() => {
      follow.lerpValue.set(0)
      const followCamera = getComponent(entity, FollowCameraComponent)
      const followTransform = getComponent(entity, TransformComponent)
      followCamera.originalPosition.copy(followTransform.position)
      followCamera.originalRotation.copy(followTransform.rotation)
      followCamera.originalOffset?.copy(Vector3_Zero)
      follow.currentTargetPosition.value.copy(followCamera.originalPosition)
      follow.currentOffset.value.copy(Vector3_Zero)
    }, [follow.targetEntity])

    return null
  }
})

const raycaster = new Raycaster()

const MODE_SWITCH_DEBOUNCE = 0.03
const LERP_TIME = 1

const computeCameraFollow = (cameraEntity: Entity, referenceEntity: Entity) => {
  const follow = getComponent(cameraEntity, FollowCameraComponent)
  const followState = getMutableComponent(cameraEntity, FollowCameraComponent)
  const cameraTransform = getComponent(cameraEntity, TransformComponent)
  const targetTransform = getComponent(referenceEntity, TransformComponent)

  followState.lerpValue.set(
    follow.mode != FollowCameraMode.FirstPerson && follow.thirdPersonOffset.y === 0
      ? 0
      : Math.min(followState.lerpValue.value + getState(ECSState).deltaSeconds, LERP_TIME)
  )
  const lerpVal = smootherStep(followState.lerpValue.value / LERP_TIME)

  if (!targetTransform || !follow || !follow?.enabled) return

  // Limit the pitch
  follow.phi = Math.min(follow.maxPhi, Math.max(follow.minPhi, follow.phi))

  let isInsideWall = false

  follow.targetOffset =
    follow.mode === FollowCameraMode.FirstPerson
      ? follow.firstPersonOffset
      : follow.thirdPersonOffset.y === 0
      ? follow.targetOffset.set(0, cameraTransform.position.y, 0)
      : follow.thirdPersonOffset

  const lerpstart =
    follow.originalOffset.distanceToSquared(Vector3_Zero) > 0 ? follow.originalOffset : follow.currentOffset

  follow.currentOffset.lerpVectors(lerpstart, follow.targetOffset, lerpVal)

  follow.targetPosition
    .copy(follow.targetOffset)
    .applyQuaternion(TransformComponent.getWorldRotation(referenceEntity, targetTransform.rotation))
    .add(TransformComponent.getWorldPosition(referenceEntity, new Vector3()))

  follow.currentTargetPosition.lerpVectors(
    follow.originalPosition ?? follow.currentTargetPosition,
    follow.targetPosition,
    lerpVal
  )

  // Run only if not in first person mode
  let obstacleDistance = Infinity
  let obstacleHit = false
  if (follow.raycastProps.enabled && follow.mode !== FollowCameraMode.FirstPerson) {
    const distanceResults = getMaxCamDistance(cameraEntity, follow.currentTargetPosition)
    if (distanceResults.maxDistance > 0.1) {
      obstacleDistance = distanceResults.maxDistance
    }
    isInsideWall = distanceResults.targetHit
    obstacleHit = distanceResults.targetHit
  }

  if (follow.mode === FollowCameraMode.FirstPerson) {
    follow.effectiveMinDistance = follow.effectiveMaxDistance = 0
  } else if (follow.mode === FollowCameraMode.ThirdPerson || follow.mode === FollowCameraMode.ShoulderCam) {
    follow.effectiveMaxDistance = Math.min(obstacleDistance * (obstacleHit ? 0.8 : 1), follow.thirdPersonMaxDistance)
    follow.effectiveMinDistance = Math.min(follow.thirdPersonMinDistance, follow.effectiveMaxDistance)
  } else if (follow.mode === FollowCameraMode.TopDown) {
    follow.effectiveMinDistance = follow.effectiveMaxDistance = Math.min(
      obstacleDistance * (obstacleHit ? 0.9 : 1),
      follow.thirdPersonMaxDistance
    )
  }

  let newZoomDistance = Math.max(
    Math.min(follow.targetDistance, follow.effectiveMaxDistance),
    follow.effectiveMinDistance
  )

  const constrainTargetDistance = follow.accumulatedZoomTriggerDebounceTime === -1

  if (constrainTargetDistance) {
    follow.targetDistance = newZoomDistance
  }

  const triggerZoomShift = follow.accumulatedZoomTriggerDebounceTime > MODE_SWITCH_DEBOUNCE

  const minSpringFactor =
    Math.min(
      Math.sqrt(Math.abs(follow.targetDistance - follow.effectiveMinDistance)) *
        Math.sign(follow.targetDistance - follow.effectiveMinDistance),
      0
    ) * 0.5

  const maxSpringFactor =
    Math.max(
      Math.sqrt(Math.abs(follow.targetDistance - follow.effectiveMaxDistance)) *
        Math.sign(follow.targetDistance - follow.effectiveMaxDistance),
      0
    ) * 0.5

  if (follow.mode === FollowCameraMode.FirstPerson) {
    newZoomDistance = Math.sqrt(follow.targetDistance) * 0.5
    // Move from first person mode to third person mode
    if (triggerZoomShift) {
      follow.accumulatedZoomTriggerDebounceTime = -1
      if (
        follow.allowedModes.includes(FollowCameraMode.ThirdPerson) &&
        newZoomDistance > 0.1 * follow.thirdPersonMinDistance
      ) {
        // setup third person mode
        setTargetCameraRotation(cameraEntity, 0, follow.theta)
        followState.mode.set(FollowCameraMode.ThirdPerson)
        follow.targetDistance = newZoomDistance = follow.thirdPersonMinDistance
      } else {
        // reset first person mode
        follow.targetDistance = newZoomDistance = 0
      }
    }
  } else if (follow.mode === FollowCameraMode.ThirdPerson) {
    newZoomDistance = newZoomDistance + minSpringFactor + maxSpringFactor
    if (triggerZoomShift) {
      follow.accumulatedZoomTriggerDebounceTime = -1
      if (
        // Move from third person mode to first person mode
        follow.allowedModes.includes(FollowCameraMode.FirstPerson) &&
        follow.targetDistance < follow.effectiveMinDistance - follow.effectiveMaxDistance * 0.05 &&
        Math.abs(follow.lastZoomStartDistance - follow.effectiveMinDistance) < follow.effectiveMaxDistance * 0.05
      ) {
        setTargetCameraRotation(cameraEntity, 0, follow.theta)
        followState.mode.set(FollowCameraMode.FirstPerson)
        follow.targetDistance = newZoomDistance = 0
      } else if (
        // Move from third person mode to top down mode
        follow.allowedModes.includes(FollowCameraMode.TopDown) &&
        follow.targetDistance > follow.effectiveMaxDistance + follow.effectiveMaxDistance * 0.02 &&
        Math.abs(follow.lastZoomStartDistance - follow.effectiveMaxDistance) < follow.effectiveMaxDistance * 0.02
      ) {
        setTargetCameraRotation(cameraEntity, 85, follow.theta)
        followState.mode.set(FollowCameraMode.TopDown)
        follow.targetDistance = newZoomDistance = follow.effectiveMaxDistance
      } else {
        follow.targetDistance = newZoomDistance = Math.max(
          Math.min(follow.targetDistance, follow.effectiveMaxDistance),
          follow.effectiveMinDistance
        )
      }
    }
  } else if (follow.mode === FollowCameraMode.TopDown) {
    newZoomDistance += minSpringFactor + maxSpringFactor * 0.1
    // Move from top down mode to third person mode
    if (triggerZoomShift) {
      follow.accumulatedZoomTriggerDebounceTime = -1
      if (
        follow.allowedModes.includes(FollowCameraMode.ThirdPerson) &&
        newZoomDistance < follow.effectiveMaxDistance * 0.98 &&
        Math.abs(follow.lastZoomStartDistance - follow.effectiveMaxDistance) < 0.05 * follow.effectiveMaxDistance
      ) {
        setTargetCameraRotation(cameraEntity, 0, follow.theta)
        followState.mode.set(FollowCameraMode.ThirdPerson)
      }
      follow.targetDistance = newZoomDistance = follow.effectiveMaxDistance
    }
  }

  // Zoom smoothing
  const smoothingSpeed = isInsideWall ? 0.1 : 0.3
  const deltaSeconds = getState(ECSState).deltaSeconds

  //multiplying by lerpVal (always between 0 and 1) so we don't instantly apply followdistance to the camera transform when changing targets, but eventually maintain the full value.
  //multiplying by 3 and clamping to 1 so that the follow distance is achieved faster than the rest of the lerp
  follow.distance =
    Math.min(lerpVal * 3, 1) *
    smoothDamp(follow.distance, newZoomDistance, follow.zoomVelocity, smoothingSpeed, deltaSeconds)

  const theta = follow.theta
  const thetaRad = MathUtils.degToRad(theta)
  const phiRad = MathUtils.degToRad(follow.phi)

  follow.direction.set(Math.sin(thetaRad) * Math.cos(phiRad), Math.sin(phiRad), Math.cos(thetaRad) * Math.cos(phiRad))

  cameraTransform.position.set(
    follow.currentTargetPosition.x + follow.distance * follow.direction.x,
    follow.currentTargetPosition.y + follow.distance * follow.direction.y,
    follow.currentTargetPosition.z + follow.distance * follow.direction.z
  )

  follow.lookAtMatrix.lookAt(follow.direction, Vector3_Zero, Vector3_Up)

  //slerp using rotationLerp value, this is reset to zero every time the follow target changes
  follow.targetRotation.setFromRotationMatrix(follow.lookAtMatrix)
  cameraTransform.rotation.slerpQuaternions(
    follow.originalRotation ?? cameraTransform.rotation,
    follow.targetRotation,
    lerpVal
  )

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
  if (!followCamera.locked) {
    followCamera.phi = smoothDamp(followCamera.phi, target.phi, target.phiVelocity, target.time, delta)
    followCamera.theta = smoothDamp(followCamera.theta, target.theta, target.thetaVelocity, target.time, delta)
  }
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
  const cameraTransform = getComponent(getState(EngineState).viewerEntity, TransformComponent)
  followCamera.targetToCamera.subVectors(cameraTransform.position, target)
  // raycaster.ray.origin.sub(targetToCamVec.multiplyScalar(0.1)) // move origin behind camera

  createConeOfVectors(followCamera.targetToCamera, cameraRays, rayConeAngle)

  let maxDistance = Math.min(followCamera.thirdPersonMaxDistance, raycastProps.rayLength)

  // Check hit with mid ray
  raycaster.layers.set(ObjectLayers.Camera) // Ignore avatars
  // @ts-ignore - todo figure out why typescript freaks out at this
  raycaster.firstHitOnly = true // three-mesh-bvh setting
  raycaster.far = followCamera.thirdPersonMaxDistance
  raycaster.set(target, followCamera.targetToCamera.normalize())
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
