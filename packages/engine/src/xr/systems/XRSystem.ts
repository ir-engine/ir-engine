import { ArrayCamera } from 'three'

import { addActionReceptor, createActionQueue, dispatchAction } from '@xrengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { BinaryValue } from '../../common/enums/BinaryValue'
import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { matches } from '../../common/functions/MatchesUtils'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, getEngineState } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { InputComponent } from '../../input/components/InputComponent'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { InputType } from '../../input/enums/InputType'
import { gamepadMapping } from '../../input/functions/GamepadInput'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { XRInputSourceComponent } from '../components/XRInputSourceComponent'
import { cleanXRInputs } from '../functions/addControllerModels'
import { updateXRControllerAnimations } from '../functions/controllerAnimation'
import { endXR, startWebXR } from '../functions/WebXRFunctions'

const startXRSession = async () => {
  const sessionInit = { optionalFeatures: ['local-floor', 'hand-tracking', 'layers'] }
  try {
    const session = await (navigator as any).xr.requestSession('immersive-vr', sessionInit)

    EngineRenderer.instance.xrSession = session
    EngineRenderer.instance.xrManager.setSession(session)
    EngineRenderer.instance.xrManager.setFoveation(1)
    dispatchAction(EngineActions.xrSession())

    const onSessionEnd = () => {
      EngineRenderer.instance.xrManager.removeEventListener('sessionend', onSessionEnd)
      dispatchAction(EngineActions.xrEnd())
    }
    EngineRenderer.instance.xrManager.addEventListener('sessionend', onSessionEnd)

    startWebXR()
  } catch (e) {
    console.error('Failed to create XR Session', e)
  }
}

export function setXRModeReceptor(action: typeof WorldNetworkAction.setXRMode.matches._TYPE) {
  // Current WebXRManager.getCamera() typedef is incorrect
  // @ts-ignore
  const cameras = EngineRenderer.instance.xrManager.getCamera() as ArrayCamera
  cameras.layers.enableAll()
  cameras.cameras.forEach((camera) => {
    camera.layers.disableAll()
    camera.layers.enable(ObjectLayers.Scene)
    camera.layers.enable(ObjectLayers.Avatar)
    camera.layers.enable(ObjectLayers.UI)
  })
}

/**
 * System for XR session and input handling
 * @author Josh Field <github.com/hexafield>
 */

export default async function XRSystem(world: World) {
  const localXRControllerQuery = defineQuery([InputComponent, LocalInputTagComponent, XRInputSourceComponent])
  const xrControllerQuery = defineQuery([XRInputSourceComponent])

  ;(navigator as any).xr?.isSessionSupported('immersive-vr').then((supported) => {
    dispatchAction(EngineActions.xrSupported({ xrSupported: supported }))
  })

  // TEMPORARY - precache controller model
  // Cache hand models
  await Promise.all([
    AssetLoader.loadAsync('/default_assets/controllers/hands/left.glb'),
    AssetLoader.loadAsync('/default_assets/controllers/hands/right.glb'),
    AssetLoader.loadAsync('/default_assets/controllers/hands/left_controller.glb'),
    AssetLoader.loadAsync('/default_assets/controllers/hands/right_controller.glb')
  ])

  addActionReceptor((a) => {
    matches(a)
      .when(EngineActions.xrStart.matches, (action) => {
        if (getEngineState().joinedWorld.value && !EngineRenderer.instance.xrSession) startXRSession()
      })
      .when(EngineActions.xrEnd.matches, (action) => {
        for (const entity of xrControllerQuery()) {
          cleanXRInputs(entity)
        }
        endXR()
      })
  })

  const setXRModeQueue = createActionQueue(WorldNetworkAction.setXRMode.matches)

  return () => {
    for (const action of setXRModeQueue()) setXRModeReceptor(action)

    if (EngineRenderer.instance.xrManager?.isPresenting) {
      const session = Engine.instance.xrFrame.session
      for (const source of session.inputSources) {
        copyGamepadState(source)
      }
    }

    //XR Controller mesh animation update
    for (const entity of xrControllerQuery()) {
      const inputSource = getComponent(entity, XRInputSourceComponent)
      updateXRControllerAnimations(inputSource)
    }

    for (const entity of localXRControllerQuery()) {
      const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
      const head = xrInputSourceComponent.head
      head.quaternion.copy(Engine.instance.currentWorld.camera.quaternion)
      head.position.copy(Engine.instance.currentWorld.camera.position)
    }
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
