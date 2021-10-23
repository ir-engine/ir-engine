import { sRGBEncoding } from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { XRInputSourceComponent } from '../../avatar/components/XRInputSourceComponent'
import { BinaryValue } from '../../common/enums/BinaryValue'
import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { Engine } from '../../ecs/classes/Engine'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { defineQuery } from '../../ecs/functions/ComponentFunctions'
import { InputComponent } from '../../input/components/InputComponent'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { InputType } from '../../input/enums/InputType'
import { gamepadMapping } from '../../input/functions/GamepadInput'
import { XRReferenceSpaceType } from '../../input/types/WebXR'
import { addDefaultControllerModels } from '../functions/addControllerModels'
import { endXR, startWebXR } from '../functions/WebXRFunctions'

/**
 * System for XR session and input handling
 * @author Josh Field <github.com/hexafield>
 */

export default async function XRSystem(world: World): Promise<System> {
  const referenceSpaceType: XRReferenceSpaceType = 'local-floor'

  const localXRControllerQuery = defineQuery([InputComponent, LocalInputTagComponent, XRInputSourceComponent])

  // TEMPORARY - precache controller model
  // TODO: remove this when IK system is in
  await AssetLoader.loadAsync({ url: '/models/webxr/controllers/valve_controller_knu_1_0_right.glb' })
  // Cache hand models
  await AssetLoader.loadAsync({ url: '/models/webxr/controllers/hands/left.glb' })
  await AssetLoader.loadAsync({ url: '/models/webxr/controllers/hands/right.glb' })

  EngineEvents.instance.addEventListener(EngineEvents.EVENTS.XR_START, async (ev: any) => {
    Engine.renderer.outputEncoding = sRGBEncoding
    const sessionInit = { optionalFeatures: [referenceSpaceType, 'hand-tracking'] }
    try {
      const session = await (navigator as any).xr.requestSession('immersive-vr', sessionInit)

      Engine.xrSession = session
      Engine.xrRenderer.setReferenceSpaceType(referenceSpaceType)
      Engine.xrRenderer.setSession(session)
      EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.XR_SESSION })

      Engine.xrRenderer.getCamera().layers.enableAll()

      Engine.xrRenderer.addEventListener('sessionend', async () => {
        endXR()
        EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.XR_END })
      })

      startWebXR()
    } catch (e) {
      console.log('Failed to create XR Session', e)
    }
  })

  return () => {
    if (Engine.xrRenderer?.isPresenting) {
      const session = Engine.xrFrame.session
      for (const source of session.inputSources) {
        if (source.gamepad) {
          const mapping = gamepadMapping[source.gamepad.mapping || 'xr-standard'][source.handedness]
          source.gamepad?.buttons.forEach((button, index) => {
            // TODO : support button.touched and button.value
            const prev = Engine.prevInputState.get(mapping.buttons[index])
            if (!prev && button.pressed == false) return
            const continued = prev?.value && button.pressed
            Engine.inputState.set(mapping.buttons[index], {
              type: InputType.BUTTON,
              value: [button.pressed ? BinaryValue.ON : BinaryValue.OFF],
              lifecycleState: button.pressed
                ? continued
                  ? LifecycleValue.Continued
                  : LifecycleValue.Started
                : LifecycleValue.Ended
            })
          })
          if (source.gamepad?.axes.length > 2) {
            Engine.inputState.set(mapping.axes, {
              type: InputType.TWODIM,
              value: [source.gamepad.axes[2], source.gamepad.axes[3]],
              lifecycleState: LifecycleValue.Started
            })
          } else {
            Engine.inputState.set(mapping.axes, {
              type: InputType.TWODIM,
              value: [source.gamepad.axes[0], source.gamepad.axes[1]],
              lifecycleState: LifecycleValue.Started
            })
          }
        }
      }
    }

    if (Engine.xrControllerModel) {
      for (const entity of localXRControllerQuery.enter()) {
        addDefaultControllerModels(entity)
      }
    }
  }
  // TODO: add and remove controller models from grips
}
