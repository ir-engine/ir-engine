import { Material, MathUtils, Matrix4, Quaternion, SkinnedMesh, Vector3 } from 'three'
import { Engine } from '../../ecs/classes/Engine'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { DesiredTransformComponent } from '../../transform/components/DesiredTransformComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CameraComponent } from '../components/CameraComponent'
import { FollowCameraComponent } from '../components/FollowCameraComponent'
import { CameraMode } from '../types/CameraMode'
import { Entity } from '../../ecs/classes/Entity'
import { PhysXInstance, RaycastQuery, SceneQueryType } from 'three-physx'
import { PersistTagComponent } from '../../scene/components/PersistTagComponent'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { World } from '../../ecs/classes/World'
import { System } from '../../ecs/classes/System'
import { lerp, smoothDamp } from '../../common/functions/MathLerpFunctions'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { TargetCameraRotationComponent } from '../components/TargetCameraRotationComponent'

const direction = new Vector3()
const quaternion = new Quaternion()
const upVector = new Vector3(0, 1, 0)
const empty = new Vector3()
const PI_2Deg = Math.PI / 180
const mx = new Matrix4()
const tempVec = new Vector3()
const tempVec1 = new Vector3()

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

const getPositionRate = () => (window?.innerWidth <= 768 ? 6 : 3)
const getRotationRate = () => (window?.innerWidth <= 768 ? 5 : 3.5)

const setAvatarOpacity = (entity: Entity, opacity: number): void => {
  const object3DComponent = getComponent(entity, Object3DComponent)
  object3DComponent.value.traverse((obj) => {
    const mat = (obj as SkinnedMesh).material as Material
    if (!mat) return
    mat.opacity = opacity
    mat.transparent = opacity != 1
  })
}

const updateAvatarOpacity = (entity: Entity) => {
  if (!entity) return

  const followCamera = getComponent(entity, FollowCameraComponent)
  const distanceRatio = Math.min(followCamera.distance / followCamera.minDistance, 1)

  setAvatarOpacity(entity, distanceRatio)
}

const updateCameraTargetRotation = (entity: Entity, delta: number) => {
  if (!entity) return
  const followCamera = getComponent(entity, FollowCameraComponent)
  const target = getComponent(entity, TargetCameraRotationComponent)
  const epsilon = 0.001

  if (Math.abs(target.phi - followCamera.phi) < epsilon && Math.abs(target.theta - followCamera.theta) < epsilon) {
    removeComponent(entity, TargetCameraRotationComponent)
    return
  }

  followCamera.phi = smoothDamp(followCamera.phi, target.phi, target.phiVelocity, target.time, delta)
  followCamera.theta = smoothDamp(followCamera.theta, target.theta, target.thetaVelocity, target.time, delta)
}

const updateFollowCamera = (entity: Entity, delta: number) => {
  if (!entity) return

  const followCamera = getComponent(entity, FollowCameraComponent)

  // Limit the pitch
  followCamera.phi = Math.min(85, Math.max(-70, followCamera.phi))

  // Zoom smoothing
  followCamera.distance = smoothDamp(
    followCamera.distance,
    followCamera.zoomLevel,
    followCamera.zoomVelocity,
    0.3,
    delta
  )

  let camDist = followCamera.distance
  const theta = followCamera.theta
  const phi = followCamera.phi

  const avatar = getComponent(entity, AvatarComponent)
  const avatarTransform = getComponent(entity, TransformComponent)

  const minDistanceRatio = Math.min(followCamera.distance / followCamera.minDistance, 1)
  const side = followCamera.shoulderSide ? -1 : 1
  const shoulderOffset = lerp(0, 0.2, minDistanceRatio) * side
  const heightOffset = lerp(0, 0.25, minDistanceRatio)

  tempVec.set(shoulderOffset, avatar.avatarHeight + heightOffset, 0)
  tempVec.applyQuaternion(avatarTransform.rotation)
  tempVec.add(avatarTransform.position)

  // Raycast for camera
  const cameraTransform = getComponent(Engine.activeCameraEntity, TransformComponent)
  const raycastDirection = tempVec1.setScalar(0).subVectors(cameraTransform.position, tempVec).normalize()
  followCamera.raycastQuery.origin.copy(tempVec)
  followCamera.raycastQuery.direction.copy(raycastDirection)

  const closestHit = followCamera.raycastQuery.hits[0]
  followCamera.rayHasHit = closestHit !== undefined

  if (followCamera.rayHasHit && closestHit.distance < camDist) {
    camDist = closestHit.distance < 0.5 ? closestHit.distance : closestHit.distance - 0.5
  }

  cameraTransform.position.set(
    tempVec.x + camDist * Math.sin(theta * PI_2Deg) * Math.cos(phi * PI_2Deg),
    tempVec.y + camDist * Math.sin(phi * PI_2Deg),
    tempVec.z + camDist * Math.cos(theta * PI_2Deg) * Math.cos(phi * PI_2Deg)
  )

  direction.copy(cameraTransform.position).sub(tempVec).normalize()

  mx.lookAt(direction, empty, upVector)
  cameraTransform.rotation.setFromRotationMatrix(mx)

  if (followCamera.locked) {
    const newTheta = MathUtils.degToRad(theta + 180) % (Math.PI * 2)
    avatarTransform.rotation.slerp(quaternion.setFromAxisAngle(upVector, newTheta), delta * 2)
  }
}

const followCamera = (entity: Entity, delta: number) => {
  if (!entity) return

  const cameraDesiredTransform = getComponent(Engine.activeCameraEntity, DesiredTransformComponent) // Camera

  if (!cameraDesiredTransform) return

  cameraDesiredTransform.rotationRate = getRotationRate()
  cameraDesiredTransform.positionRate = getPositionRate()

  const avatar = getComponent(entity, AvatarComponent)
  const avatarTransform = getComponent(entity, TransformComponent)

  const followCamera = getComponent(entity, FollowCameraComponent)

  let theta
  let camDist = followCamera.distance
  let phi = followCamera.phi

  if (followCamera.mode !== CameraMode.Strategic) {
    followCamera.phi = Math.min(85, Math.max(-70, followCamera.phi))
  }

  if (followCamera.mode === CameraMode.FirstPerson) {
    camDist = 0.01
    theta = followCamera.theta
    tempVec.set(0, avatar.avatarHeight, 0)
  } else if (followCamera.mode === CameraMode.Strategic) {
    tempVec.set(0, avatar.avatarHeight * 2, -3)
    theta = 180
    phi = 150
  } else {
    if (followCamera.mode === CameraMode.ShoulderCam) {
      camDist = followCamera.minDistance
    } else if (followCamera.mode === CameraMode.TopDown) {
      camDist = followCamera.maxDistance
      phi = 85
    }
    theta = followCamera.theta

    const shoulderOffset = followCamera.shoulderSide ? -0.2 : 0.2
    tempVec.set(shoulderOffset, avatar.avatarHeight + 0.25, 0)
  }

  tempVec.applyQuaternion(avatarTransform.rotation)
  tempVec.add(avatarTransform.position)

  // Raycast for camera
  const cameraTransform = getComponent(Engine.activeCameraEntity, TransformComponent)
  const raycastDirection = new Vector3().subVectors(cameraTransform.position, tempVec).normalize()
  followCamera.raycastQuery.origin.copy(tempVec)
  followCamera.raycastQuery.direction.copy(raycastDirection)

  const closestHit = followCamera.raycastQuery.hits[0]
  followCamera.rayHasHit = closestHit !== undefined

  if (
    followCamera.mode !== CameraMode.FirstPerson &&
    followCamera.mode !== CameraMode.Strategic &&
    followCamera.rayHasHit &&
    closestHit.distance < camDist
  ) {
    if (closestHit.distance < 0.5) {
      camDist = closestHit.distance
    } else {
      camDist = closestHit.distance - 0.5
    }
  }

  cameraDesiredTransform.position.set(
    tempVec.x + camDist * Math.sin(theta * PI_2Deg) * Math.cos(phi * PI_2Deg),
    tempVec.y + camDist * Math.sin(phi * PI_2Deg),
    tempVec.z + camDist * Math.cos(theta * PI_2Deg) * Math.cos(phi * PI_2Deg)
  )

  direction.copy(cameraDesiredTransform.position).sub(tempVec).normalize()

  mx.lookAt(direction, empty, upVector)
  cameraDesiredTransform.rotation.setFromRotationMatrix(mx)

  if (followCamera.mode === CameraMode.FirstPerson || Engine.defaultWorld.isInPortal) {
    cameraTransform.position.copy(cameraDesiredTransform.position)
    cameraTransform.rotation.copy(cameraDesiredTransform.rotation)
  }

  if (followCamera.locked || followCamera.mode === CameraMode.FirstPerson) {
    const newTheta = MathUtils.degToRad(followCamera.theta + 180) % (Math.PI * 2)
    avatarTransform.rotation.slerp(quaternion.setFromAxisAngle(upVector, newTheta), delta * 2)
  }
}

export const resetFollowCamera = () => {
  const transform = getComponent(Engine.activeCameraEntity, TransformComponent)
  const desiredTransform = getComponent(Engine.activeCameraEntity, DesiredTransformComponent)
  if (transform && desiredTransform) {
    followCamera(Engine.activeCameraFollowTarget, 1 / 60)
    transform.position.copy(desiredTransform.position)
    transform.rotation.copy(desiredTransform.rotation)
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

  // If we lose focus on the window, and regain it, copy our desired transform to avoid strange transform behavior and clipping
  EngineEvents.instance.addEventListener(EngineEvents.EVENTS.WINDOW_FOCUS, ({ focused }) => {
    if (focused) {
      resetFollowCamera()
    }
  })

  return () => {
    const { delta } = world

    for (const entity of followCameraQuery.enter()) {
      const cameraFollow = getComponent(entity, FollowCameraComponent)
      cameraFollow.raycastQuery = PhysXInstance.instance.addRaycastQuery(
        new RaycastQuery({
          type: SceneQueryType.Closest,
          origin: new Vector3(),
          direction: new Vector3(0, -1, 0),
          maxDistance: 10,
          collisionMask: cameraFollow.collisionMask
        })
      )
      Engine.activeCameraFollowTarget = entity
      if (hasComponent(Engine.activeCameraEntity, DesiredTransformComponent)) {
        removeComponent(Engine.activeCameraEntity, DesiredTransformComponent)
      }
      addComponent(Engine.activeCameraEntity, DesiredTransformComponent, {
        position: new Vector3(),
        rotation: new Quaternion(),
        lockRotationAxis: [false, true, false],
        rotationRate: getRotationRate(),
        positionRate: getPositionRate()
      })
      resetFollowCamera()
    }

    for (const entity of followCameraQuery.exit()) {
      const cameraFollow = getComponent(entity, FollowCameraComponent, true)
      if (cameraFollow) PhysXInstance.instance.removeRaycastQuery(cameraFollow.raycastQuery)
      const activeCameraComponent = getComponent(Engine.activeCameraEntity, CameraComponent)
      if (activeCameraComponent) {
        Engine.activeCameraFollowTarget = null
        removeComponent(Engine.activeCameraEntity, DesiredTransformComponent)
      }
    }

    for (const entity of followCameraQuery(world)) {
      updateFollowCamera(entity, delta)
      updateAvatarOpacity(entity)
    }

    for (const entity of targetCameraRotationQuery(world)) {
      updateCameraTargetRotation(entity, delta)
    }

    if (Engine.xrRenderer?.isPresenting) {
      Engine.xrRenderer.updateCamera(Engine.camera)
    } else if (typeof Engine.activeCameraEntity !== 'undefined') {
      const transform = getComponent(Engine.activeCameraEntity, TransformComponent)
      Engine.camera.position.copy(transform.position)
      Engine.camera.quaternion.copy(transform.rotation)
      Engine.camera.scale.copy(transform.scale)
      Engine.camera.updateMatrixWorld()
    }
  }
}
