import { Euler, Quaternion, Vector3 } from 'three'

import { isDev } from '@xrengine/common/src/config'
import { dispatchAction, getState } from '@xrengine/hyperflux'

import { V_010 } from '../common/constants/MathConstants'
import { Engine } from '../ecs/classes/Engine'
import { EngineActions } from '../ecs/classes/EngineState'
import { World } from '../ecs/classes/World'
import { getComponent, getComponentState, removeComponent, setComponent } from '../ecs/functions/ComponentFunctions'
import { InteractState } from '../interaction/systems/InteractiveSystem'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { RigidBodyComponent } from '../physics/components/RigidBodyComponent'
import { boxDynamicConfig } from '../physics/functions/physicsObjectDebugFunctions'
import { accessEngineRendererState, EngineRendererAction } from '../renderer/EngineRendererState'
import { EngineRenderer } from '../renderer/WebGLRendererSystem'
import { LocalTransformComponent, TransformComponent } from '../transform/components/TransformComponent'
import { getControlMode, XRState } from '../xr/XRState'
import { AvatarControllerComponent, AvatarControllerComponentType } from './components/AvatarControllerComponent'
import { AvatarTeleportComponent } from './components/AvatarTeleportComponent'
import { rotateAvatar } from './functions/moveAvatar'
import { AvatarAxesControlScheme, AvatarInputSettingsState } from './state/AvatarInputSettingsState'

/**
 * On 'xr-standard' mapping, get thumbstick input [2,3], fallback to thumbpad input [0,1]
 */
export function getThumbstickOrThumbpadAxes(inputSource: XRInputSource, deadZone: number = 0.05) {
  const axes = inputSource.gamepad!.axes
  const axesIndex = axes.length >= 4 ? 2 : 0
  const xAxis = Math.abs(axes[axesIndex]) > deadZone ? axes[axesIndex] : 0
  const zAxis = Math.abs(axes[axesIndex + 1]) > deadZone ? axes[axesIndex + 1] : 0
  return [xAxis, zAxis] as [number, number]
}

export const InputSourceAxesDidReset = new WeakMap<XRInputSource, boolean>()

export const AvatarAxesControlSchemeBehavior = {
  [AvatarAxesControlScheme.Move]: (inputSource: XRInputSource, controller: AvatarControllerComponentType) => {
    if (inputSource.gamepad?.mapping !== 'xr-standard') return
    const [x, z] = getThumbstickOrThumbpadAxes(inputSource, 0.05)
    controller.gamepadLocalInput.x += x
    controller.gamepadLocalInput.z += z
  },

  [AvatarAxesControlScheme.RotateAndTeleport]: (
    inputSource: XRInputSource,
    controller: AvatarControllerComponentType
  ) => {
    if (inputSource.gamepad?.mapping !== 'xr-standard') return

    const localClientEntity = Engine.instance.currentWorld.localClientEntity
    const [x, z] = getThumbstickOrThumbpadAxes(inputSource, 0.05)

    if (x === 0 && z === 0) {
      InputSourceAxesDidReset.set(inputSource, true)
      removeComponent(localClientEntity, AvatarTeleportComponent)
    }

    if (!InputSourceAxesDidReset.get(inputSource)) return

    const canTeleport = z < -0.75
    const canRotate = Math.abs(x) > 0.1 && Math.abs(z) < 0.1

    if (canRotate) {
      rotateAvatar(localClientEntity, (Math.PI / 6) * (x > 0 ? -1 : 1)) // 30 degrees
      InputSourceAxesDidReset.set(inputSource, false)
    } else if (canTeleport) {
      setComponent(localClientEntity, AvatarTeleportComponent, { side: inputSource.handedness })
      InputSourceAxesDidReset.set(inputSource, false)
    }
  }
}

export default async function AvatarInputSystem(world: World) {
  const interactState = getState(InteractState)
  const xrState = getState(XRState)
  const avatarInputSettings = getState(AvatarInputSettingsState).value
  const _euler = new Euler()
  const cameraRotationDifference = new Quaternion()

  const onShiftLeft = () => {
    const controller = getComponentState(world.localClientEntity, AvatarControllerComponent)
    controller.isWalking.set(!controller.isWalking)
  }

  const onKeyE = () => {
    dispatchAction(
      EngineActions.interactedWithObject({
        targetEntity: interactState.available[0].value,
        handedness: 'none'
      })
    )
  }

  const onLeftTrigger = () => {
    dispatchAction(
      EngineActions.interactedWithObject({
        targetEntity: interactState.available[0].value,
        handedness: 'left'
      })
    )
  }

  const onRightTrigger = () => {
    dispatchAction(
      EngineActions.interactedWithObject({
        targetEntity: interactState.available[0].value,
        handedness: 'right'
      })
    )
  }

  const onKeyO = () => {
    dispatchAction(
      WorldNetworkAction.spawnDebugPhysicsObject({
        config: boxDynamicConfig
      })
    )
  }

  const onKeyP = () => {
    dispatchAction(
      EngineRendererAction.setDebug({
        debugEnable: !accessEngineRendererState().debugEnable.value
      })
    )
  }

  const previousViewerPosition = new Vector3()
  const previousViewerRotation = new Quaternion()

  const execute = () => {
    const { inputSources, localClientEntity } = world
    if (!localClientEntity) return

    const xrCameraAttached = getControlMode() === 'attached'
    const controller = getComponent(localClientEntity, AvatarControllerComponent)
    const buttons = world.buttons

    if (buttons.ShiftLeft?.down) onShiftLeft()
    if (buttons.KeyE?.down) onKeyE()
    if (buttons.LeftTrigger?.down) onLeftTrigger()
    if (buttons.RightTrigger?.down) onRightTrigger()

    if (isDev) {
      if (buttons.KeyO?.down) onKeyO()
      if (buttons.KeyP?.down) onKeyP()
    }

    /** keyboard input */
    const keyDeltaX = (buttons.KeyA?.pressed ? -1 : 0) + (buttons.KeyD?.pressed ? 1 : 0)
    const keyDeltaZ =
      (buttons.KeyW?.pressed ? -1 : 0) +
      (buttons.KeyS?.pressed ? 1 : 0) +
      (buttons.ArrowUp?.pressed ? -1 : 0) +
      (buttons.ArrowDown?.pressed ? 1 : 0)

    controller.gamepadLocalInput.set(keyDeltaX, 0, keyDeltaZ)

    controller.gamepadJumpActive = !!buttons.Space?.pressed

    for (const inputSource of inputSources) {
      const controlScheme =
        inputSource.handedness === 'left'
          ? avatarInputSettings.leftAxesControlScheme
          : avatarInputSettings.rightAxesControlScheme
      AvatarAxesControlSchemeBehavior[controlScheme](inputSource, controller)
    }

    /** When in attached camera mode, avatar movement should correspond to physical device movement */
    if (xrCameraAttached) {
      const originTransform = getComponent(world.originEntity, TransformComponent)
      xrState.viewerPoseDeltaMetric.delta.value
        .getTranslation(controller.desiredMovement)
        .applyQuaternion(originTransform.rotation)
      xrState.viewerPoseDeltaMetric.delta.value.getRotation(cameraRotationDifference)
      const cameraYSpin = _euler.setFromQuaternion(cameraRotationDifference).y
      rotateAvatar(localClientEntity, cameraYSpin)
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
