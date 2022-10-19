import { Matrix4, Quaternion, Vector3 } from 'three'

import { addActionReceptor, dispatchAction, getState } from '@xrengine/hyperflux'

import { FollowCameraComponent, FollowCameraDefaultValues } from '../camera/components/FollowCameraComponent'
import { V_000, V_010 } from '../common/constants/MathConstants'
import { Engine } from '../ecs/classes/Engine'
import { EngineState } from '../ecs/classes/EngineState'
import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import {
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent,
  removeQuery,
  setComponent
} from '../ecs/functions/ComponentFunctions'
import { createEntity } from '../ecs/functions/EntityFunctions'
import { LocalInputTagComponent } from '../input/components/LocalInputTagComponent'
import { BaseInput } from '../input/enums/BaseInput'
import { AvatarMovementScheme, GamepadAxis } from '../input/enums/InputEnums'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { RigidBodyComponent } from '../physics/components/RigidBodyComponent'
import { setComputedTransformComponent } from '../transform/components/ComputedTransformComponent'
import { setTransformComponent, TransformComponent } from '../transform/components/TransformComponent'
import { AvatarInputSchema } from './AvatarInputSchema'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { AvatarHeadDecapComponent } from './components/AvatarIKComponents'
import { moveAvatarWithVelocity, updateAvatarControllerOnGround } from './functions/moveAvatar'
import { respawnAvatar } from './functions/respawnAvatar'
import { AvatarInputSettingsReceptor, AvatarInputSettingsState } from './state/AvatarInputSettingsState'

/**
 * TODO: convert this to hyperflux state
 */
export class AvatarSettings {
  static instance: AvatarSettings = new AvatarSettings()
  // Speeds are same as animation's root motion
  walkSpeed = 1.6762927669761485
  runSpeed = 3.769894125544925 * 1.5
  jumpHeight = 6
}

const rotMatrix = new Matrix4()
const targetOrientation = new Quaternion()
const finalOrientation = new Quaternion()

export default async function AvatarControllerSystem(world: World) {
  const localControllerQuery = defineQuery([AvatarControllerComponent, LocalInputTagComponent])
  const controllerQuery = defineQuery([AvatarControllerComponent])

  addActionReceptor(AvatarInputSettingsReceptor)

  const execute = () => {
    for (const avatarEntity of localControllerQuery.enter()) {
      const controller = getComponent(avatarEntity, AvatarControllerComponent)

      let targetEntity = avatarEntity
      if (hasComponent(avatarEntity, AvatarComponent)) {
        const avatarComponent = getComponent(avatarEntity, AvatarComponent)
        targetEntity = createEntity()
        setTransformComponent(targetEntity)
        setComputedTransformComponent(targetEntity, avatarEntity, () => {
          const avatarTransform = getComponent(avatarEntity, TransformComponent)
          const targetTransform = getComponent(targetEntity, TransformComponent)
          targetTransform.position.copy(avatarTransform.position).y += avatarComponent.avatarHeight * 0.95
        })
      }

      setComponent(controller.cameraEntity, FollowCameraComponent, {
        ...FollowCameraDefaultValues,
        targetEntity
      })

      dispatchAction(WorldNetworkAction.spawnCamera({}))
    }

    for (const entity of controllerQuery()) {
      const controller = getComponent(entity, AvatarControllerComponent)
      const followCamera = getComponent(controller.cameraEntity, FollowCameraComponent)
      if (followCamera) {
        // todo calculate head size and use that as the bound
        if (followCamera.distance < 0.6) setComponent(entity, AvatarHeadDecapComponent, true)
        else removeComponent(entity, AvatarHeadDecapComponent)
      }
    }

    const controlledEntity = Engine.instance.currentWorld.localClientEntity

    const controller = getComponent(controlledEntity, AvatarControllerComponent)
    if (hasComponent(controlledEntity, AvatarControllerComponent)) {
      updateAvatarControllerOnGround(controlledEntity)
      if (controller?.movementEnabled) {
        moveAvatarWithVelocity(controlledEntity)
      }

      const rigidbody = getComponent(controlledEntity, RigidBodyComponent)
      if (rigidbody.body.translation().y < -10) respawnAvatar(controlledEntity)
    }
  }

  const cleanup = async () => {
    removeQuery(world, localControllerQuery)
    removeQuery(world, controllerQuery)
  }

  return { execute, cleanup }
}

const _cameraDirection = new Vector3()
const _mat = new Matrix4()

export const rotateBodyTowardsCameraDirection = (entity: Entity) => {
  const fixedDeltaSeconds = getState(EngineState).fixedDeltaSeconds.value
  const rigidbody = getComponent(entity, RigidBodyComponent)
  if (!rigidbody) return

  const cameraRotation = getComponent(Engine.instance.currentWorld.cameraEntity, TransformComponent).rotation
  const direction = _cameraDirection.set(0, 0, 1).applyQuaternion(cameraRotation).setComponent(1, 0)
  targetOrientation.setFromRotationMatrix(_mat.lookAt(V_000, direction, V_010))

  finalOrientation.copy(rigidbody.body.rotation() as Quaternion)
  finalOrientation.slerp(
    targetOrientation,
    Math.max(Engine.instance.currentWorld.deltaSeconds * 2, 3 * fixedDeltaSeconds)
  )
  rigidbody.body.setRotation(finalOrientation, true)
}

const _velXZ = new Vector3()
const prevVectors = new Map<Entity, Vector3>()
export const rotateBodyTowardsVector = (entity: Entity, vector: Vector3) => {
  const rigidbody = getComponent(entity, RigidBodyComponent)
  if (!rigidbody) return

  let prevVector = prevVectors.get(entity)!
  if (!prevVector) {
    prevVector = new Vector3(0, 0, 1)
    prevVectors.set(entity, prevVector)
  }

  _velXZ.set(vector.x, 0, vector.z)
  const isZero = _velXZ.distanceTo(V_000) < 0.1
  if (isZero) _velXZ.copy(prevVector)
  if (!isZero) prevVector.copy(_velXZ)

  const fixedDeltaSeconds = getState(EngineState).fixedDeltaSeconds.value

  rotMatrix.lookAt(_velXZ, V_000, V_010)
  targetOrientation.setFromRotationMatrix(rotMatrix)

  const prevRot = getComponent(entity, TransformComponent).rotation
  finalOrientation.copy(prevRot)
  finalOrientation.slerp(
    targetOrientation,
    Math.max(Engine.instance.currentWorld.deltaSeconds * 2, 3 * fixedDeltaSeconds)
  )
  rigidbody.body.setRotation(finalOrientation, true)
}

export const updateMap = () => {
  const avatarInputState = getState(AvatarInputSettingsState)
  const inputMap = AvatarInputSchema.inputMap
  if (avatarInputState.invertRotationAndMoveSticks.value) {
    inputMap.set(GamepadAxis.LThumbstick, BaseInput.PRIMARY_MOVE_RIGHT)
    inputMap.set(GamepadAxis.RThumbstick, BaseInput.PRIMARY_MOVE_LEFT)
  } else {
    inputMap.set(GamepadAxis.LThumbstick, BaseInput.PRIMARY_MOVE_LEFT)
    inputMap.set(GamepadAxis.RThumbstick, BaseInput.PRIMARY_MOVE_RIGHT)
  }
}
