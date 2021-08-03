import { handleGamepadConnected, handleGamepadDisconnected } from '../behaviors/GamepadInputBehaviors'
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

interface ListenerBindingData {
  domElement: any
  eventName: string
  callback: (event) => void
}

const boundListeners: ListenerBindingData[] = []

export const addClientInputListeners = () => {
  window.addEventListener('DOMMouseScroll', preventDefault, false)
  window.addEventListener('keydown', preventDefaultForScrollKeys, false)

  const addListener = (domElement, eventName, callback, passive = false) => {
    if (passive && supportsPassive) {
      domElement.addEventListener(eventName, callback, { passive })
    } else {
      domElement.addEventListener(eventName, callback)
    }
    boundListeners.push({
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

export const removeClientInputListeners = () => {
  window.removeEventListener('DOMMouseScroll', preventDefault, false)
  window.removeEventListener('keydown', preventDefaultForScrollKeys, false)

  boundListeners.forEach(({ domElement, eventName, callback }) => {
    domElement.removeEventListener(eventName, callback)
  })
  boundListeners.splice(0, boundListeners.length - 1)
}
