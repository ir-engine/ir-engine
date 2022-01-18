import { ArrowHelper, Clock, MathUtils, Matrix4, Quaternion, Vector3 } from 'three'
import { Engine } from '../../ecs/classes/Engine'
import { addComponent, defineQuery, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CameraComponent } from '../components/CameraComponent'
import { FollowCameraComponent } from '../components/FollowCameraComponent'
import { Entity } from '../../ecs/classes/Entity'
import { PersistTagComponent } from '../../scene/components/PersistTagComponent'
import { World } from '../../ecs/classes/World'
import { System } from '../../ecs/classes/System'
import { lerp, smoothDamp } from '../../common/functions/MathLerpFunctions'
import { TargetCameraRotationComponent } from '../components/TargetCameraRotationComponent'
import { createConeOfVectors } from '../../common/functions/vectorHelpers'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { setAvatarHeadOpacity } from '../../avatar/functions/avatarFunctions'
import { avatarCameraOffset, getAvatarCameraPosition } from '../../avatar/functions/moveAvatar'

const direction = new Vector3()
const quaternion = new Quaternion()
const upVector = new Vector3(0, 1, 0)
const empty = new Vector3()
const mx = new Matrix4()
const tempVec = new Vector3()
const tempVec1 = new Vector3()
const cameraRayCount = 6
const cameraRays: Vector3[] = []
const rayConeAngle = Math.PI / 6
const coneDebugHelpers: ArrowHelper[] = []
const debugRays = false
const camRayCastClock = new Clock()
const camRayCastCache = {
  maxDistance: -1,
  targetHit: false
}

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

const updateAvatarHeadOpacity = (entity: Entity) => {
  if (!entity) return

  const followCamera = getComponent(entity, FollowCameraComponent)
  const distanceRatio = Math.min(followCamera.distance / followCamera.minDistance, 1)

  setAvatarHeadOpacity(entity, distanceRatio)
}

const updateCameraTargetRotation = (entity: Entity, delta: number) => {
  if (!entity) return
  const followCamera = getComponent(entity, FollowCameraComponent)
  const target = getComponent(entity, TargetCameraRotationComponent)
  const epsilon = 0.001

  target.phi = Math.min(followCamera.maxPhi, Math.max(followCamera.minPhi, target.phi))

  if (Math.abs(target.phi - followCamera.phi) < epsilon && Math.abs(target.theta - followCamera.theta) < epsilon) {
    removeComponent(entity, TargetCameraRotationComponent)
    return
  }

  followCamera.phi = smoothDamp(followCamera.phi, target.phi, target.phiVelocity, target.time, delta)
  followCamera.theta = smoothDamp(followCamera.theta, target.theta, target.thetaVelocity, target.time, delta)
}

const getMaxCamDistance = (entity: Entity, target: Vector3) => {
  // Cache the raycast result for 0.1 seconds
  // if (camRayCastCache.maxDistance != -1 && camRayCastClock.getElapsedTime() < 0.1) {
  //   return camRayCastCache
  // }

  camRayCastClock.start()

  const sceneObjects = Array.from(Engine.objectLayerList[ObjectLayers.Scene] || [])

  const followCamera = getComponent(entity, FollowCameraComponent)

  // Raycast to keep the line of sight with avatar
  const cameraTransform = getComponent(Engine.activeCameraEntity, TransformComponent)
  const targetToCamVec = tempVec1.subVectors(cameraTransform.position, target)
  // followCamera.raycaster.ray.origin.sub(targetToCamVec.multiplyScalar(0.1)) // move origin behind camera

  createConeOfVectors(targetToCamVec, cameraRays, rayConeAngle)

  let maxDistance = followCamera.maxDistance

  // Check hit with mid ray
  followCamera.raycaster.set(target, targetToCamVec.normalize())
  const hits = followCamera.raycaster.intersectObjects(sceneObjects, true)

  if (hits[0] && hits[0].distance < maxDistance) {
    maxDistance = hits[0].distance
  }

  //Check the cone for minimum distance
  cameraRays.forEach((rayDir, i) => {
    followCamera.raycaster.set(target, rayDir)
    const hits = followCamera.raycaster.intersectObjects(sceneObjects, true)

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

const calculateCameraTarget = (entity: Entity, target: Vector3) => {
  const followCamera = getComponent(entity, FollowCameraComponent)

  const minDistanceRatio = Math.min(followCamera.distance / followCamera.minDistance, 1)
  const side = followCamera.shoulderSide ? -1 : 1
  const shoulderOffset = lerp(0, 0.2, minDistanceRatio) * side
  //const heightOffset = lerp(0, 0.25, minDistanceRatio)

  tempVec1.copy(avatarCameraOffset).setX(shoulderOffset)
  getAvatarCameraPosition(entity, tempVec1, target)
}

const updateFollowCamera = (entity: Entity, delta: number) => {
  if (!entity) return

  const followCamera = getComponent(entity, FollowCameraComponent)

  // Limit the pitch
  followCamera.phi = Math.min(followCamera.maxPhi, Math.max(followCamera.minPhi, followCamera.phi))

  calculateCameraTarget(entity, tempVec)

  let maxDistance = followCamera.zoomLevel
  let isInsideWall = false

  // Run only if not in first person mode
  if (followCamera.zoomLevel >= followCamera.minDistance) {
    const distanceResults = getMaxCamDistance(entity, tempVec)
    maxDistance = distanceResults.maxDistance
    isInsideWall = distanceResults.targetHit
  }

  const newZoomDistance = Math.min(followCamera.zoomLevel, maxDistance)

  // if (maxDistance < followCamera.zoomLevel) {
  //   // ground collision
  //   if (followCamera.phi < -15) {
  //     followCamera.distance = maxDistance
  //   }
  // }

  // Zoom smoothing
  let smoothingSpeed = isInsideWall ? 0.01 : 0.3

  followCamera.distance = smoothDamp(
    followCamera.distance,
    newZoomDistance,
    followCamera.zoomVelocity,
    smoothingSpeed,
    delta
  )

  const theta = followCamera.theta
  const thetaRad = MathUtils.degToRad(theta)
  const phiRad = MathUtils.degToRad(followCamera.phi)

  const cameraTransform = getComponent(Engine.activeCameraEntity, TransformComponent)
  cameraTransform.position.set(
    tempVec.x + followCamera.distance * Math.sin(thetaRad) * Math.cos(phiRad),
    tempVec.y + followCamera.distance * Math.sin(phiRad),
    tempVec.z + followCamera.distance * Math.cos(thetaRad) * Math.cos(phiRad)
  )

  direction.copy(cameraTransform.position).sub(tempVec).normalize()

  mx.lookAt(direction, empty, upVector)
  cameraTransform.rotation.setFromRotationMatrix(mx)

  const avatarTransform = getComponent(entity, TransformComponent)

  // TODO: Can move avatar update code outside this function
  if (followCamera.locked) {
    const newTheta = MathUtils.degToRad(theta + 180) % (Math.PI * 2)
    // avatarTransform.rotation.setFromAxisAngle(upVector, newTheta)
    avatarTransform.rotation.slerp(quaternion.setFromAxisAngle(upVector, newTheta), delta * 4)
  }
}

export default async function CameraSystem(world: World): Promise<System> {
  const followCameraQuery = defineQuery([FollowCameraComponent, TransformComponent, AvatarComponent])
  const targetCameraRotationQuery = defineQuery([FollowCameraComponent, TargetCameraRotationComponent])

  const cameraEntity = createEntity()
  addComponent(cameraEntity, CameraComponent, {})

  // addComponent(cameraEntity, Object3DComponent, { value: Engine.camera })
  addComponent(cameraEntity, TransformComponent, {
    position: new Vector3(),
    rotation: new Quaternion(),
    scale: new Vector3(1, 1, 1)
  })
  addComponent(cameraEntity, PersistTagComponent, {})
  Engine.activeCameraEntity = cameraEntity

  return () => {
    const { delta } = world

    for (const entity of followCameraQuery.enter()) {
      const cameraFollow = getComponent(entity, FollowCameraComponent)
      cameraFollow.raycaster.layers.set(ObjectLayers.Scene) // Ignore avatars
      ;(cameraFollow.raycaster as any).firstHitOnly = true // three-mesh-bvh setting
      cameraFollow.raycaster.far = cameraFollow.maxDistance
      Engine.activeCameraFollowTarget = entity

      for (let i = 0; i < cameraRayCount; i++) {
        cameraRays.push(new Vector3())

        if (debugRays) {
          const arrow = new ArrowHelper()
          coneDebugHelpers.push(arrow)
          setObjectLayers(arrow, ObjectLayers.Render, ObjectLayers.Gizmos)
          Engine.scene.add(arrow)
        }
      }
    }

    for (const entity of followCameraQuery.exit()) {
      setAvatarHeadOpacity(entity, 1)
      Engine.activeCameraFollowTarget = null
      camRayCastCache.maxDistance = -1
    }

    for (const entity of followCameraQuery(world)) {
      updateFollowCamera(entity, delta)
      updateAvatarHeadOpacity(entity)
    }

    for (const entity of targetCameraRotationQuery(world)) {
      updateCameraTargetRotation(entity, delta)
    }

    if (Engine.xrManager?.isPresenting) {
      Engine.xrManager.updateCamera(Engine.camera)
    } else if (Engine.activeCameraEntity !== undefined) {
      const transform = getComponent(Engine.activeCameraEntity, TransformComponent)
      Engine.camera.position.copy(transform.position)
      Engine.camera.quaternion.copy(transform.rotation)
      Engine.camera.scale.copy(transform.scale)
      Engine.camera.updateMatrixWorld()
    }
  }
}
