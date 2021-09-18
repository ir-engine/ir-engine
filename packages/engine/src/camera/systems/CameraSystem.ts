import { Material, MathUtils, Matrix4, Quaternion, SkinnedMesh, Vector3 } from 'three'
import { Engine } from '../../ecs/classes/Engine'
import { addComponent, defineQuery, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CameraComponent } from '../components/CameraComponent'
import { FollowCameraComponent } from '../components/FollowCameraComponent'
import { Entity } from '../../ecs/classes/Entity'
import { PhysXInstance, RaycastQuery, SceneQueryType } from '../../physics/physx'
import { PersistTagComponent } from '../../scene/components/PersistTagComponent'
import { World } from '../../ecs/classes/World'
import { System } from '../../ecs/classes/System'
import { lerp, smoothDamp } from '../../common/functions/MathLerpFunctions'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { TargetCameraRotationComponent } from '../components/TargetCameraRotationComponent'

const direction = new Vector3()
const quaternion = new Quaternion()
const upVector = new Vector3(0, 1, 0)
const empty = new Vector3()
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

const setAvatarOpacity = (entity: Entity, opacity: number): void => {
  const object3DComponent = getComponent(entity, Object3DComponent)
  object3DComponent.value.traverse((obj) => {
    const mat = (obj as SkinnedMesh).material as Material
    if (!mat) return
    mat.opacity = opacity
    mat.transparent = opacity < 0.95
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
  let phi = followCamera.phi

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
  followCamera.rayHasHit = !!closestHit

  if (followCamera.rayHasHit && closestHit.distance < camDist) {
    camDist = closestHit.distance < 0.5 ? closestHit.distance : closestHit.distance - 0.5
  }

  const thetaRad = MathUtils.degToRad(theta)
  const phiRad = MathUtils.degToRad(phi)

  cameraTransform.position.set(
    tempVec.x + camDist * Math.sin(thetaRad) * Math.cos(phiRad),
    tempVec.y + camDist * Math.sin(phiRad),
    tempVec.z + camDist * Math.cos(thetaRad) * Math.cos(phiRad)
  )

  direction.copy(cameraTransform.position).sub(tempVec).normalize()

  mx.lookAt(direction, empty, upVector)
  cameraTransform.rotation.setFromRotationMatrix(mx)

  if (followCamera.locked) {
    const newTheta = MathUtils.degToRad(theta + 180) % (Math.PI * 2)
    avatarTransform.rotation.slerp(quaternion.setFromAxisAngle(upVector, newTheta), delta * 2)
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
    }

    for (const entity of followCameraQuery.exit()) {
      const cameraFollow = getComponent(entity, FollowCameraComponent, true)
      if (cameraFollow) PhysXInstance.instance.removeRaycastQuery(cameraFollow.raycastQuery)
      const activeCameraComponent = getComponent(Engine.activeCameraEntity, CameraComponent)
      if (activeCameraComponent) {
        Engine.activeCameraFollowTarget = null
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
