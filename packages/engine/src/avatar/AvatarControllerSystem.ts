import { Matrix4, Quaternion, Vector3 } from 'three'

import { addActionReceptor, dispatchAction, getState } from '@xrengine/hyperflux'

import { FollowCameraComponent, FollowCameraDefaultValues } from '../camera/components/FollowCameraComponent'
import { V_000, V_001, V_010 } from '../common/constants/MathConstants'
import { Engine } from '../ecs/classes/Engine'
import { EngineState } from '../ecs/classes/EngineState'
import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import {
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '../ecs/functions/ComponentFunctions'
import { createEntity } from '../ecs/functions/EntityFunctions'
import { LocalInputTagComponent } from '../input/components/LocalInputTagComponent'
import { BaseInput } from '../input/enums/BaseInput'
import { AvatarMovementScheme } from '../input/enums/InputEnums'
import { XRAxes } from '../input/enums/InputEnums'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { VelocityComponent } from '../physics/components/VelocityComponent'
import { PersistTagComponent } from '../scene/components/PersistTagComponent'
import { setComputedTransformComponent } from '../transform/components/ComputedTransformComponent'
import { setTransformComponent, TransformComponent } from '../transform/components/TransformComponent'
import { XRInputSourceComponent } from '../xr/XRComponents'
import { AvatarInputSchema } from './AvatarInputSchema'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { AvatarHeadDecapComponent } from './components/AvatarHeadDecapComponent'
import {
  alignXRCameraWithAvatar,
  moveLocalAvatar,
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
  jumpHeight = 6
  movementScheme = AvatarMovementScheme.Linear
}

const rotMatrix = new Matrix4()
const targetOrientation = new Quaternion()
const finalOrientation = new Quaternion()

export default async function AvatarControllerSystem(world: World) {
  const localControllerQuery = defineQuery([AvatarControllerComponent, LocalInputTagComponent])
  const controllerQuery = defineQuery([AvatarControllerComponent])

  // const localXRInputQuery = defineQuery([
  //   LocalInputTagComponent,
  //   XRInputSourceComponent,
  //   AvatarControllerComponent,
  //   TransformComponent
  // ])

  addActionReceptor(AvatarInputSettingsReceptor)

  // const lastCamPos = new Vector3(),
  //   displacement = new Vector3()
  // let isLocalXRCameraReady = false

  return () => {
    for (const avatarEntity of localControllerQuery.enter()) {
      const controller = getComponent(avatarEntity, AvatarControllerComponent)

      let targetEntity = avatarEntity
      if (hasComponent(avatarEntity, AvatarComponent)) {
        const avatarComponent = getComponent(avatarEntity, AvatarComponent)
        targetEntity = createEntity()
        setComponent(targetEntity, PersistTagComponent, true)
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
      // todo calculate head size and use that as the bound
      if (followCamera.distance < 0.6) setComponent(entity, AvatarHeadDecapComponent, true)
      else removeComponent(entity, AvatarHeadDecapComponent)
    }

    // for (const entity of localXRInputQuery.enter(world)) {
    //   isLocalXRCameraReady = false
    // }

    // for (const entity of localXRInputQuery(world)) {
    //   const { camera } = Engine.instance.currentWorld

    //   if (displacement.lengthSq() > 0 || xrCameraNeedsAlignment(entity, camera)) {
    //     alignXRCameraWithAvatar(entity, camera, lastCamPos)
    //     continue
    //   }

    //   if (!isLocalXRCameraReady) {
    //     alignXRInputContainerYawWithAvatar(entity)
    //     isLocalXRCameraReady = true
    //   }

    //   moveXRAvatar(world, entity, Engine.instance.currentWorld.camera, lastCamPos)
    //   rotateXRAvatar(world, entity, Engine.instance.currentWorld.camera)
    // }

    const controller = getComponent(Engine.instance.currentWorld.localClientEntity, AvatarControllerComponent)
    if (controller?.movementEnabled) {
      moveLocalAvatar(Engine.instance.currentWorld.localClientEntity)
    }

    return world
  }
}

const alignXRInputContainerYawWithAvatar = (entity: Entity) => {
  const inputSource = getComponent(entity, XRInputSourceComponent)
  const transform = getComponent(entity, TransformComponent)
  const dir = new Vector3(0, 0, -1)
  dir.applyQuaternion(transform.rotation).setY(0).normalize()
  inputSource.container.quaternion.setFromUnitVectors(V_001, dir)
}

const _cameraDirection = new Vector3()
const _mat = new Matrix4()

export const rotateBodyTowardsCameraDirection = (entity: Entity) => {
  const fixedDeltaSeconds = getState(EngineState).fixedDeltaSeconds.value
  const controller = getComponent(entity, AvatarControllerComponent)

  const cameraRotation = getComponent(Engine.instance.currentWorld.cameraEntity, TransformComponent).rotation
  const direction = _cameraDirection.set(0, 0, 1).applyQuaternion(cameraRotation).setComponent(1, 0)
  targetOrientation.setFromRotationMatrix(_mat.lookAt(V_000, direction, V_010))

  finalOrientation.copy(controller.body.rotation() as Quaternion)
  finalOrientation.slerp(
    targetOrientation,
    Math.max(Engine.instance.currentWorld.deltaSeconds * 2, 3 * fixedDeltaSeconds)
  )
  controller.body.setRotation(finalOrientation, true)
}

const _velXZ = new Vector3()
export const rotateBodyTowardsVector = (entity: Entity, vector: Vector3) => {
  const fixedDeltaSeconds = getState(EngineState).fixedDeltaSeconds.value
  const controller = getComponent(entity, AvatarControllerComponent)

  _velXZ.set(vector.x, 0, vector.z)
  if (_velXZ.length() <= 0.001) return

  rotMatrix.lookAt(_velXZ, V_000, V_010)
  targetOrientation.setFromRotationMatrix(rotMatrix)

  finalOrientation.copy(controller.body.rotation() as Quaternion)
  finalOrientation.slerp(
    targetOrientation,
    Math.max(Engine.instance.currentWorld.deltaSeconds * 2, 3 * fixedDeltaSeconds)
  )
  controller.body.setRotation(finalOrientation, true)
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
