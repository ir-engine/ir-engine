import { Quaternion } from 'three'

import { isDev } from '@etherealengine/common/src/config'
import { dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { V_000, V_010 } from '../common/constants/MathConstants'
import { Engine } from '../ecs/classes/Engine'
import { EngineActions } from '../ecs/classes/EngineState'
import {
  ComponentType,
  getComponent,
  getMutableComponent,
  removeComponent,
  setComponent
} from '../ecs/functions/ComponentFunctions'
import { InteractState } from '../interaction/systems/InteractiveSystem'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { boxDynamicConfig } from '../physics/functions/physicsObjectDebugFunctions'
import { RendererState } from '../renderer/RendererState'
import { hasMovementControls } from '../xr/XRState'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { AvatarTeleportComponent } from './components/AvatarTeleportComponent'
import { autopilotSetPosition } from './functions/autopilotFunctions'
import { translateAndRotateAvatar } from './functions/moveAvatar'
import { AvatarAxesControlScheme, AvatarInputSettingsState } from './state/AvatarInputSettingsState'

const _quat = new Quaternion()

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
  [AvatarAxesControlScheme.Move]: (
    inputSource: XRInputSource,
    controller: ComponentType<typeof AvatarControllerComponent>
  ) => {
    if (inputSource.gamepad?.mapping !== 'xr-standard') return
    const [x, z] = getThumbstickOrThumbpadAxes(inputSource, 0.05)
    controller.gamepadLocalInput.x += x
    controller.gamepadLocalInput.z += z
  },

  [AvatarAxesControlScheme.Teleport]: (inputSource: XRInputSource) => {
    if (inputSource.gamepad?.mapping !== 'xr-standard') return

    const localClientEntity = Engine.instance.localClientEntity
    const [x, z] = getThumbstickOrThumbpadAxes(inputSource, 0.05)

    if (x === 0 && z === 0) {
      InputSourceAxesDidReset.set(inputSource, true)
      if (inputSource.handedness === getComponent(localClientEntity, AvatarTeleportComponent)?.side)
        removeComponent(localClientEntity, AvatarTeleportComponent)
    }

    if (!InputSourceAxesDidReset.get(inputSource)) return

    const canTeleport = z < -0.75
    const canRotate = Math.abs(x) > 0.1 && Math.abs(z) < 0.1

    if (canRotate) {
      const angle = (Math.PI / 6) * (x > 0 ? -1 : 1) // 30 degrees
      translateAndRotateAvatar(localClientEntity, V_000, _quat.setFromAxisAngle(V_010, angle))
      InputSourceAxesDidReset.set(inputSource, false)
    } else if (canTeleport) {
      setComponent(localClientEntity, AvatarTeleportComponent, { side: inputSource.handedness })
      InputSourceAxesDidReset.set(inputSource, false)
    }
  }
}

export default async function AvatarInputSystem() {
  const interactState = getMutableState(InteractState)
  const avatarInputSettings = getMutableState(AvatarInputSettingsState).value

  const onShiftLeft = () => {
    const controller = getMutableComponent(Engine.instance.localClientEntity, AvatarControllerComponent)
    controller.isWalking.set(!controller.isWalking.value)
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
    getMutableState(RendererState).debugEnable.set(!getMutableState(RendererState).debugEnable.value)
  }

  let mouseMovedDuringPrimaryClick = false
  const execute = () => {
    const { inputSources, localClientEntity } = Engine.instance
    if (!localClientEntity) return

    const controller = getComponent(localClientEntity, AvatarControllerComponent)
    const buttons = Engine.instance.buttons

    if (buttons.PrimaryClick?.touched) {
      let mouseMoved = Engine.instance.pointerState.movement.lengthSq() > 0
      if (mouseMoved) mouseMovedDuringPrimaryClick = true

      if (buttons.PrimaryClick.up) {
        if (!mouseMovedDuringPrimaryClick) autopilotSetPosition(Engine.instance.localClientEntity)
        else mouseMovedDuringPrimaryClick = false
      }
    }

    if (buttons.ShiftLeft?.down) onShiftLeft()
    if (buttons.KeyE?.down) onKeyE()
    if (buttons.LeftTrigger?.down) onLeftTrigger()
    if (buttons.RightTrigger?.down) onRightTrigger()

    if (isDev) {
      if (buttons.KeyO?.down) onKeyO()
      if (buttons.KeyP?.down) onKeyP()
    }

    if (!hasMovementControls()) return

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
        inputSource.handedness === 'none'
          ? AvatarAxesControlScheme.Move
          : inputSource.handedness === avatarInputSettings.preferredHand
          ? avatarInputSettings.rightAxesControlScheme
          : avatarInputSettings.leftAxesControlScheme
      AvatarAxesControlSchemeBehavior[controlScheme](inputSource, controller)
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
