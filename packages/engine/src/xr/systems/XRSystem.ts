import { Group, sRGBEncoding, Vector3 } from 'three'
import { BinaryValue } from '../../common/enums/BinaryValue'
import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { Engine } from '../../ecs/classes/Engine'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { System, SystemAttributes } from '../../ecs/classes/System'
import { gamepadMapping } from '../../input/behaviors/GamepadInputBehaviors'
import { InputType } from '../../input/enums/InputType'
import { endXR, startXR } from '../functions/WebXRFunctions'
import { XRFrame, XRReferenceSpace, XRReferenceSpaceType, XRWebGLLayer } from '../../input/types/WebXR'
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType'

/**
 * System for XR session and input handling
 *
 * @author Josh Field <github.com/hexafield>
 */

export class XRSystem extends System {
  static EVENTS = {
    XR_START: 'WEBXR_RENDERER_SYSTEM_XR_START',
    XR_SESSION: 'WEBXR_RENDERER_SYSTEM_XR_SESSION',
    XR_END: 'WEBXR_RENDERER_SYSTEM_XR_END'
  }

  xrFrame: XRFrame
  updateType = SystemUpdateType.Free

  referenceSpaceType: XRReferenceSpaceType = 'local-floor'
  referenceSpace: XRReferenceSpace
  static instance: XRSystem

  constructor(attributes: SystemAttributes = {}) {
    super(attributes)

    XRSystem.instance = this

    EngineEvents.instance.addEventListener(XRSystem.EVENTS.XR_START, async (ev: any) => {
      Engine.renderer.outputEncoding = sRGBEncoding
      const sessionInit = { optionalFeatures: [this.referenceSpaceType] }
      try {
        console.log('XR_START')
        const session = await (navigator as any).xr.requestSession('immersive-vr', sessionInit)

        Engine.xrSession = session
        Engine.xrRenderer.setReferenceSpaceType(this.referenceSpaceType)
        Engine.xrRenderer.setSession(session)
        EngineEvents.instance.dispatchEvent({ type: XRSystem.EVENTS.XR_SESSION })

        Engine.xrRenderer.addEventListener('sessionend', async () => {
          endXR()
          EngineEvents.instance.dispatchEvent({ type: XRSystem.EVENTS.XR_END })
        })
        console.log('has session')

        startXR()
        console.log('has session')
      } catch (e) {
        console.log('Failed to create XR Session', e)
      }
    })

    EngineEvents.instance.addEventListener(XRSystem.EVENTS.XR_END, async (ev: any) => {})
  }

  /** Removes resize listener. */
  dispose(): void {
    super.dispose()
    EngineEvents.instance.removeAllListenersForEvent(XRSystem.EVENTS.XR_START)
    EngineEvents.instance.removeAllListenersForEvent(XRSystem.EVENTS.XR_END)
  }

  /**
   * Executes the system. Called each frame by default from the Engine.
   * @param delta Time since last frame.
   */
  execute(delta: number): void {
    if (Engine.xrRenderer?.isPresenting) {
      const session = this.xrFrame.session
      session.inputSources.forEach((source) => {
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
      })
    }
  }
  // TODO: add and remove controller models from grips
}

XRSystem.queries = {}
