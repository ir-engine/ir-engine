import { getState, none } from '@xrengine/hyperflux'

import { isClient } from '../../common/functions/isClient'
import { World } from '../../ecs/classes/World'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import normalizeWheel from '../functions/normalizeWheel'
import { ButtonInputState, ButtonTypes } from '../InputState'

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
  addListener(canvas, 'contextmenu', preventDefault)

  let lastPrimaryClickDown = 0
  let lastAuxiliaryClickDown = 0
  let lastSecondaryClickDown = 0

  const keyState = getState(ButtonInputState)

  const handleMouseClick = (event: MouseEvent) => {
    const down = event.type === 'mousedown' || event.type === 'touchstart'

    let button: ButtonTypes = 'PrimaryClick'
    if (event.button === 1) button = 'AuxiliaryClick'
    else if (event.button === 2) button = 'SecondaryClick'

    if (down) keyState[button].set(true)
    else keyState[button].set(none)

    if (down) {
      const now = Date.now()
      if (button === 'PrimaryClick') {
        if (now - lastPrimaryClickDown < 200 && now - lastPrimaryClickDown > 50)
          keyState['PrimaryDoubleClick'].set(true)
        lastPrimaryClickDown = now
      }

      if (button === 'AuxiliaryClick') {
        if (now - lastAuxiliaryClickDown < 200 && now - lastAuxiliaryClickDown > 50)
          keyState['AuxiliaryDoubleClick'].set(true)
        lastAuxiliaryClickDown = now
      }

      if (button === 'SecondaryClick') {
        if (now - lastSecondaryClickDown < 200 && now - lastSecondaryClickDown > 50)
          keyState['SecondaryDoubleClick'].set(true)
        lastSecondaryClickDown = now
      }
    } else {
      if (button === 'PrimaryClick' && keyState['PrimaryDoubleClick'].value) keyState['PrimaryDoubleClick'].set(none)
      if (button === 'PrimaryClick' && keyState['PrimaryMove'].value) keyState['PrimaryMove'].set(none)

      if (button === 'SecondaryClick' && keyState['SecondaryDoubleClick'].value)
        keyState['SecondaryDoubleClick'].set(none)
      if (button === 'SecondaryClick' && keyState['SecondaryMove'].value) keyState['SecondaryMove'].set(none)

      if (button === 'AuxiliaryClick' && keyState['AuxiliaryDoubleClick'].value)
        keyState['AuxiliaryDoubleClick'].set(none)
      if (button === 'AuxiliaryClick' && keyState['AuxiliaryMove'].value) keyState['AuxiliaryMove'].set(none)
    }
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (keyState['PrimaryClick'].value) keyState['PrimaryMove'].set(true)
    if (keyState['SecondaryClick'].value) keyState['SecondaryMove'].set(true)
    if (keyState['AuxiliaryClick'].value) keyState['AuxiliaryMove'].set(true)
    world.pointerState.position.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      (event.clientY / window.innerHeight) * -2 + 1
    )
  }

  const handleTouchMove = (event: TouchEvent) => {
    if (keyState['PrimaryClick'].value) keyState['PrimaryMove'].set(true)
    if (keyState['SecondaryClick'].value) keyState['SecondaryMove'].set(true)
    if (keyState['AuxiliaryClick'].value) keyState['AuxiliaryMove'].set(true)
    const touch = event.touches[0]
    world.pointerState.position.set(
      (touch.clientX / window.innerWidth) * 2 - 1,
      (touch.clientY / window.innerHeight) * -2 + 1
    )
  }

  addListener(window, 'touchmove', handleTouchMove, { passive: true, capture: true })
  addListener(window, 'mousemove', handleMouseMove, { passive: true, capture: true })
  addListener(canvas, 'mouseup', handleMouseClick)
  addListener(canvas, 'mousedown', handleMouseClick)
  addListener(canvas, 'touchstart', handleMouseClick)
  addListener(canvas, 'touchend', handleMouseClick)

  const handleTouchDirectionalPad = (event: CustomEvent): void => {
    const { stick, value }: { stick: 'StickLeft' | 'StickRight'; value: { x: number; y: number } } = event.detail
    if (!stick) {
      return
    }

    const index = stick === 'StickLeft' ? 0 : 1

    const axes = world.inputSources[index].gamepad!.axes as number[]

    axes[0] = value.x
    axes[1] = value.y
  }
  addListener(document, 'touchstickmove', handleTouchDirectionalPad)

  const clearKeyState = () => {
    keyState.set({} as any)
  }
  addListener(window, 'focus', clearKeyState)
  addListener(window, 'blur', clearKeyState)

  const handleVisibilityChange = (event: Event) => {
    if (document.visibilityState === 'hidden') clearKeyState()
  }

  addListener(document, 'visibilitychange', handleVisibilityChange)

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

  const onWheelEvent = (event: WheelEvent) => {
    const normalizedValues = normalizeWheel(event)
    const x = Math.sign(normalizedValues.spinX + Math.random() * 0.000001)
    const y = Math.sign(normalizedValues.spinY + Math.random() * 0.000001)
    world.pointerState.scroll.x += x
    world.pointerState.scroll.y += y
  }
  addListener(canvas, 'wheel', onWheelEvent, { passive: true, capture: true })
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

export default async function ClientInputSystem(world: World) {
  addClientInputListeners(world)
  world.pointerScreenRaycaster.layers.enableAll()

  const execute = () => {
    world.pointerScreenRaycaster.setFromCamera(world.pointerState.position, world.camera)

    world.pointerState.movement.subVectors(world.pointerState.position, world.pointerState.lastPosition)
    world.pointerState.lastPosition.copy(world.pointerState.position)

    world.pointerState.lastScroll.copy(world.pointerState.scroll)
  }

  const cleanup = async () => {
    removeClientInputListeners()
  }

  return { execute, cleanup }
}
