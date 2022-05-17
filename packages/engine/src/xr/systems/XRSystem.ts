import { ArrayCamera } from 'three'

import { addActionReceptor, dispatchAction } from '@xrengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { BinaryValue } from '../../common/enums/BinaryValue'
import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { matches } from '../../common/functions/MatchesUtils'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, EngineActionType, getEngineState } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { InputComponent } from '../../input/components/InputComponent'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { InputType } from '../../input/enums/InputType'
import { gamepadMapping } from '../../input/functions/GamepadInput'
import { NetworkWorldAction } from '../../networking/functions/NetworkWorldAction'
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
    dispatchAction(Engine.instance.store, EngineActions.xrSession())

    EngineRenderer.instance.xrManager.addEventListener('sessionend', async () => {
      dispatchAction(Engine.instance.store, EngineActions.xrEnd())
    })

    startWebXR()
  } catch (e) {
    console.error('Failed to create XR Session', e)
  }
}

/**
 * System for XR session and input handling
 * @author Josh Field <github.com/hexafield>
 */

export default async function XRSystem(world: World) {
  const localXRControllerQuery = defineQuery([InputComponent, LocalInputTagComponent, XRInputSourceComponent])
  const xrControllerQuery = defineQuery([XRInputSourceComponent])

  ;(navigator as any).xr?.isSessionSupported('immersive-vr').then((supported) => {
    dispatchAction(Engine.instance.store, EngineActions.xrSupported({ xrSupported: supported }))
  })

  // TEMPORARY - precache controller model
  // Cache hand models
  await Promise.all([
    AssetLoader.loadAsync('/default_assets/controllers/hands/left.glb'),
    AssetLoader.loadAsync('/default_assets/controllers/hands/right.glb'),
    AssetLoader.loadAsync('/default_assets/controllers/hands/left_controller.glb'),
    AssetLoader.loadAsync('/default_assets/controllers/hands/right_controller.glb')
  ])

  addActionReceptor(world.store, (action) => {
    switch (action.type) {
      case NetworkWorldAction.setXRMode.type:
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
  })

  addActionReceptor(Engine.instance.store, (a: EngineActionType) => {
    matches(a)
      .when(EngineActions.xrStart.matches, (action) => {
        if (!EngineRenderer.instance.xrSession) startXRSession()
      })
      .when(EngineActions.xrEnd.matches, (action) => {
        for (const entity of xrControllerQuery()) {
          cleanXRInputs(entity)
        }
        endXR()
      })
  })

  return () => {
    if (EngineRenderer.instance.xrManager?.isPresenting) {
      const session = Engine.instance.xrFrame.session
      for (const source of session.inputSources) {
        if (source.gamepad) {
          const mapping = gamepadMapping[source.gamepad.mapping || 'xr-standard'][source.handedness]
          source.gamepad?.buttons.forEach((button, index) => {
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
          const inputData =
            source.gamepad?.axes.length > 2
              ? [source.gamepad.axes[2], source.gamepad.axes[3]]
              : [source.gamepad.axes[0], source.gamepad.axes[1]]
          if (Math.abs(inputData[0]) < 0.05) {
            inputData[0] = 0
          }
          if (Math.abs(inputData[1]) < 0.05) {
            inputData[1] = 0
          }
          Engine.instance.currentWorld.inputState.set(mapping.axes, {
            type: InputType.TWODIM,
            value: inputData,
            lifecycleState: LifecycleValue.Started
          })
        }
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
