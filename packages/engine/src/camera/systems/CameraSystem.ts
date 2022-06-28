import { ArrowHelper, Clock, Material, MathUtils, Matrix4, Quaternion, Raycaster, SkinnedMesh, Vector3 } from 'three'
import { clamp } from 'three/src/math/MathUtils'

import { BoneNames } from '../../avatar/AvatarBoneMatching'
import { AvatarAnimationComponent } from '../../avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { XRCameraUpdatePendingTagComponent } from '../../avatar/components/XRCameraUpdatePendingTagComponent'
import { setAvatarHeadOpacity } from '../../avatar/functions/avatarFunctions'
import { smoothDamp } from '../../common/functions/MathLerpFunctions'
import { createConeOfVectors } from '../../common/functions/vectorHelpers'
import { Engine } from '../../ecs/classes/Engine'
import { getEngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { CameraPropertiesComponent } from '../../scene/components/CameraPropertiesComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { PersistTagComponent } from '../../scene/components/PersistTagComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { RAYCAST_PROPERTIES_DEFAULT_VALUES } from '../../scene/functions/loaders/CameraPropertiesFunctions'
import { setCameraProperties } from '../../scene/functions/setCameraProperties'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { FollowCameraComponent, FollowCameraDefaultValues } from '../components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '../components/TargetCameraRotationComponent'

const direction = new Vector3()
const quaternion = new Quaternion()
const upVector = new Vector3(0, 1, 0)
const empty = new Vector3()
const mx = new Matrix4()
const tempVec = new Vector3()
const tempVec1 = new Vector3()
const raycaster = new Raycaster()
//const cameraRayCount = 1
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

export const getAvatarBonePosition = (entity: Entity, name: BoneNames, position: Vector3): void => {
  const animationComponent = getComponent(entity, AvatarAnimationComponent)
  const el = animationComponent.rig[name].matrixWorld.elements
  position.set(el[12], el[13], el[14])
}

export const updateCameraTargetOpacity = (cameraEntity: Entity) => {
  const fadeDistance = 0.6
  const followCamera = getComponent(cameraEntity, FollowCameraComponent)

  if (!followCamera.targetEntity) return

  const opacity = Math.pow(clamp((followCamera.distance - 0.1) / fadeDistance, 0, 1), 6)

  setAvatarHeadOpacity(followCamera.targetEntity, opacity)
}

export const updateCameraTargetRotation = (cameraEntity: Entity) => {
  if (!cameraEntity) return
  const followCamera = getComponent(cameraEntity, FollowCameraComponent)
  const target = getComponent(followCamera.targetEntity, TargetCameraRotationComponent)
  if (!target) return

  const epsilon = 0.001

  target.phi = Math.min(followCamera.maxPhi, Math.max(followCamera.minPhi, target.phi))

  if (Math.abs(target.phi - followCamera.phi) < epsilon && Math.abs(target.theta - followCamera.theta) < epsilon) {
    removeComponent(followCamera.targetEntity, TargetCameraRotationComponent)
    return
  }

  const delta = Engine.instance.currentWorld.deltaSeconds
  followCamera.phi = smoothDamp(followCamera.phi, target.phi, target.phiVelocity, target.time, delta)
  followCamera.theta = smoothDamp(followCamera.theta, target.theta, target.thetaVelocity, target.time, delta)
}

export const getMaxCamDistance = (cameraEntity: Entity, target: Vector3) => {
  const followCamera = getComponent(cameraEntity, FollowCameraComponent)

  // Cache the raycast result for 0.1 seconds
  const raycastProps = followCamera.raycastProps
  if (camRayCastCache.maxDistance != -1 && camRayCastClock.getElapsedTime() < raycastProps.rayFrequency) {
    return camRayCastCache
  }

  camRayCastClock.start()

  const sceneObjects = Array.from(Engine.instance.currentWorld.objectLayerList[ObjectLayers.Scene] || [])

  // Raycast to keep the line of sight with avatar
  const cameraTransform = getComponent(Engine.instance.currentWorld.cameraEntity, TransformComponent)
  const targetToCamVec = tempVec1.subVectors(cameraTransform.position, target)
  // raycaster.ray.origin.sub(targetToCamVec.multiplyScalar(0.1)) // move origin behind camera

  createConeOfVectors(targetToCamVec, cameraRays, rayConeAngle)

  let maxDistance = Math.min(followCamera.maxDistance, raycastProps.rayLength)

  // Check hit with mid ray
  raycaster.layers.set(ObjectLayers.Scene) // Ignore avatars
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
    target.set(0, avatar.avatarHeight, 0.2)
    target.applyQuaternion(transform.rotation)
    target.add(transform.position)
  } else {
    target.copy(transform.position)
  }
}

export const updateFollowCamera = (cameraEntity: Entity) => {
  if (!cameraEntity) return
  const followCamera = getComponent(cameraEntity, FollowCameraComponent)
  const object3DComponent = getComponent(cameraEntity, Object3DComponent)
  object3DComponent?.value.updateWorldMatrix(false, true)

  // Limit the pitch
  followCamera.phi = Math.min(followCamera.maxPhi, Math.max(followCamera.minPhi, followCamera.phi))

  calculateCameraTarget(followCamera.targetEntity, tempVec)

  let maxDistance = followCamera.zoomLevel
  let isInsideWall = false

  // Run only if not in first person mode
  if (followCamera.raycastProps.enabled && followCamera.zoomLevel >= followCamera.minDistance) {
    const distanceResults = getMaxCamDistance(cameraEntity, tempVec)
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
  let smoothingSpeed = isInsideWall ? 0.1 : 0.3
  const delta = Engine.instance.currentWorld.deltaSeconds

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

  const cameraTransform = getComponent(Engine.instance.currentWorld.cameraEntity, TransformComponent)
  cameraTransform.position.set(
    tempVec.x + followCamera.distance * Math.sin(thetaRad) * Math.cos(phiRad),
    tempVec.y + followCamera.distance * Math.sin(phiRad),
    tempVec.z + followCamera.distance * Math.cos(thetaRad) * Math.cos(phiRad)
  )

  direction.copy(cameraTransform.position).sub(tempVec).normalize()

  mx.lookAt(direction, empty, upVector)
  cameraTransform.rotation.setFromRotationMatrix(mx)

  updateCameraTargetOpacity(cameraEntity)
  updateCameraTargetRotation(cameraEntity)
}

export default async function CameraSystem(world: World) {
  const followCameraQuery = defineQuery([TransformComponent, FollowCameraComponent])

  if (!Engine.instance.isEditor) {
    addComponent(world.cameraEntity, FollowCameraComponent, {
      ...FollowCameraDefaultValues,
      targetEntity: world.localClientEntity
    })
  }

  return () => {
    for (const entity of followCameraQuery.enter()) {
      const cameraFollow = getComponent(entity, FollowCameraComponent)
      //check for initialized raycast properties
      if (!cameraFollow.raycastProps) {
        cameraFollow.raycastProps = RAYCAST_PROPERTIES_DEFAULT_VALUES
      }
      for (let i = 0; i < cameraFollow.raycastProps.rayCount; i++) {
        cameraRays.push(new Vector3())

        if (debugRays) {
          const arrow = new ArrowHelper()
          coneDebugHelpers.push(arrow)
          setObjectLayers(arrow, ObjectLayers.Gizmos)
          Engine.instance.currentWorld.scene.add(arrow)
        }
      }
    }

    for (const cameraEntity of followCameraQuery()) updateFollowCamera(cameraEntity)

    if (EngineRenderer.instance.xrManager?.isPresenting) {
      EngineRenderer.instance.xrManager.updateCamera(Engine.instance.currentWorld.camera as THREE.PerspectiveCamera)
      removeComponent(Engine.instance.currentWorld.localClientEntity, XRCameraUpdatePendingTagComponent)
    }
  }
}
