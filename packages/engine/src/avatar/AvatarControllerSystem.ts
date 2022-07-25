import { ArrowHelper, Matrix4, Quaternion, Vector3 } from 'three'

import { addActionReceptor } from '@xrengine/hyperflux'

import { V_000, V_001, V_010 } from '../common/constants/MathConstants'
import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import { defineQuery, getComponent, hasComponent } from '../ecs/functions/ComponentFunctions'
import { LocalInputTagComponent } from '../input/components/LocalInputTagComponent'
import { BaseInput } from '../input/enums/BaseInput'
import { AvatarMovementScheme } from '../input/enums/InputEnums'
import { XRAxes } from '../input/enums/InputEnums'
import { ColliderComponent } from '../physics/components/ColliderComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { XRInputSourceComponent } from '../xr/XRComponents'
import { AvatarInputSchema } from './AvatarInputSchema'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { AvatarHeadDecapComponent } from './components/AvatarHeadDecapComponent'
import { detectUserInCollisions } from './functions/detectUserInCollisions'
import {
  alignXRCameraWithAvatar,
  moveAvatar,
  moveXRAvatar,
  rotateXRAvatar,
  xrCameraNeedsAlignment
} from './functions/moveAvatar'
import { respawnAvatar } from './functions/respawnAvatar'
import { accessAvatarInputSettingsState, AvatarInputSettingsReceptor } from './state/AvatarInputSettingsState'

/**
 * TODO: convert this to hyperflux state
 */
export class AvatarSettings {
  static instance: AvatarSettings = new AvatarSettings()
  // Speeds are same as animation's root motion
  walkSpeed = 1.6762927669761485
  runSpeed = 3.769894125544925 * 1.5
  jumpHeight = 4
  movementScheme = AvatarMovementScheme.Linear
}

const displacementXZ = new Vector3(),
  invOrientation = new Quaternion(),
  rotMatrix = new Matrix4(),
  targetOrientation = new Quaternion()

export default async function AvatarControllerSystem(world: World) {
  const controllerQuery = defineQuery([AvatarControllerComponent])
  const localXRInputQuery = defineQuery([
    LocalInputTagComponent,
    XRInputSourceComponent,
    AvatarControllerComponent,
    TransformComponent
  ])

  addActionReceptor(AvatarInputSettingsReceptor)

  const lastCamPos = new Vector3(),
    displacement = new Vector3()
  let isLocalXRCameraReady = false

  return () => {
    for (const entity of controllerQuery.exit(world)) {
      avatarControllerExit(entity, world)
    }

    for (const entity of localXRInputQuery.enter(world)) {
      isLocalXRCameraReady = false
    }

    for (const entity of localXRInputQuery(world)) {
      const { camera } = Engine.instance.currentWorld

      if (displacement.lengthSq() > 0 || xrCameraNeedsAlignment(entity, camera)) {
        alignXRCameraWithAvatar(entity, camera, lastCamPos)
        continue
      }

      if (!isLocalXRCameraReady) {
        alignXRCameraYawWithAvatar(entity)
        isLocalXRCameraReady = true
      }

      moveXRAvatar(world, entity, Engine.instance.currentWorld.camera, lastCamPos)
      rotateXRAvatar(world, entity, Engine.instance.currentWorld.camera)
    }

    for (const entity of controllerQuery(world)) {
      controllerQueryUpdate(entity, displacement, world)
    }

    return world
  }
}

const alignXRCameraYawWithAvatar = (entity: Entity) => {
  const inputSource = getComponent(entity, XRInputSourceComponent)
  const transform = getComponent(entity, TransformComponent)
  const dir = new Vector3(0, 0, -1)
  dir.applyQuaternion(transform.rotation).setY(0).normalize()
  inputSource.container.quaternion.setFromUnitVectors(V_001, dir)
}

export const updateColliderPose = (entity: Entity) => {
  const collider = getComponent(entity, ColliderComponent)
  const controller = getComponent(entity, AvatarControllerComponent)
  const transform = getComponent(entity, TransformComponent)
  const pose = controller.controller.getPosition()

  collider.body.setGlobalPose(
    {
      translation: pose,
      rotation: transform.rotation
    },
    true
  )
}

export const updateAvatarTransformPosition = (entity: Entity) => {
  const transform = getComponent(entity, TransformComponent)
  const controller = getComponent(entity, AvatarControllerComponent)
  const avatar = getComponent(entity, AvatarComponent)
  const pose = controller.controller.getPosition()
  transform.position.set(pose.x, pose.y - avatar.avatarHalfHeight, pose.z)
}

const _cameraDirection = new Vector3()
const _mat = new Matrix4()
const _desiredRotation = new Quaternion()
export const rotateTowardsCameraDirection = (entity: Entity) => {
  const world = Engine.instance.currentWorld
  const avatarTransform = getComponent(entity, TransformComponent)
  const cameraRotation = getComponent(Engine.instance.currentWorld.cameraEntity, TransformComponent).rotation
  const direction = _cameraDirection.set(0, 0, 1).applyQuaternion(cameraRotation)
  direction.y = 0
  _desiredRotation.setFromRotationMatrix(_mat.lookAt(V_000, direction, V_010))
  avatarTransform.rotation.slerp(_desiredRotation, Math.max(world.deltaSeconds * 2, 3 / 60))
}

export const rotateTowardsDisplacementVector = (entity: Entity, displacement: Vector3, world: World) => {
  const transform = getComponent(entity, TransformComponent)

  displacementXZ.set(displacement.x, 0, displacement.z)
  displacementXZ.applyQuaternion(invOrientation.copy(transform.rotation).invert())

  if (displacementXZ.lengthSq() <= 0) return

  rotMatrix.lookAt(displacementXZ, V_000, V_010)
  targetOrientation.setFromRotationMatrix(rotMatrix)
  transform.rotation.slerp(targetOrientation, Math.max(world.deltaSeconds * 2, 3 / 60))
}

export const controllerQueryUpdate = (
  entity: Entity,
  displacement: Vector3,
  world: World = Engine.instance.currentWorld
) => {
  if (hasComponent(entity, AvatarHeadDecapComponent)) rotateTowardsCameraDirection(entity)
  else rotateTowardsDisplacementVector(entity, displacement, world)

  const displace = moveAvatar(world, entity, Engine.instance.currentWorld.camera)
  displacement.set(displace.x, displace.y, displace.z)

  updateAvatarTransformPosition(entity)
  detectUserInCollisions(entity)
  updateColliderPose(entity)

  const transform = getComponent(entity, TransformComponent)
  // TODO: implement scene lower bounds parameter
  if (transform.position.y < -10) respawnAvatar(entity)
}

export const avatarControllerExit = (entity: Entity, world: World = Engine.instance.currentWorld) => {
  const controller = getComponent(entity, AvatarControllerComponent, true)
  if (controller?.controller) world.physics.removeController(controller.controller)
  const avatar = getComponent(entity, AvatarComponent)
  if (avatar) avatar.isGrounded = false
}

export const updateMap = () => {
  const avatarInputState = accessAvatarInputSettingsState()
  const inputMap = AvatarInputSchema.inputMap
  if (avatarInputState.invertRotationAndMoveSticks.value) {
    inputMap.set(XRAxes.Left, BaseInput.XR_AXIS_LOOK)
    inputMap.set(XRAxes.Right, BaseInput.XR_AXIS_MOVE)
  } else {
    inputMap.set(XRAxes.Left, BaseInput.XR_AXIS_MOVE)
    inputMap.set(XRAxes.Right, BaseInput.XR_AXIS_LOOK)
  }
}
