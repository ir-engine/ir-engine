import { PerspectiveCamera } from 'three'

import { createActionQueue, getState, removeActionQueue } from '@xrengine/hyperflux'

import { iOS } from '../common/functions/isMobile'
import { Entity } from '../ecs/classes/Entity'
import { createEntity } from '../ecs/functions/EntityFunctions'
import { SystemDefintion } from '../ecs/functions/SystemFunctions'
import { GamepadAxis } from '../input/enums/InputEnums'
import { NameComponent } from '../scene/components/NameComponent'
import { VisibleComponent } from '../scene/components/VisibleComponent'
import { setTransformComponent, TransformComponent } from '../transform/components/TransformComponent'
import { BinaryValue } from './../common/enums/BinaryValue'
import { LifecycleValue } from './../common/enums/LifecycleValue'
import { Engine } from './../ecs/classes/Engine'
import { World } from './../ecs/classes/World'
import { defineQuery, getComponent, removeQuery, setComponent } from './../ecs/functions/ComponentFunctions'
import { InputType } from './../input/enums/InputType'
import { GamepadMapping } from './../input/functions/GamepadInput'
import { EngineRenderer } from './../renderer/WebGLRendererSystem'
import { XRAction } from './XRAction'
import { XRHitTestComponent, XRInputSourceComponent } from './XRComponents'
import { updateXRControllerAnimations } from './XRControllerFunctions'
import { setupLocalXRInputs } from './XRFunctions'
import { endXRSession, requestXRSession, xrSessionChanged } from './XRSessionFunctions'
import { getControlMode, XRState } from './XRState'

export const updateXRInput = () => {
  const xrManager = EngineRenderer.instance.xrManager
  const camera = Engine.instance.currentWorld.camera as PerspectiveCamera

  xrManager.updateCamera(camera)

  if (getControlMode() === 'attached') {
    const xrInputSourceComponent = getComponent(Engine.instance.currentWorld.localClientEntity, XRInputSourceComponent)
    const head = xrInputSourceComponent.head
    head.quaternion.copy(camera.quaternion)
    head.position.copy(camera.position)

    camera.updateMatrix()
    camera.updateMatrixWorld(true)
    head.updateMatrix()
    head.updateMatrixWorld(true)
  }

  // TODO: uncomment the following when three.js fixes WebXRManager
  // const xrFrame = Engine.instance.xrFrame
  // for (let i = 0; i < xrManager.controllers.length; i++) {
  //   const inputSource = xrManager.controllerInputSources[i]
  //   const controller = xrManager.controllers[i]
  //   if (inputSource !== null && controller !== undefined) {
  //     controller.update(inputSource, xrFrame, xrManager.getReferenceSpace())
  //   }
  // }
}

export const updateHitTest = (entity: Entity) => {
  const xrState = getState(XRState)
  const xrFrame = Engine.instance.xrFrame

  const hitTestComponent = getComponent(entity, XRHitTestComponent)
  const transform = getComponent(entity, TransformComponent)
  const hitTestResults = xrFrame.getHitTestResults(xrState.viewerHitTestSource.value!)

  if (hitTestResults.length) {
    const hit = hitTestResults[0]
    const hitData = hit.getPose(xrState.originReferenceSpace.value!)!
    transform.matrix.fromArray(hitData.transform.matrix)
    transform.matrix.decompose(transform.position, transform.rotation, transform.scale)
    transform.matrixInverse.copy(transform.matrix).invert()
    hitTestComponent.hasHit.set(true)
  } else {
    hitTestComponent.hasHit.set(false)
  }
}

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

  const viewerHitTestEntity = createEntity()
  setComponent(viewerHitTestEntity, NameComponent, { name: 'AR Viewer Hit Test' })
  setTransformComponent(viewerHitTestEntity)
  setComponent(viewerHitTestEntity, VisibleComponent, true)
  setComponent(viewerHitTestEntity, XRHitTestComponent, null)
  xrState.viewerHitTestEntity.set(viewerHitTestEntity)

  const xrControllerQuery = defineQuery([XRInputSourceComponent])
  const xrHitTestQuery = defineQuery([XRHitTestComponent, TransformComponent])
  const xrRequestSessionQueue = createActionQueue(XRAction.requestSession.matches)
  const xrEndSessionQueue = createActionQueue(XRAction.endSession.matches)
  const xrSessionChangedQueue = createActionQueue(XRAction.sessionChanged.matches)

  const execute = () => {
    const xrRequestSessionAction = xrRequestSessionQueue().pop()
    const xrEndSessionAction = xrEndSessionQueue().pop()
    if (xrRequestSessionAction) requestXRSession(xrRequestSessionAction)
    if (xrEndSessionAction) endXRSession()

    for (const action of xrSessionChangedQueue()) xrSessionChanged(action)

    if (EngineRenderer.instance.xrSession) {
      updateXRInput()

      // Assume world.camera.layers is source of truth for all xr cameras
      const camera = Engine.instance.currentWorld.camera as PerspectiveCamera
      const xrCamera = EngineRenderer.instance.xrManager.getCamera()
      xrCamera.layers.mask = camera.layers.mask
      for (const c of xrCamera.cameras) c.layers.mask = camera.layers.mask

      const session = EngineRenderer.instance.xrManager!.getSession()
      if (session?.inputSources) for (const source of session.inputSources) updateGamepadInput(source)

      if (!!Engine.instance.xrFrame?.getHitTestResults && xrState.viewerHitTestSource.value) {
        for (const entity of xrHitTestQuery()) updateHitTest(entity)
      }
    }

    //XR Controller mesh animation update
    for (const entity of xrControllerQuery()) updateXRControllerAnimations(getComponent(entity, XRInputSourceComponent))
  }

  const cleanup = async () => {
    navigator.xr?.removeEventListener('devicechange', updateSessionSupport)
    removeQuery(world, xrControllerQuery)
    removeQuery(world, xrHitTestQuery)
    removeActionQueue(xrRequestSessionQueue)
    removeActionQueue(xrEndSessionQueue)
    removeActionQueue(xrSessionChangedQueue)
  }

  // testing - replace iOS with AR support check
  let iOS = true
  const _8thwall = iOS ? [() => import('./8thwall/XR8')] : ([] as SystemDefintion[])

  return {
    execute,
    cleanup,
    subsystems: [() => import('./XRDepthOcclusion'), ..._8thwall]
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
