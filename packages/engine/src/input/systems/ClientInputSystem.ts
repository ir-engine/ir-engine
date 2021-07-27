import { Engine } from '../../ecs/classes/Engine'
import {
  handleContextMenu,
  handleKey,
  handleMouseButton,
  handleMouseLeave,
  handleMouseMovement,
  handleMouseWheel,
  handleTouch,
  handleTouchDirectionalPad,
  handleTouchGamepadButton,
  handleTouchMove,
  handleVisibilityChange,
  handleWindowFocus
} from '../schema/ClientInputSchema'
import { System, SystemAttributes } from '../../ecs/classes/System'
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType'
import { handleGamepadConnected, handleGamepadDisconnected, handleGamepads } from '../behaviors/GamepadInputBehaviors'
import { InputType } from '../enums/InputType'
import { InputValue } from '../interfaces/InputValue'
import { NumericalType } from '../../common/types/NumericalTypes'
import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { InputAlias } from '../types/InputAlias'
import { EngineEvents } from '../../ecs/classes/EngineEvents'

const supportsPassive = (function () {
  let supportsPassiveValue = false
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: function () {
        supportsPassiveValue = true
      }
    })
    window.addEventListener('testPassive', null, opts)
    window.removeEventListener('testPassive', null, opts)
  } catch (error) {}
  return supportsPassiveValue
})()

const keys = { 37: 1, 38: 1, 39: 1, 40: 1 }

function preventDefault(e) {
  e.preventDefault()
}

function preventDefaultForScrollKeys(e) {
  if (keys[e.keyCode]) {
    preventDefault(e)
    return false
  }
}

// for future api stuff, we should replace ClientInputSchema with a user given option & default to ClientInputSchema

interface ListenerBindingData {
  domElement: any
  eventName: string
  callback: (event) => void
}

/**
 * Input System
 *
 * Property with prefix readonly makes a property as read-only in the class
 * @property {Number} mainControllerId set value 0
 * @property {Number} secondControllerId set value 1
 */

export class ClientInputSystem extends System {
  static EVENTS = {
    ENABLE_INPUT: 'CLIENT_INPUT_SYSTEM_ENABLE_INPUT',
    PROCESS_INPUT: 'CLIENT_INPUT_SYSTEM_PROCESS_EVENT'
  }

  static instance: ClientInputSystem

  updateType = SystemUpdateType.Free
  needSend = false
  switchId = 1
  boundListeners: ListenerBindingData[] = []
  mouseInputEnabled = true
  keyboardInputEnabled = true

  constructor(attributes: SystemAttributes = {}) {
    super(attributes)

    ClientInputSystem.instance = this

    window.addEventListener('DOMMouseScroll', preventDefault, false)
    window.addEventListener('keydown', preventDefaultForScrollKeys, false)

    EngineEvents.instance.addEventListener(ClientInputSystem.EVENTS.ENABLE_INPUT, ({ keyboard, mouse }) => {
      if (typeof keyboard !== 'undefined') ClientInputSystem.instance.keyboardInputEnabled = keyboard
      if (typeof mouse !== 'undefined') ClientInputSystem.instance.mouseInputEnabled = mouse
    })

    const addListener = (domElement, eventName, callback, passive = false) => {
      if (passive && supportsPassive) {
        domElement.addEventListener(eventName, callback, { passive })
      } else {
        domElement.addEventListener(eventName, callback)
      }
      this.boundListeners.push({
        domElement,
        eventName,
        callback
      })
    }

    const viewportElement = Engine.viewportElement ?? (document as any)

    addListener(viewportElement, 'contextmenu', handleContextMenu)

    addListener(viewportElement, 'mousemove', handleMouseMovement)
    addListener(viewportElement, 'mouseup', handleMouseButton)
    addListener(viewportElement, 'mousedown', handleMouseButton)
    addListener(viewportElement, 'mouseleave', handleMouseLeave)
    addListener(viewportElement, 'wheel', handleMouseWheel, true)

    addListener(
      viewportElement,
      'touchstart',
      (e) => {
        handleTouch(e)
        handleTouchMove(e)
      },
      true
    )
    addListener(viewportElement, 'touchend', handleTouch, true)
    addListener(viewportElement, 'touchcancel', handleTouch, true)
    addListener(viewportElement, 'touchmove', handleTouchMove, true)

    addListener(document, 'keyup', handleKey)
    addListener(document, 'keydown', handleKey)

    addListener(window, 'focus', handleWindowFocus)
    addListener(window, 'blur', handleWindowFocus)

    addListener(document, 'visibilitychange', handleVisibilityChange)
    addListener(document, 'touchstickmove', handleTouchDirectionalPad)
    addListener(document, 'touchgamepadbuttondown', handleTouchGamepadButton)
    addListener(document, 'touchgamepadbuttonup', handleTouchGamepadButton)

    addListener(window, 'gamepadconnected', handleGamepadConnected)
    addListener(window, 'gamepaddisconnected', handleGamepadDisconnected)
  }

  dispose(): void {
    window.removeEventListener('DOMMouseScroll', preventDefault, false)
    window.removeEventListener('keydown', preventDefaultForScrollKeys, false)

    this.boundListeners.forEach(({ domElement, eventName, callback }) => {
      domElement.removeEventListener(eventName, callback)
    })
    EngineEvents.instance.removeAllListenersForEvent(ClientInputSystem.EVENTS.ENABLE_INPUT)
  }

  /**
   *
   * @param {Number} delta Time since last frame
   */

  public execute(delta: number): void {
    // we get XR gamepad input from XRSystem, grabbing from gamepad api again breaks stuff
    if (!Engine.xrSession) {
      handleGamepads()
    }
    const newState = new Map<InputAlias, InputValue<NumericalType>>()
    Engine.inputState.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
      if (!Engine.prevInputState.has(key)) {
        return
      }

      if (value.type === InputType.BUTTON) {
        const prevValue = Engine.prevInputState.get(key)
        // auto ENDED when event not continue
        if (
          (prevValue.lifecycleState === LifecycleValue.STARTED && value.lifecycleState === LifecycleValue.STARTED) ||
          (prevValue.lifecycleState === LifecycleValue.CONTINUED && value.lifecycleState === LifecycleValue.STARTED)
        ) {
          // auto-switch to CONTINUED
          value.lifecycleState = LifecycleValue.CONTINUED
        }
        return
      }

      if (value.lifecycleState === LifecycleValue.ENDED) {
        // ENDED here is a special case, like mouse position on mouse down
        return
      }

      value.lifecycleState =
        JSON.stringify(value.value) === JSON.stringify(Engine.prevInputState.get(key).value)
          ? LifecycleValue.UNCHANGED
          : LifecycleValue.CHANGED
    })

    // deep copy
    Engine.inputState.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
      if (
        !(
          value.lifecycleState === LifecycleValue.UNCHANGED &&
          Engine.prevInputState.get(key)?.lifecycleState === LifecycleValue.UNCHANGED
        )
      ) {
        newState.set(key, { type: value.type, value: value.value, lifecycleState: value.lifecycleState })
      }
    })

    EngineEvents.instance.dispatchEvent({ type: ClientInputSystem.EVENTS.PROCESS_INPUT, data: newState })

    Engine.prevInputState.clear()
    Engine.inputState.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
      Engine.prevInputState.set(key, value)
      if (value.lifecycleState === LifecycleValue.ENDED) {
        Engine.inputState.delete(key)
      }
    })
  }
}
