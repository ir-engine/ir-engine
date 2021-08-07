import { Matrix4, Vector3 } from 'three'
import { NumericalType, Vector2Type } from '../../common/types/NumericalTypes'
import { Engine } from '../../ecs/classes/Engine'
import { System } from '../../ecs/classes/System'
import {
  addComponent,
  createEntity,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/EntityFunctions'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { DesiredTransformComponent } from '../../transform/components/DesiredTransformComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CameraComponent } from '../components/CameraComponent'
import { FollowCameraComponent } from '../components/FollowCameraComponent'
import { CameraModes } from '../types/CameraModes'
import { Entity } from '../../ecs/classes/Entity'
import { PhysXInstance, RaycastQuery, SceneQueryType } from 'three-physx'
import { Input } from '../../input/components/Input'
import { BaseInput } from '../../input/enums/BaseInput'
import { PersistTagComponent } from '../../scene/components/PersistTagComponent'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { TouchInputs } from '../../input/enums/InputEnums'
import { InputValue } from '../../input/interfaces/InputValue'

const direction = new Vector3()
const upVector = new Vector3(0, 1, 0)
const empty = new Vector3()
const PI_2Deg = Math.PI / 180
const mx = new Matrix4()
const vec3 = new Vector3()

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

  if (Math.abs(dif) % Math.PI > 0.001) {
    viewVector.setX(Math.sin(oldAngle - dif))
    viewVector.setZ(Math.cos(oldAngle - dif))
  }

  return viewVector
}

const getPositionRate = () => (window?.innerWidth <= 768 ? 3.5 : 2)
const getRotationRate = () => (window?.innerWidth <= 768 ? 5 : 3.5)

const followCameraBehavior = (entity: Entity) => {
  if (!entity) return

  const cameraDesiredTransform = getMutableComponent(Engine.activeCameraEntity, DesiredTransformComponent) // Camera

  if (!cameraDesiredTransform && !Engine.portCamera) return

  cameraDesiredTransform.rotationRate = getRotationRate()
  cameraDesiredTransform.positionRate = getPositionRate()

  const avatar = getMutableComponent(entity, AvatarComponent)
  const avatarTransform = getMutableComponent(entity, TransformComponent)

  const followCamera = getMutableComponent(entity, FollowCameraComponent)

  const inputComponent = getComponent(entity, Input)

  // this is for future integration of MMO style pointer lock controls
  // const inputAxes = followCamera.mode === CameraModes.FirstPerson ? BaseInput.MOUSE_MOVEMENT : BaseInput.LOOKTURN_PLAYERONE
  const inputAxes = BaseInput.LOOKTURN_PLAYERONE

  let inputValue =
    inputComponent.data.get(inputAxes) ||
    ({
      type: 0,
      value: [0, 0] as Vector2Type
    } as InputValue<NumericalType>)

  let theta = Math.atan2(avatar.viewVector.x, avatar.viewVector.z)
  let camDist = followCamera.distance
  let phi = followCamera.phi

  if (followCamera.locked) {
    followCamera.theta = (theta * 180) / Math.PI + 180
  }

  if (followCamera.mode !== CameraModes.Strategic) {
    followCamera.theta -= inputValue.value[0] * (inputValue.inputAction === TouchInputs.Touch1Movement ? 60 : 100)
    followCamera.theta %= 360

    followCamera.phi -= inputValue.value[1] * (inputValue.inputAction === TouchInputs.Touch1Movement ? 100 : 60)
    followCamera.phi = Math.min(85, Math.max(-70, followCamera.phi))
  }

  if (followCamera.mode === CameraModes.FirstPerson) {
    camDist = 0.01
    theta = followCamera.theta
    vec3.set(0, avatar.avatarHeight, 0)
  } else if (followCamera.mode === CameraModes.Strategic) {
    vec3.set(0, avatar.avatarHeight * 2, -3)
    theta = 180
    phi = 150
  } else {
    if (followCamera.mode === CameraModes.ShoulderCam) {
      camDist = followCamera.minDistance
    } else if (followCamera.mode === CameraModes.TopDown) {
      camDist = followCamera.maxDistance
      phi = 85
    }
    theta = followCamera.theta

    const shoulderOffset = followCamera.shoulderSide ? -0.2 : 0.2
    vec3.set(shoulderOffset, avatar.avatarHeight + 0.25, 0)
  }

  vec3.applyQuaternion(avatarTransform.rotation)
  vec3.add(avatarTransform.position)

  // Raycast for camera
  const cameraTransform = getMutableComponent(Engine.activeCameraEntity, TransformComponent)
  const raycastDirection = new Vector3().subVectors(cameraTransform.position, vec3).normalize()
  followCamera.raycastQuery.origin.copy(vec3)
  followCamera.raycastQuery.direction.copy(raycastDirection)

  const closestHit = followCamera.raycastQuery.hits[0]
  followCamera.rayHasHit = typeof closestHit !== 'undefined'

  if (
    followCamera.mode !== CameraModes.FirstPerson &&
    followCamera.mode !== CameraModes.Strategic &&
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
    vec3.x + camDist * Math.sin(theta * PI_2Deg) * Math.cos(phi * PI_2Deg),
    vec3.y + camDist * Math.sin(phi * PI_2Deg),
    vec3.z + camDist * Math.cos(theta * PI_2Deg) * Math.cos(phi * PI_2Deg)
  )

  direction.copy(cameraDesiredTransform.position).sub(vec3).normalize()

  mx.lookAt(direction, empty, upVector)
  cameraDesiredTransform.rotation.setFromRotationMatrix(mx)

  if (followCamera.mode === CameraModes.FirstPerson || Engine.portCamera) {
    cameraTransform.position.copy(cameraDesiredTransform.position)
    cameraTransform.rotation.copy(cameraDesiredTransform.rotation)
  }

  if (followCamera.locked || followCamera.mode === CameraModes.FirstPerson) {
    const newTheta = ((followCamera.theta - 180) * Math.PI) / 180

    // Rotate actor
    avatarTransform.rotation.setFromAxisAngle(upVector, newTheta)

    // Update the view vector
    rotateViewVectorXZ(avatar.viewVector, newTheta)
  }
}

export const resetFollowCamera = () => {
  const transform = getComponent(Engine.activeCameraEntity, TransformComponent)
  const desiredTransform = getComponent(Engine.activeCameraEntity, DesiredTransformComponent)
  if (transform && desiredTransform) {
    followCameraBehavior(getMutableComponent(Engine.activeCameraEntity, CameraComponent).followTarget)
    transform.position.copy(desiredTransform.position)
    transform.rotation.copy(desiredTransform.rotation)
  }
}

/** System class which provides methods for Camera system. */
export class CameraSystem extends System {
  /** Constructs camera system. */
  constructor() {
    super()
    const cameraEntity = createEntity()
    addComponent(cameraEntity, CameraComponent)
    addComponent(cameraEntity, Object3DComponent, { value: Engine.camera })
    addComponent(cameraEntity, TransformComponent)
    addComponent(cameraEntity, PersistTagComponent)
    Engine.activeCameraEntity = cameraEntity

    // If we lose focus on the window, and regain it, copy our desired transform to avoid strange transform behavior and clipping
    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.WINDOW_FOCUS, ({ focused }) => {
      if (focused) {
        resetFollowCamera()
      }
    })
  }

  /**
   * Execute the camera system for different events of queries.\
   * Called each frame by default.
   *
   * @param delta time since last frame.
   */
  execute(delta: number): void {
    for (const entity of this.queryResults.followCameraComponent.added) {
      const cameraFollow = getMutableComponent(entity, FollowCameraComponent)
      cameraFollow.raycastQuery = PhysXInstance.instance.addRaycastQuery(
        new RaycastQuery({
          type: SceneQueryType.Closest,
          origin: new Vector3(),
          direction: new Vector3(0, -1, 0),
          maxDistance: 10,
          collisionMask: cameraFollow.collisionMask
        })
      )
      const activeCameraComponent = getMutableComponent(Engine.activeCameraEntity, CameraComponent)
      activeCameraComponent.followTarget = entity
      if (hasComponent(Engine.activeCameraEntity, DesiredTransformComponent)) {
        removeComponent(Engine.activeCameraEntity, DesiredTransformComponent)
      }
      addComponent(Engine.activeCameraEntity, DesiredTransformComponent, {
        lockRotationAxis: [false, true, false],
        rotationRate: getRotationRate(),
        positionRate: getPositionRate()
      })
      resetFollowCamera()
    }

    for (const entity of this.queryResults.followCameraComponent.removed) {
      const cameraFollow = getComponent(entity, FollowCameraComponent, true)
      if (cameraFollow) PhysXInstance.instance.removeRaycastQuery(cameraFollow.raycastQuery)
      const activeCameraComponent = getMutableComponent(Engine.activeCameraEntity, CameraComponent)
      if (activeCameraComponent) {
        activeCameraComponent.followTarget = null
        removeComponent(Engine.activeCameraEntity, DesiredTransformComponent) as DesiredTransformComponent
      }
    }

    // follow camera component should only ever be on the character
    for (const entity of this.queryResults.followCameraComponent.all) {
      followCameraBehavior(entity)
    }
  }
}

/**
 * Queries must have components attribute which defines the list of components
 */
CameraSystem.queries = {
  followCameraComponent: {
    components: [FollowCameraComponent, TransformComponent, AvatarComponent],
    listen: {
      added: true,
      removed: true
    }
  }
}
