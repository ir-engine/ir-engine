import { handleGamepadConnected, handleGamepadDisconnected } from './GamepadInput'
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
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { isClient } from '../../common/functions/isClient'

const keys = { 37: 1, 38: 1, 39: 1, 40: 1 }

function preventDefault(e) {
  e.preventDefault()
}
interface ListenerBindingData {
  domElement: any
  eventName: string
  callback: (event) => void
}

const boundListeners: ListenerBindingData[] = []

export const addClientInputListeners = () => {
  if (!isClient) return
  const canvas = EngineRenderer.instance.canvas

  window.addEventListener('DOMMouseScroll', preventDefault, false)
  window.addEventListener('touchmove', preventDefault, { capture: true, passive: false })

  const addListener = (
    domElement: HTMLElement | Document | Window,
    eventName,
    callback: (event: Event) => void,
    options?: boolean | AddEventListenerOptions
  ) => {
    domElement.addEventListener(eventName, callback, options)
    boundListeners.push({
      domElement,
      eventName,
      callback
    })
  }

  addListener(canvas, 'contextmenu', handleContextMenu)

  addListener(canvas, 'mousemove', handleMouseMovement)
  addListener(canvas, 'mouseup', handleMouseButton)
  addListener(canvas, 'mousedown', handleMouseButton)
  addListener(canvas, 'mouseleave', handleMouseLeave)
  addListener(canvas, 'wheel', handleMouseWheel, { passive: true, capture: true })

  addListener(
    canvas,
    'touchstart',
    (e: TouchEvent) => {
      handleTouch(e)
      handleTouchMove(e)
    },
    {
      passive: true,
      capture: true
    }
  )
  addListener(canvas, 'touchend', handleTouch, { passive: true })
  addListener(canvas, 'touchcancel', handleTouch, { passive: true })
  addListener(canvas, 'touchmove', handleTouchMove, { passive: true })

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
  // if not client, no listeners will exist
  if (!boundListeners.length) return

  window.removeEventListener('DOMMouseScroll', preventDefault, false)
  window.removeEventListener('touchmove', preventDefault, { capture: true })

  boundListeners.forEach(({ domElement, eventName, callback }) => {
    domElement.removeEventListener(eventName, callback)
  })
  boundListeners.splice(0, boundListeners.length - 1)
}

export default {}
