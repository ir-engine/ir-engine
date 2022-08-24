import { Vector2 } from 'three'

import { BinaryValue } from '../../common/enums/BinaryValue'
import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { Engine } from '../../ecs/classes/Engine'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { GamepadAxis } from '../enums/InputEnums'
import { GamepadButtons, MouseInput, TouchInputs } from '../enums/InputEnums'
import { InputType } from '../enums/InputType'
import normalizeWheel from '../functions/normalizeWheel'

export let prevTouchPosition: [number, number] = [0, 0]
let lastTap = Date.now()
const tapLength = 200 // 100ms between doubletaps

/**
 * Touch move
 *
 * @param args is argument object
 */

export const usingThumbstick = () => {
  return Boolean(
    Engine.instance.currentWorld.inputState.get(GamepadAxis.LThumbstick)?.value[0] ||
      Engine.instance.currentWorld.inputState.get(GamepadAxis.LThumbstick)?.value[1] ||
      Engine.instance.currentWorld.inputState.get(GamepadAxis.RThumbstick)?.value[0] ||
      Engine.instance.currentWorld.inputState.get(GamepadAxis.RThumbstick)?.value[1]
  )
}

export const handleTouchMove = (event: TouchEvent): void => {
  if (event.touches.length <= 0) {
    return
  }

  const normalizedPosition = normalizeMouseCoordinates(
    event.touches[0].clientX,
    event.touches[0].clientY,
    window.innerWidth,
    window.innerHeight
  )
  const touchPosition: [number, number] = [normalizedPosition.x, normalizedPosition.y]

  if (event.touches.length >= 1) {
    const mappedPositionInput = TouchInputs.Touch1Position
    const hasData = Engine.instance.currentWorld.inputState.has(mappedPositionInput)

    Engine.instance.currentWorld.inputState.set(mappedPositionInput, {
      type: InputType.TWODIM,
      value: touchPosition,
      lifecycleState: hasData ? LifecycleValue.Changed : LifecycleValue.Started
    })

    const movementStart = event.type === 'touchstart'
    const mappedMovementInput = TouchInputs.Touch1Movement

    const touchMovement: [number, number] = [0, 0]
    if (!movementStart && prevTouchPosition) {
      touchMovement[0] = touchPosition[0] - prevTouchPosition[0]
      touchMovement[1] = touchPosition[1] - prevTouchPosition[1]
    }

    prevTouchPosition = touchPosition

    Engine.instance.currentWorld.inputState.set(mappedMovementInput, {
      type: InputType.TWODIM,
      value: touchMovement,
      lifecycleState: Engine.instance.currentWorld.inputState.has(mappedMovementInput)
        ? LifecycleValue.Changed
        : LifecycleValue.Started
    })
  } else if (event.touches.length >= 2) {
    const normalizedPosition2 = normalizeMouseCoordinates(
      event.touches[1].clientX,
      event.touches[1].clientY,
      window.innerWidth,
      window.innerHeight
    )
    const touchPosition2: [number, number] = [normalizedPosition2.x, normalizedPosition2.y]

    Engine.instance.currentWorld.inputState.set(TouchInputs.Touch1Position, {
      type: InputType.TWODIM,
      value: touchPosition,
      lifecycleState: LifecycleValue.Changed
    })

    Engine.instance.currentWorld.inputState.set(TouchInputs.Touch2Position, {
      type: InputType.TWODIM,
      value: touchPosition2,
      lifecycleState: LifecycleValue.Changed
    })

    const scaleMappedInputKey = TouchInputs.Scale

    const usingStick = usingThumbstick()

    if (usingStick) {
      if (Engine.instance.currentWorld.inputState.has(scaleMappedInputKey)) {
        const [oldValue] = Engine.instance.currentWorld.inputState.get(scaleMappedInputKey)?.value as number[]
        Engine.instance.currentWorld.inputState.set(scaleMappedInputKey, {
          type: InputType.ONEDIM,
          value: [oldValue],
          lifecycleState: LifecycleValue.Ended
        })
      }
      return
    }

    const lastTouchcontrollerPositionLeftArray = Engine.instance.currentWorld.prevInputState.get(
      TouchInputs.Touch1Position
    )?.value
    const lastTouchPosition2Array = Engine.instance.currentWorld.prevInputState.get(TouchInputs.Touch2Position)?.value
    if (event.type === 'touchstart' || !lastTouchcontrollerPositionLeftArray || !lastTouchPosition2Array) {
      // skip if it's just start of gesture or there are no previous data yet
      return
    }

    if (
      !Engine.instance.currentWorld.inputState.has(TouchInputs.Touch1Position) ||
      !Engine.instance.currentWorld.inputState.has(TouchInputs.Touch2Position)
    ) {
      console.warn('handleTouchScale requires POINTER1_POSITION and POINTER2_POSITION to be set and updated.')
      return
    }
    const currentTouchcontrollerPositionLeft = new Vector2().fromArray(
      Engine.instance.currentWorld.inputState.get(TouchInputs.Touch1Position)?.value as number[]
    )
    const currentTouchPosition2 = new Vector2().fromArray(
      Engine.instance.currentWorld.inputState.get(TouchInputs.Touch2Position)?.value as number[]
    )

    const lastTouchcontrollerPositionLeft = new Vector2().fromArray(lastTouchcontrollerPositionLeftArray as number[])
    const lastTouchPosition2 = new Vector2().fromArray(lastTouchPosition2Array as number[])

    const currentDistance = currentTouchcontrollerPositionLeft.distanceTo(currentTouchPosition2)
    const lastDistance = lastTouchcontrollerPositionLeft.distanceTo(lastTouchPosition2)

    const touchScaleValue = (lastDistance - currentDistance) * 0.01
    const signVal = Math.sign(touchScaleValue)
    if (!Engine.instance.currentWorld.inputState.has(scaleMappedInputKey)) {
      Engine.instance.currentWorld.inputState.set(scaleMappedInputKey, {
        type: InputType.ONEDIM,
        value: [signVal],
        lifecycleState: LifecycleValue.Started
      })
    } else {
      const [oldValue] = Engine.instance.currentWorld.inputState.get(scaleMappedInputKey)?.value as number[]
      Engine.instance.currentWorld.inputState.set(scaleMappedInputKey, {
        type: InputType.ONEDIM,
        value: [oldValue + signVal],
        lifecycleState: LifecycleValue.Changed
      })
    }
  }
}

/**
 * Handle Touch
 *
 * @param args is argument object
 */
export const handleTouch = (event: TouchEvent): void => {
  if (event.targetTouches.length) {
    const mappedInputKey = TouchInputs.Touch
    if (event.type === 'touchstart') {
      if (event.targetTouches.length == 1) {
        const timeNow = Date.now()
        const doubleTapInput = TouchInputs.DoubleTouch
        if (timeNow - lastTap < tapLength) {
          Engine.instance.currentWorld.inputState.set(doubleTapInput, {
            type: InputType.BUTTON,
            value: [BinaryValue.ON],
            lifecycleState: Engine.instance.currentWorld.inputState.has(doubleTapInput)
              ? LifecycleValue.Unchanged
              : LifecycleValue.Started
          })
        } else if (Engine.instance.currentWorld.inputState.has(doubleTapInput)) {
          Engine.instance.currentWorld.inputState.set(doubleTapInput, {
            type: InputType.BUTTON,
            value: [BinaryValue.OFF],
            lifecycleState: LifecycleValue.Ended
          })
        }
        lastTap = timeNow
      }

      // If the key is in the map but it's in the same state as now, let's skip it (debounce)
      if (
        Engine.instance.currentWorld.inputState.has(mappedInputKey) &&
        Engine.instance.currentWorld.inputState.get(mappedInputKey)?.value[0] === BinaryValue.ON
      ) {
        if (Engine.instance.currentWorld.inputState.get(mappedInputKey)?.lifecycleState !== LifecycleValue.Unchanged) {
          Engine.instance.currentWorld.inputState.set(mappedInputKey, {
            type: InputType.BUTTON,
            value: [BinaryValue.ON],
            lifecycleState: LifecycleValue.Unchanged
          })
        }
        return
      }

      // Set type to BUTTON (up/down discrete state) and value to up or down, depending on what the value is set to
      Engine.instance.currentWorld.inputState.set(mappedInputKey, {
        type: InputType.BUTTON,
        value: [BinaryValue.ON],
        lifecycleState: LifecycleValue.Started
      })
    } else {
      Engine.instance.currentWorld.inputState.set(mappedInputKey, {
        type: InputType.BUTTON,
        value: [BinaryValue.OFF],
        lifecycleState: LifecycleValue.Ended
      })
    }
    return
  }
  if (Engine.instance.currentWorld.inputState.has(TouchInputs.Touch)) {
    Engine.instance.currentWorld.inputState.set(TouchInputs.Touch, {
      type: InputType.BUTTON,
      value: [BinaryValue.OFF],
      lifecycleState: LifecycleValue.Ended
    })
  }

  if (Engine.instance.currentWorld.inputState.has(TouchInputs.DoubleTouch)) {
    Engine.instance.currentWorld.inputState.set(TouchInputs.DoubleTouch, {
      type: InputType.BUTTON,
      value: [BinaryValue.OFF],
      lifecycleState: LifecycleValue.Ended
    })
  }

  if (Engine.instance.currentWorld.inputState.has(TouchInputs.Touch1Movement)) {
    Engine.instance.currentWorld.inputState.set(TouchInputs.Touch1Movement, {
      type: InputType.TWODIM,
      value: [0, 0],
      lifecycleState: LifecycleValue.Ended
    })
  }
}

/**
 * Called whenever the touch dpad is moved
 *
 * @param args is argument object. Events that occur due to the user interacting with a pointing device (such as a mouse).
 */

export const handleTouchDirectionalPad = (event: CustomEvent): void => {
  // TODO: move this types to types and interfaces
  const { stick, value }: { stick: GamepadAxis; value: { x: number; y: number; angleRad: number } } = event.detail
  if (!stick) {
    return
  }

  const stickPosition: [number, number, number] = [value.x, value.y, value.angleRad]

  // If position not set, set it with lifecycle started
  if (!Engine.instance.currentWorld.inputState.has(stick)) {
    Engine.instance.currentWorld.inputState.set(stick, {
      type: InputType.TWODIM,
      value: stickPosition,
      lifecycleState: LifecycleValue.Started
    })
  } else {
    // If position set, check it's value
    const oldStickPosition = Engine.instance.currentWorld.inputState.get(stick)?.value
    // If it's not the same, set it and update the lifecycle value to changed
    if (JSON.stringify(oldStickPosition) !== JSON.stringify(stickPosition)) {
      // console.log('---changed');
      // Set type to TWODIM (two-dimensional axis) and value to a normalized -1, 1 on X and Y
      Engine.instance.currentWorld.inputState.set(stick, {
        type: InputType.TWODIM,
        value: stickPosition,
        lifecycleState: LifecycleValue.Changed
      })
    } else {
      // console.log('---not changed');
      // Otherwise, remove it
      //Engine.instance.currentWorld.inputState.delete(mappedKey)
    }
  }
}

/**
 * Called when a button on mobile is pressed
 *
 * @param args is argument object
 */

export function handleTouchGamepadButton(event: CustomEvent): any {
  const value = event.type === 'touchgamepadbuttondown'
  const key = event.detail.button as GamepadButtons // this is a custom event, hence why it is our own enum type

  if (value) {
    // If the key is in the map but it's in the same state as now, let's skip it (debounce)
    if (
      Engine.instance.currentWorld.inputState.has(key) &&
      Engine.instance.currentWorld.inputState.get(key)?.value[0] === BinaryValue.ON
    ) {
      if (Engine.instance.currentWorld.inputState.get(key)?.lifecycleState !== LifecycleValue.Unchanged) {
        Engine.instance.currentWorld.inputState.set(key, {
          type: InputType.BUTTON,
          value: [BinaryValue.ON],
          lifecycleState: LifecycleValue.Unchanged
        })
      }
      return
    }
    // Set type to BUTTON (up/down discrete state) and value to up or down, depending on what the value is set to
    Engine.instance.currentWorld.inputState.set(key, {
      type: InputType.BUTTON,
      value: [BinaryValue.ON],
      lifecycleState: LifecycleValue.Started
    })
  } else {
    Engine.instance.currentWorld.inputState.set(key, {
      type: InputType.BUTTON,
      value: [BinaryValue.OFF],
      lifecycleState: LifecycleValue.Ended
    })
  }
}

/**
 * Called whenever the mouse wheel is scrolled
 *
 * @param args is argument object. Events that occur due to the user interacting with a pointing device (such as a mouse).
 */

export const handleMouseWheel = (event: WheelEvent): void => {
  if (event?.target !== EngineRenderer.instance.canvas) return

  const normalizedValues = normalizeWheel(event)
  const value = normalizedValues?.spinY + Math.random() * 0.000001

  if (!Engine.instance.currentWorld.inputState.has(MouseInput.MouseScroll)) {
    Engine.instance.currentWorld.inputState.set(MouseInput.MouseScroll, {
      type: InputType.ONEDIM,
      value: [Math.sign(value)],
      lifecycleState: LifecycleValue.Started
    })
  } else {
    const oldValue = Engine.instance.currentWorld.inputState.get(MouseInput.MouseScroll)?.value[0] as number
    const newValue = oldValue === value ? value : oldValue + Math.sign(value)
    Engine.instance.currentWorld.inputState.set(MouseInput.MouseScroll, {
      type: InputType.ONEDIM,
      value: [newValue],
      lifecycleState: LifecycleValue.Changed
    })
  }
}

/**
 * Normalize mouse movement and set the range of coordinates between 0 to 2.
 * @param x
 * @param y
 * @param elementWidth
 * @param elementHeight
 * @returns Normalized Mouse movement (x, y) where x and y are between 0 to 2 inclusively.
 */
function normalizeMouseMovement(x: number, y: number, elementWidth: number, elementHeight: number) {
  return [x / (elementWidth / 2), -y / (elementHeight / 2)]
}

/**
 * Called whenever the mouse is moved
 *
 * @param args is argument object. Events that occur due to the user interacting with a pointing device (such as a mouse).
 */

let callback

export const handleMouseMovement = (event: MouseEvent): void => {
  if (callback) {
    clearTimeout(callback)
    callback = null
  }

  const normalizedPosition = normalizeMouseCoordinates(
    event.clientX,
    event.clientY,
    window.innerWidth,
    window.innerHeight
  )
  const mousePosition: [number, number] = [normalizedPosition.x, normalizedPosition.y]
  const lastMousePosition =
    Engine.instance.currentWorld.inputState.get(MouseInput.MousePosition)?.value! ?? mousePosition

  Engine.instance.currentWorld.inputState.set(MouseInput.MousePosition, {
    type: InputType.TWODIM,
    value: mousePosition,
    lifecycleState: Engine.instance.currentWorld.inputState.has(MouseInput.MousePosition)
      ? LifecycleValue.Changed
      : LifecycleValue.Started
  })

  const mouseMovement = [mousePosition[0] - lastMousePosition[0], mousePosition[1] - lastMousePosition[1]]

  Engine.instance.currentWorld.inputState.set(MouseInput.MouseMovement, {
    type: InputType.TWODIM,
    value: mouseMovement,
    lifecycleState: Engine.instance.currentWorld.inputState.has(MouseInput.MouseMovement)
      ? LifecycleValue.Changed
      : LifecycleValue.Started
  })

  const isDragging = Engine.instance.currentWorld.inputState.get(MouseInput.MouseClickDownPosition)

  if (isDragging && isDragging?.lifecycleState !== LifecycleValue.Ended) {
    callback = setTimeout(() => {
      Engine.instance.currentWorld.inputState.set(MouseInput.MouseClickDownMovement, {
        type: InputType.TWODIM,
        value: [0, 0],
        lifecycleState: Engine.instance.currentWorld.inputState.has(MouseInput.MouseClickDownMovement)
          ? LifecycleValue.Changed
          : LifecycleValue.Started
      })
    }, 50)
    Engine.instance.currentWorld.inputState.set(MouseInput.MouseClickDownMovement, {
      type: InputType.TWODIM,
      value: mouseMovement,
      lifecycleState: Engine.instance.currentWorld.inputState.has(MouseInput.MouseClickDownMovement)
        ? LifecycleValue.Changed
        : LifecycleValue.Started
    })
  }
}

/**
 * Called when a mouse button is pressed
 *
 * @param args is argument object with event and value properties. Value set 0 | 1
 */

export const handleMouseButton = (event: MouseEvent): void => {
  const mousedown = event.type === 'mousedown'

  const mousePosition: [number, number] = [0, 0]
  mousePosition[0] = (event.clientX / window.innerWidth) * 2 - 1
  mousePosition[1] = (event.clientY / window.innerHeight) * -2 + 1

  let button = MouseInput.LeftButton
  switch (event.button) {
    case 1:
      button = MouseInput.MiddleButton
    case 2:
      button = MouseInput.RightButton
  }

  // Set type to BUTTON (up/down discrete state) and value to up or down, as called by the DOM mouse events
  if (mousedown) {
    // Set type to BUTTON and value to up or down
    Engine.instance.currentWorld.inputState.set(button, {
      type: InputType.BUTTON,
      value: [BinaryValue.ON],
      lifecycleState: LifecycleValue.Started
    })

    // TODO: this would not be set if none of buttons assigned
    // Set type to TWOD (two dimensional) and value with x: -1, 1 and y: -1, 1
    Engine.instance.currentWorld.inputState.set(MouseInput.MouseClickDownPosition, {
      type: InputType.TWODIM,
      value: mousePosition,
      lifecycleState: LifecycleValue.Started
    })
  } else {
    // Removed mouse Engine.instance.currentWorld.inputState data
    Engine.instance.currentWorld.inputState.set(button, {
      type: InputType.BUTTON,
      value: [BinaryValue.OFF],
      lifecycleState: LifecycleValue.Ended
    })
    Engine.instance.currentWorld.inputState.set(MouseInput.MouseClickDownPosition, {
      type: InputType.TWODIM,
      value: mousePosition,
      lifecycleState: LifecycleValue.Ended
    })
    Engine.instance.currentWorld.inputState.set(MouseInput.MouseClickDownTransformRotation, {
      type: InputType.TWODIM,
      value: mousePosition,
      lifecycleState: LifecycleValue.Ended
    })
    Engine.instance.currentWorld.inputState.set(MouseInput.MouseClickDownMovement, {
      type: InputType.TWODIM,
      value: [0, 0],
      lifecycleState: LifecycleValue.Ended
    })
  }
}

/**
 * Clled when a keyboard key is pressed
 *
 * @param args is argument object
 */

export const handleKey = (event: KeyboardEvent): any => {
  const keydown = event.type === 'keydown'

  const element = event.target as HTMLElement
  // Сheck which excludes the possibility of controlling the avatar (car, etc.) when typing a text
  if (element?.tagName === 'INPUT' || element?.tagName === 'SELECT' || element?.tagName === 'TEXTAREA') {
    return
  }
  // const mappedKey = Engine.instance.currentWorld.inputState.schema.keyboardInputMap[];
  const key = event.code

  if (keydown) {
    // If the key is in the map but it's in the same state as now, let's skip it (debounce)
    if (
      Engine.instance.currentWorld.inputState.has(key) &&
      Engine.instance.currentWorld.inputState.get(key)?.value[0] === BinaryValue.ON
    ) {
      if (Engine.instance.currentWorld.inputState.get(key)?.lifecycleState !== LifecycleValue.Unchanged) {
        Engine.instance.currentWorld.inputState.set(key, {
          type: InputType.BUTTON,
          value: [BinaryValue.ON],
          lifecycleState: LifecycleValue.Unchanged
        })
      }
      return
    }
    // Set type to BUTTON (up/down discrete state) and value to up or down, depending on what the value is set to
    Engine.instance.currentWorld.inputState.set(key, {
      type: InputType.BUTTON,
      value: [BinaryValue.ON],
      lifecycleState: LifecycleValue.Started
    })
  } else {
    Engine.instance.currentWorld.inputState.set(key, {
      type: InputType.BUTTON,
      value: [BinaryValue.OFF],
      lifecycleState: LifecycleValue.Ended
    })
  }
}

export const handleWindowFocus = (event: FocusEvent) => {
  Engine.instance.currentWorld.inputState.forEach((value, key) => {
    if (value.type === InputType.BUTTON && value.value[0] === BinaryValue.ON) {
      Engine.instance.currentWorld.inputState.set(key, {
        type: InputType.BUTTON,
        value: [BinaryValue.OFF],
        lifecycleState: LifecycleValue.Ended
      })
    }
  })
}

export const handleVisibilityChange = (event: Event) => {
  if (document.visibilityState === 'hidden') {
    Engine.instance.currentWorld.inputState.forEach((value, key) => {
      if (value.type === InputType.BUTTON && value.value[0] === BinaryValue.ON) {
        Engine.instance.currentWorld.inputState.set(key, {
          type: InputType.BUTTON,
          value: [BinaryValue.OFF],
          lifecycleState: LifecycleValue.Ended
        })
      }
    })
  }
}

/**
 * Called when context menu is opened
 *
 * @param args is argument object. Events that occur due to the user interacting with a pointing device (such as a mouse).
 */

export const handleContextMenu = (event: MouseEvent): void => {
  event.preventDefault()
}

/**
 * Called when the mouse leaves
 *
 * @param args is argument object. Events that occur due to the user interacting with a pointing device (such as a mouse).
 */

export const handleMouseLeave = (event: MouseEvent): void => {
  ;[MouseInput.LeftButton, MouseInput.MiddleButton, MouseInput.RightButton].forEach((button) => {
    if (!Engine.instance.currentWorld.inputState.has(button)) {
      return
    }
    Engine.instance.currentWorld.inputState.set(button, {
      type: InputType.BUTTON,
      value: [BinaryValue.OFF],
      lifecycleState: LifecycleValue.Ended
    })
  })

  if (Engine.instance.currentWorld.inputState.has(MouseInput.MouseClickDownPosition)) {
    const value = Engine.instance.currentWorld.inputState.get(MouseInput.MouseClickDownPosition)?.value as number[]
    if (value[0] !== 0 || value[1] !== 0) {
      Engine.instance.currentWorld.inputState.set(MouseInput.MouseClickDownPosition, {
        type: InputType.TWODIM,
        value: [0, 0],
        lifecycleState: LifecycleValue.Ended
      })
    }
  }

  if (Engine.instance.currentWorld.inputState.has(MouseInput.MouseClickDownTransformRotation)) {
    const value = Engine.instance.currentWorld.inputState.get(MouseInput.MouseClickDownTransformRotation)
      ?.value as number[]
    if (value[0] !== 0 || value[1] !== 0) {
      Engine.instance.currentWorld.inputState.set(MouseInput.MouseClickDownTransformRotation, {
        type: InputType.TWODIM,
        value: [0, 0],
        lifecycleState: LifecycleValue.Ended
      })
    }
  }
}

/**
 * Normalize coordinates and set the range of coordinates between -1 to 1.
 * @param x
 * @param y
 * @param elementWidth
 * @param elementHeight
 * @returns Normalized Mouse coordinates (x, y) where x and y are between -1 to 1 inclusively.
 */
export function normalizeMouseCoordinates(
  x: number,
  y: number,
  elementWidth: number,
  elementHeight: number
): { x: number; y: number } {
  return {
    x: (x / elementWidth) * 2 - 1,
    y: (y / elementHeight) * -2 + 1
  }
}
