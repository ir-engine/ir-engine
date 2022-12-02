import { getState, none } from '@xrengine/hyperflux'

import { isClient } from '../../common/functions/isClient'
import { World } from '../../ecs/classes/World'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { ButtonInputState } from '../InputState'
import {
  handleContextMenu,
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
import { handleGamepadConnected, handleGamepadDisconnected } from './GamepadInput'
import normalizeWheel from './normalizeWheel'

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

export const addClientInputListeners = (world: World) => {
  if (!isClient) return
  const canvas = EngineRenderer.instance.canvas

  window.addEventListener('DOMMouseScroll', preventDefault, false)
  window.addEventListener(
    'keydown',
    (evt) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return
      if (evt.code === 'Tab') evt.preventDefault()
      // prevent DOM tab selection and spacebar/enter button toggling (since it interferes with avatar controls)
      if (evt.code === 'Space' || evt.code === 'Enter') evt.preventDefault()
    },
    false
  )

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

  addListener(document, 'gesturestart', preventDefault)

  addListener(canvas, 'contextmenu', handleContextMenu)

  addListener(canvas, 'mousemove', handleMouseMovement)
  addListener(canvas, 'mouseup', handleMouseButton)
  addListener(canvas, 'mousedown', handleMouseButton)
  addListener(canvas, 'mouseleave', handleMouseLeave)
  // addListener(canvas, 'wheel', handleMouseWheel, { passive: true, capture: true })

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

  // addListener(document, 'keyup', handleKey)
  // addListener(document, 'keydown', handleKey)

  addListener(window, 'focus', handleWindowFocus)
  addListener(window, 'blur', handleWindowFocus)

  addListener(document, 'visibilitychange', handleVisibilityChange)
  addListener(document, 'touchstickmove', handleTouchDirectionalPad)
  addListener(document, 'touchgamepadbuttondown', handleTouchGamepadButton)
  addListener(document, 'touchgamepadbuttonup', handleTouchGamepadButton)

  addListener(window, 'gamepadconnected', handleGamepadConnected)
  addListener(window, 'gamepaddisconnected', handleGamepadDisconnected)

  const keyState = getState(ButtonInputState)

  /** new */
  const onKeyEvent = (event: KeyboardEvent) => {
    const element = event.target as HTMLElement
    // Сheck which excludes the possibility of controlling the avatar when typing in a text field
    if (element?.tagName === 'INPUT' || element?.tagName === 'SELECT' || element?.tagName === 'TEXTAREA') return

    const code = event.code
    const down = event.type === 'keydown'

    if (down) keyState[code].set(true)
    else keyState[code].set(none)
  }

  addListener(document, 'keyup', onKeyEvent)
  addListener(document, 'keydown', onKeyEvent)
  addListener(
    canvas,
    'wheel',
    (event: WheelEvent) => {
      for (const inputSource of world.inputSources) {
        const gamepad = inputSource.gamepad
        if ((gamepad?.mapping as any) === 'dom') {
          const axes = gamepad!.axes as number[]
          const normalizedValues = normalizeWheel(event)
          if (normalizedValues.spinX) {
            const value = normalizedValues.spinX + Math.random() * 0.000001
            axes[3] += Math.sign(value)
          }
          if (normalizedValues.spinY) {
            const value = normalizedValues.spinY + Math.random() * 0.000001
            axes[4] += Math.sign(value)
          }
        }
      }
    },
    { passive: true, capture: true }
  )
}

export const removeClientInputListeners = () => {
  // if not client, no listeners will exist
  if (!boundListeners.length) return

  window.removeEventListener('DOMMouseScroll', preventDefault, false)

  boundListeners.forEach(({ domElement, eventName, callback }) => {
    domElement.removeEventListener(eventName, callback)
  })
  boundListeners.splice(0, boundListeners.length - 1)
}
