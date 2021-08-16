import { sRGBEncoding } from 'three'
import { BinaryValue } from '../../common/enums/BinaryValue'
import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { Engine } from '../../ecs/classes/Engine'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { gamepadMapping } from '../../input/behaviors/GamepadInputBehaviors'
import { InputType } from '../../input/enums/InputType'
import { endXR, startXR } from '../functions/WebXRFunctions'
import { XRReferenceSpace, XRReferenceSpaceType } from '../../input/types/WebXR'
import { LocalInputReceiverComponent } from '../../input/components/LocalInputReceiverComponent'
import { XRInputSourceComponent } from '../../avatar/components/XRInputSourceComponent'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { addControllerModels } from '../functions/addControllerModels'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { InputComponent } from '../../input/components/InputComponent'
import { BaseInput } from '../../input/enums/BaseInput'
import { defineQuery, defineSystem, enterQuery, System } from '../../ecs/bitecs'
import { ECSWorld } from '../../ecs/classes/World'

/**
 * System for XR session and input handling
 *
 * @author Josh Field <github.com/hexafield>
 */

export const XRSystem = async (): Promise<System> => {
  const referenceSpaceType: XRReferenceSpaceType = 'local-floor'

  const localXRControllerQuery = defineQuery([InputComponent, LocalInputReceiverComponent, XRInputSourceComponent])
  const localXRControllerAddQuery = enterQuery(localXRControllerQuery)

  // TEMPORARY - precache controller model
  // TODO: remove this when IK system is in
  AssetLoader.loadAsync({ url: '/models/webxr/controllers/valve_controller_knu_1_0_right.glb' })

  EngineEvents.instance.addEventListener(EngineEvents.EVENTS.XR_START, async (ev: any) => {
    Engine.renderer.outputEncoding = sRGBEncoding
    const sessionInit = { optionalFeatures: [referenceSpaceType] }
    try {
      const session = await (navigator as any).xr.requestSession('immersive-vr', sessionInit)

      Engine.xrSession = session
      Engine.xrRenderer.setReferenceSpaceType(referenceSpaceType)
      Engine.xrRenderer.setSession(session)
      EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.XR_SESSION })

      Engine.xrRenderer.addEventListener('sessionend', async () => {
        endXR()
        EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.XR_END })
      })

      startXR()
    } catch (e) {
      console.log('Failed to create XR Session', e)
    }
  })

  return defineSystem((world: ECSWorld) => {
    if (Engine.xrRenderer?.isPresenting) {
      const session = Engine.xrFrame.session
      for (const source of session.inputSources) {
        if (source.gamepad) {
          const mapping = gamepadMapping[source.gamepad.mapping || 'xr-standard'][source.handedness]
          source.gamepad?.buttons.forEach((button, index) => {
            // TODO : support button.touched and button.value
            button.pressed && console.log(index, mapping.buttons[index])
            Engine.inputState.set(mapping.buttons[index], {
              type: InputType.BUTTON,
              value: button.pressed ? BinaryValue.ON : BinaryValue.OFF,
              lifecycleState: button.pressed ? LifecycleValue.STARTED : LifecycleValue.ENDED
            })
          })
          if (source.gamepad?.axes.length > 2) {
            Engine.inputState.set(mapping.axes, {
              type: InputType.TWODIM,
              value: [source.gamepad.axes[2], source.gamepad.axes[3]],
              lifecycleState: LifecycleValue.STARTED
            })
          } else {
            Engine.inputState.set(mapping.axes, {
              type: InputType.TWODIM,
              value: [source.gamepad.axes[0], source.gamepad.axes[1]],
              lifecycleState: LifecycleValue.STARTED
            })
          }
        }
      }
    }

    for (const entity of localXRControllerAddQuery(world)) {
      addControllerModels(entity)
    }

    for (const entity of localXRControllerQuery(world)) {
      const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
      const input = getComponent(entity, InputComponent)
      input.data.set(BaseInput.XR_HEAD, {
        type: InputType.SIXDOF,
        value: {
          x: xrInputSourceComponent.head.position.x,
          y: xrInputSourceComponent.head.position.y,
          z: xrInputSourceComponent.head.position.z,
          qW: xrInputSourceComponent.head.quaternion.w,
          qX: xrInputSourceComponent.head.quaternion.x,
          qY: xrInputSourceComponent.head.quaternion.y,
          qZ: xrInputSourceComponent.head.quaternion.z
        },
        lifecycleState: LifecycleValue.CHANGED
      })
      input.data.set(BaseInput.XR_CONTROLLER_LEFT_HAND, {
        type: InputType.SIXDOF,
        value: {
          x: xrInputSourceComponent.controllerLeft.position.x,
          y: xrInputSourceComponent.controllerLeft.position.y,
          z: xrInputSourceComponent.controllerLeft.position.z,
          qW: xrInputSourceComponent.controllerLeft.quaternion.w,
          qX: xrInputSourceComponent.controllerLeft.quaternion.x,
          qY: xrInputSourceComponent.controllerLeft.quaternion.y,
          qZ: xrInputSourceComponent.controllerLeft.quaternion.z
        },
        lifecycleState: LifecycleValue.CHANGED
      })
      input.data.set(BaseInput.XR_CONTROLLER_RIGHT_HAND, {
        type: InputType.SIXDOF,
        value: {
          x: xrInputSourceComponent.controllerRight.position.x,
          y: xrInputSourceComponent.controllerRight.position.y,
          z: xrInputSourceComponent.controllerRight.position.z,
          qW: xrInputSourceComponent.controllerRight.quaternion.w,
          qX: xrInputSourceComponent.controllerRight.quaternion.x,
          qY: xrInputSourceComponent.controllerRight.quaternion.y,
          qZ: xrInputSourceComponent.controllerRight.quaternion.z
        },
        lifecycleState: LifecycleValue.CHANGED
      })
    }

    return world
  })
  // TODO: add and remove controller models from grips
}
