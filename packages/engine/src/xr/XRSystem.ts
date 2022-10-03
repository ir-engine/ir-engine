import { createActionQueue, getState, removeActionQueue } from '@xrengine/hyperflux'

import { GamepadAxis } from '../input/enums/InputEnums'
import { BinaryValue } from './../common/enums/BinaryValue'
import { LifecycleValue } from './../common/enums/LifecycleValue'
import { Engine } from './../ecs/classes/Engine'
import { World } from './../ecs/classes/World'
import { defineQuery, getComponent, removeQuery } from './../ecs/functions/ComponentFunctions'
import { InputType } from './../input/enums/InputType'
import { GamepadMapping } from './../input/functions/GamepadInput'
import { EngineRenderer } from './../renderer/WebGLRendererSystem'
import { XRInputSourceComponent } from './XRComponents'
import { updateXRControllerAnimations } from './XRControllerFunctions'
import { setupLocalXRInputs } from './XRFunctions'
import { endXRSession, requestXRSession, xrSessionChanged } from './XRSessionFunctions'
import { XRAction, XRState } from './XRState'

/**
 * System for XR session and input handling
 */
export default async function XRSystem(world: World) {
  const xrState = getState(XRState)

  const updateSessionSupportForMode = (mode: XRSessionMode) => {
    navigator.xr?.isSessionSupported(mode).then((supported) => xrState.supportedSessionModes[mode].set(supported))
  }

  const updateSessionSupport = () => {
    updateSessionSupportForMode('inline')
    updateSessionSupportForMode('immersive-ar')
    updateSessionSupportForMode('immersive-vr')
  }

  navigator.xr?.addEventListener('devicechange', updateSessionSupport)
  updateSessionSupport()
  setupLocalXRInputs()

  const xrControllerQuery = defineQuery([XRInputSourceComponent])
  const xrRequestSessionQueue = createActionQueue(XRAction.requestSession.matches)
  const xrEndSessionQueue = createActionQueue(XRAction.endSession.matches)
  const xrSessionChangedQueue = createActionQueue(XRAction.sessionChanged.matches)

  const execute = () => {
    const xrRequestSessionAction = xrRequestSessionQueue().pop()
    const xrEndSessionAction = xrEndSessionQueue().pop()
    if (xrRequestSessionAction) requestXRSession(xrRequestSessionAction)
    if (xrEndSessionAction) endXRSession()

    for (const action of xrSessionChangedQueue()) xrSessionChanged(action)

    const session = EngineRenderer.instance.xrSession
    if (session?.inputSources) for (const source of session.inputSources) updateGamepadInput(source)

    //XR Controller mesh animation update
    for (const entity of xrControllerQuery()) updateXRControllerAnimations(getComponent(entity, XRInputSourceComponent))
  }

  const cleanup = async () => {
    navigator.xr?.removeEventListener('devicechange', updateSessionSupport)
    removeQuery(world, xrControllerQuery)
    removeActionQueue(xrRequestSessionQueue)
    removeActionQueue(xrEndSessionQueue)
    removeActionQueue(xrSessionChangedQueue)
  }

  return {
    execute,
    cleanup,
    subsystems: [
      () => import('./8thwall/XR8'),
      () => import('./XRAnchorSystem'),
      () => import('./XRCameraSystem'),
      // () => import('./XRDepthOcclusion'),
      () => import('./XRScenePlacementShader')
    ]
  }
}

export function updateGamepadInput(source: XRInputSource) {
  if (source.gamepad?.mapping === 'xr-standard') {
    const mapping = GamepadMapping['xr-standard'][source.handedness]

    source.gamepad.buttons.forEach((button, index) => {
      // TODO : support button.touched and button.value
      const prev = Engine.instance.currentWorld.prevInputState.has(mapping[index])
      if (!prev && !button.pressed) return
      Engine.instance.currentWorld.inputState.set(mapping[index], {
        type: InputType.BUTTON,
        value: [button.pressed ? BinaryValue.ON : BinaryValue.OFF],
        lifecycleState: button.pressed ? LifecycleValue.Started : LifecycleValue.Ended
      })
    })

    // TODO: we shouldn't be modifying input data here, deadzone should be handled elsewhere
    const inputData = [...source.gamepad.axes]
    for (let i = 0; i < inputData.length; i++) {
      if (Math.abs(inputData[i]) < 0.05) inputData[i] = 0
    }

    // NOTE: we are inverting input here, as the avatar model is flipped 180 degrees. when that is solved, uninvert these gamepad inputs
    if (inputData.length >= 2) {
      const Touchpad = source.handedness === 'left' ? GamepadAxis.LTouchpad : GamepadAxis.RTouchpad

      Engine.instance.currentWorld.inputState.set(Touchpad, {
        type: InputType.TWODIM,
        value: [inputData[0], inputData[1]],
        lifecycleState: LifecycleValue.Started // TODO
      })
    }

    if (inputData.length >= 4) {
      const Thumbstick = source.handedness === 'left' ? GamepadAxis.LThumbstick : GamepadAxis.RThumbstick
      Engine.instance.currentWorld.inputState.set(Thumbstick, {
        type: InputType.TWODIM,
        value: [inputData[2], inputData[3]],
        lifecycleState: LifecycleValue.Started // TODO
      })
    }
  }
}
