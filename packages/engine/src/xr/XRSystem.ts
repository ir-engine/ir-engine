import { createHookableFunction } from '@xrengine/common/src/utils/createMutableFunction'
import { createActionQueue, dispatchAction, getState } from '@xrengine/hyperflux'

import { SkyboxComponent } from '../scene/components/SkyboxComponent'
import { updateSkybox } from '../scene/functions/loaders/SkyboxFunctions'
import { AssetLoader } from './../assets/classes/AssetLoader'
import { BinaryValue } from './../common/enums/BinaryValue'
import { LifecycleValue } from './../common/enums/LifecycleValue'
import { matches } from './../common/functions/MatchesUtils'
import { Engine } from './../ecs/classes/Engine'
import { World } from './../ecs/classes/World'
import { defineQuery, getComponent } from './../ecs/functions/ComponentFunctions'
import { hasComponent, removeComponent } from './../ecs/functions/ComponentFunctions'
import { InputType } from './../input/enums/InputType'
import { gamepadMapping } from './../input/functions/GamepadInput'
import { EngineRenderer } from './../renderer/WebGLRendererSystem'
import { XRAction } from './XRAction'
import { XRHandsInputComponent, XRInputSourceComponent } from './XRComponents'
import { cleanXRInputs, updateXRControllerAnimations } from './XRControllerFunctions'
import { proxifyXRInputs, setupLocalXRInputs, setupXRInputSourceComponent } from './XRFunctions'
import { XRState } from './XRState'

const skyboxQuery = defineQuery([SkyboxComponent])

export const requestXRSession = createHookableFunction(
  async (action: typeof XRAction.requestSession.matches._TYPE): Promise<void> => {
    try {
      const xrState = getState(XRState)
      const sessionInit = {
        optionalFeatures: ['local-floor', 'hand-tracking', 'layers', 'dom-overlay'],
        domOverlay: { root: document.body }
      }
      const mode =
        action.mode ||
        (xrState.supportedSessionModes['immersive-ar'].value
          ? 'immersive-ar'
          : xrState.supportedSessionModes['immersive-vr'].value
          ? 'immersive-vr'
          : 'inline')

      const session = await navigator.xr!.requestSession(mode, sessionInit)
      xrState.sessionActive.set(true)
      if (mode === 'immersive-ar') EngineRenderer.instance.canvas.style.display = 'none'
      EngineRenderer.instance.xrSession = session
      EngineRenderer.instance.xrManager.setSession(session)
      EngineRenderer.instance.xrManager.setFoveation(1)

      const world = Engine.instance.currentWorld
      setupXRInputSourceComponent(world.localClientEntity)
      proxifyXRInputs(world.localClientEntity)

      if (mode === 'immersive-ar') world.scene.background = null

      const onSessionEnd = () => {
        xrState.sessionActive.set(false)
        EngineRenderer.instance.canvas.style.display = ''
        EngineRenderer.instance.xrManager.removeEventListener('sessionend', onSessionEnd)
        EngineRenderer.instance.xrSession = null!
        EngineRenderer.instance.xrManager.setSession(null!)
        const world = Engine.instance.currentWorld
        cleanXRInputs(world.localClientEntity)
        removeComponent(world.localClientEntity, XRInputSourceComponent)
        removeComponent(world.localClientEntity, XRHandsInputComponent)
        const skybox = skyboxQuery()[0]
        if (skybox) updateSkybox(skybox)
        dispatchAction(XRAction.sessionChanged({ active: false }))
      }
      EngineRenderer.instance.xrManager.addEventListener('sessionend', onSessionEnd)

      dispatchAction(XRAction.sessionChanged({ active: true }))
    } catch (e) {
      console.error('Failed to create XR Session', e)
    }
  }
)

export const endXRSession = createHookableFunction(async () => {
  await EngineRenderer.instance.xrSession?.end()
})

export const xrSessionChanged = createHookableFunction((action: typeof XRAction.sessionChanged.matches._TYPE) => {
  const entity = Engine.instance.currentWorld.getUserAvatarEntity(action.$from)
  if (!entity) return

  if (action.active) {
    if (!hasComponent(entity, XRInputSourceComponent)) {
      setupXRInputSourceComponent(entity)
    }
  } else if (hasComponent(entity, XRInputSourceComponent)) {
    cleanXRInputs(entity)
    removeComponent(entity, XRInputSourceComponent)
  }
})

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

  // TODO: we need a way to remove listeners when systems are unloaded
  navigator.xr?.addEventListener('devicechange', updateSessionSupport)
  updateSessionSupport()
  setupLocalXRInputs()

  // TEMPORARY - precache controller model
  // Cache hand models
  AssetLoader.loadAsync('/default_assets/controllers/hands/left.glb')
  AssetLoader.loadAsync('/default_assets/controllers/hands/right.glb')
  AssetLoader.loadAsync('/default_assets/controllers/hands/left_controller.glb')
  AssetLoader.loadAsync('/default_assets/controllers/hands/right_controller.glb')

  // const joinedWorldActionQueue = createActionQueue(EngineActions.joinedWorld.matches)

  const xrControllerQuery = defineQuery([XRInputSourceComponent])
  const xrRequestSessionQueue = createActionQueue(XRAction.requestSession.matches)
  const xrEndSessionQueue = createActionQueue(XRAction.endSession.matches)
  const xrSessionChangedQueue = createActionQueue(XRAction.sessionChanged.matches)

  return () => {
    // const joinedWorldAction = joinedWorldActionQueue().pop()
    // if (joinedWorldAction) {
    //   if (!hasComponent(world.localOriginEntity, PositionOffsetComponent)) {
    //     addPositionOffsetComponent(world.localOriginEntity, world.localClientEntity)
    //   }
    // }

    const xrRequestSessionAction = xrRequestSessionQueue().pop()
    const xrEndSessionAction = xrEndSessionQueue().pop()
    if (xrRequestSessionAction) requestXRSession(xrRequestSessionAction)
    if (xrEndSessionAction) endXRSession()

    for (const action of xrSessionChangedQueue()) xrSessionChanged(action)

    if (EngineRenderer.instance.xrManager?.isPresenting) {
      const session = EngineRenderer.instance.xrManager!.getSession()!
      for (const source of session.inputSources) copyGamepadState(source)

      // const xrInputSourceComponent = getComponent(world.localClientEntity, XRInputSourceComponent)
      // const head = xrInputSourceComponent.head
      // head.quaternion.copy(Engine.instance.currentWorld.camera.quaternion)
      // head.position.copy(Engine.instance.currentWorld.camera.position)
    }

    //XR Controller mesh animation update
    for (const entity of xrControllerQuery()) updateXRControllerAnimations(getComponent(entity, XRInputSourceComponent))
  }
}

function copyGamepadState({ gamepad, handedness }: XRInputSource) {
  if (!gamepad) return

  const mapping = gamepadMapping[gamepad.mapping || 'xr-standard'][handedness]

  gamepad.buttons.forEach((button, index) => {
    // TODO : support button.touched and button.value
    const prev = Engine.instance.currentWorld.prevInputState.get(mapping.buttons[index])
    if (!prev && button.pressed == false) return
    const continued = prev?.value && button.pressed
    Engine.instance.currentWorld.inputState.set(mapping.buttons[index], {
      type: InputType.BUTTON,
      value: [button.pressed ? BinaryValue.ON : BinaryValue.OFF],
      lifecycleState: button.pressed
        ? continued
          ? LifecycleValue.Continued
          : LifecycleValue.Started
        : LifecycleValue.Ended
    })
  })

  const inputData = [...gamepad.axes]
  for (let i = 0; i < inputData.length; i++) {
    if (Math.abs(inputData[i]) < 0.05) inputData[i] = 0
  }

  Engine.instance.currentWorld.inputState.set(mapping.axes, {
    type: InputType.TWODIM,
    value: inputData,
    lifecycleState: LifecycleValue.Started
  })
}
