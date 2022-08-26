import { BinaryValue } from '../../common/enums/BinaryValue'
import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { applyThreshold } from '../../common/functions/applyThreshold'
import { Engine } from '../../ecs/classes/Engine'
import { GamepadAxis, GamepadButtons } from '../enums/InputEnums'
import { InputType } from '../enums/InputType'
import { InputAlias } from '../types/InputAlias'

const axesSize = 2
const gamepadThreshold = 0.1
const gamepadMultiplier = 0.01

let gamepadConnected = false
const lastButtonInput: BinaryValue[] = []
const lastAxisInput: number[] = []

/**
 * System behavior to handle gamepad input
 *
 * @param {Entity} entity The entity
 */
export const handleGamepads = () => {
  // Get an immutable reference to input
  if (!gamepadConnected) return

  // Get gamepads from the DOM
  const gamepads = navigator.getGamepads() as Gamepad[]

  // Loop over connected gamepads
  for (const gamepad of gamepads) {
    // If the gamepad has analog inputs (dpads that aren't up UP/DOWN/L/R but have -1 to 1 values for X and Y)
    if (gamepad.axes) {
      // GamePad 0 Left Stick XY
      if (gamepad.axes.length >= axesSize) {
        handleGamepadAxis(gamepad, 0, GamepadAxis.LThumbstick)
      }

      // GamePad 1 Right Stick XY
      if (gamepad.axes.length >= axesSize * 2) {
        handleGamepadAxis(gamepad, 1, GamepadAxis.RThumbstick)
      }
    }

    // If the gamepad doesn't have buttons, or the input isn't mapped, return
    if (!gamepad.buttons) return

    // Otherwise, loop through gamepad buttons
    for (let _index = 0; _index < gamepad.buttons.length; _index++) {
      handleGamepadButton(gamepad, _index)
    }
  }
}

/**
 * Gamepad button
 *
 * @param {Entity} entity The entity
 * @param args is argument object
 */
export const handleGamepadButton = (gamepad: Gamepad, index: number) => {
  if (gamepad.buttons[index].touched === (lastButtonInput[index] === BinaryValue.ON)) return
  // Set input data
  Engine.instance.currentWorld.inputState.set(GamepadMapping[gamepad.mapping || 'standard'][index], {
    type: InputType.BUTTON,
    value: [gamepad.buttons[index].touched ? BinaryValue.ON : BinaryValue.OFF],
    lifecycleState: gamepad.buttons[index].touched ? LifecycleValue.Started : LifecycleValue.Ended
  })
  lastButtonInput[index] = gamepad.buttons[index].touched ? 1 : 0
}

/**
 * Gamepad axis
 *
 */
export const handleGamepadAxis = (gamepad: Gamepad, inputIndex: number, mappedInputValue: InputAlias) => {
  const inputBase = inputIndex * 2
  const xIndex = inputBase
  const yIndex = inputBase + 1

  let x = applyThreshold(gamepad.axes[xIndex], gamepadThreshold)
  let y = -applyThreshold(gamepad.axes[yIndex], gamepadThreshold)

  // TODO: why are we modifying these input values here? this seems like the wrong place
  if (mappedInputValue === GamepadAxis.LThumbstick) {
    const tmpX = x
    x = y
    y = -tmpX
  } else {
    x *= gamepadMultiplier
    y *= gamepadMultiplier
  }

  // Axis has changed, so get mutable reference to Input and set data
  if (x !== lastAxisInput[xIndex] || y !== lastAxisInput[yIndex]) {
    Engine.instance.currentWorld.inputState.set(mappedInputValue, {
      type: InputType.TWODIM,
      value: [x, y],
      lifecycleState: LifecycleValue.Changed
    })
  }

  if (x === 0 && lastAxisInput[xIndex] !== 0 && y === 0 && lastAxisInput[yIndex] !== 0) {
    Engine.instance.currentWorld.inputState.set(mappedInputValue, {
      type: InputType.TWODIM,
      value: [0, 0],
      lifecycleState: LifecycleValue.Ended
    })
  }

  lastAxisInput[xIndex] = x
  lastAxisInput[yIndex] = y
}

/**
 * When a gamepad connects
 *
 * @param {Entity} entity The entity
 * @param args is argument object
 */
export const handleGamepadConnected = (event: any): void => {
  console.log('A gamepad connected:', event.gamepad, event.gamepad.mapping)

  if (event.gamepad.mapping !== 'standard') {
    console.error('Non-standard gamepad mapping detected, it could be handled not properly.')
  }

  gamepadConnected = true
  const gamepad = event.gamepad

  for (let index = 0; index < gamepad.buttons.length; index++) {
    if (typeof lastButtonInput[index] === 'undefined') lastButtonInput[index] = 0
  }
}

/**
 * When a gamepad disconnects
 *
 * @param {Entity} entity The entity
 * @param args is argument object
 */
export const handleGamepadDisconnected = (event: any): void => {
  // Get immutable reference to Input and check if the button is defined -- ignore undefined buttons
  console.log('A gamepad disconnected:', event.gamepad)

  gamepadConnected = false

  if (!lastButtonInput) return // Already disconnected?

  for (let index = 0; index < lastButtonInput.length; index++) {
    if (lastButtonInput[index] === BinaryValue.ON) {
      Engine.instance.currentWorld.inputState.set(GamepadMapping[event.gamepad.mapping || 'standard'][index], {
        type: InputType.BUTTON,
        value: [BinaryValue.OFF],
        lifecycleState: LifecycleValue.Changed
      })
    }
    lastButtonInput[index] = 0
  }
}

export const GamepadMapping = {
  //https://w3c.github.io/gamepad/#remapping
  standard: {
    0: GamepadButtons.A,
    1: GamepadButtons.B,
    2: GamepadButtons.X,
    3: GamepadButtons.Y,
    4: GamepadButtons.LBumper,
    5: GamepadButtons.RBumper,
    6: GamepadButtons.LTrigger,
    7: GamepadButtons.RTrigger,
    8: GamepadButtons.Back,
    9: GamepadButtons.Start,
    10: GamepadButtons.LStick,
    11: GamepadButtons.RStick,
    12: GamepadButtons.DPad1,
    13: GamepadButtons.DPad2,
    14: GamepadButtons.DPad3,
    15: GamepadButtons.DPad4
  },
  //https://www.w3.org/TR/webxr-gamepads-module-1/
  'xr-standard': {
    left: {
      0: GamepadButtons.LTrigger,
      1: GamepadButtons.LBumper,
      2: GamepadButtons.LPad,
      3: GamepadButtons.LStick,
      4: GamepadButtons.X,
      5: GamepadButtons.Y
    },
    right: {
      0: GamepadButtons.RTrigger,
      1: GamepadButtons.RBumper,
      2: GamepadButtons.RPad,
      3: GamepadButtons.RStick,
      4: GamepadButtons.A,
      5: GamepadButtons.B
    },
    none: {
      0: GamepadButtons.RTrigger,
      1: GamepadButtons.RBumper,
      2: GamepadButtons.RPad,
      3: GamepadButtons.RStick,
      4: GamepadButtons.A,
      5: GamepadButtons.B
    }
  }
}
