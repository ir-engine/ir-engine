import { BinaryValue } from '../../common/enums/BinaryValue'
import { applyThreshold } from '../../common/functions/applyThreshold'
import { InputType } from '../enums/InputType'
import { GamepadButtons, GamepadAxis, XRAxes } from '../enums/InputEnums'
import { InputAlias } from '../types/InputAlias'
import { BaseInput } from '../enums/BaseInput'
import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { useEngine } from '../../ecs/classes/Engine'

/**
 * @property {Boolean} gamepadConnected Connection a new gamepad
 * @property {Number} gamepadThreshold Threshold value from 0 to 1
 * @property {Binary[]} gamepadButtons Map gamepad buttons
 * @property {Number[]} gamepadInput Map gamepad buttons to abstract input
 */

let gamepadConnected = false
const gamepadThreshold = 0.1
const gamepadButtons: BinaryValue[] = []
const gamepadInput: number[] = []

const inputPerGamepad = 2
let gamepads: Gamepad[]
let gamepad: Gamepad
let inputBase: number
let x: number
let y: number
let prevLeftX: number
let prevLeftY: number

let _index: number // temp var for iterator loops
/**
 * System behavior to handle gamepad input
 *
 * @param {Entity} entity The entity
 */
export const handleGamepads = () => {
  // Get an immutable reference to input
  if (!gamepadConnected) return
  // Get gamepads from the DOM
  gamepads = navigator.getGamepads() as Gamepad[]

  // Loop over connected gamepads
  for (_index = 0; _index < gamepads.length; _index++) {
    // If there's no gamepad at this index, skip
    if (!gamepads[_index]) return
    // Hold reference to this gamepad
    gamepad = gamepads[_index]

    // If the gamepad has analog inputs (dpads that aren't up UP/DOWN/L/R but have -1 to 1 values for X and Y)
    if (gamepad.axes) {
      // GamePad 0 Left Stick XY
      if (gamepad.axes.length >= inputPerGamepad) {
        handleGamepadAxis(gamepad, 0, GamepadAxis.Left)
      }

      // GamePad 1 Right Stick XY
      if (gamepad.axes.length >= inputPerGamepad * 2) {
        handleGamepadAxis(gamepad, 1, GamepadAxis.Right)
      }
    }

    // If the gamepad doesn't have buttons, or the input isn't mapped, return
    if (!gamepad.buttons) return

    // Otherwise, loop through gamepad buttons
    for (_index = 0; _index < gamepad.buttons.length; _index++) {
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
const handleGamepadButton = (gamepad: Gamepad, index: number) => {
  if (gamepad.buttons[index].touched === (gamepadButtons[index] === BinaryValue.ON)) return
  // Set input data
  useEngine().inputState.set(gamepadMapping[gamepad.mapping || 'standard'][index], {
    type: InputType.BUTTON,
    value: [gamepad.buttons[index].touched ? BinaryValue.ON : BinaryValue.OFF],
    lifecycleState: gamepad.buttons[index].touched ? LifecycleValue.Started : LifecycleValue.Ended
  })
  gamepadButtons[index] = gamepad.buttons[index].touched ? 1 : 0
}

/**
 * Gamepad axios
 *
 * @param {Entity} entity The entity
 * @param args is argument object
 */
export const handleGamepadAxis = (gamepad: Gamepad, inputIndex: number, mappedInputValue: InputAlias) => {
  inputBase = inputIndex * 2
  const xIndex = inputBase
  const yIndex = inputBase + 1

  x = applyThreshold(gamepad.axes[xIndex], gamepadThreshold)
  y = applyThreshold(gamepad.axes[yIndex], gamepadThreshold)
  if (mappedInputValue === BaseInput.MOVEMENT_PLAYERONE) {
    const tmpX = x
    x = -y
    y = -tmpX
  }

  prevLeftX = gamepadInput[xIndex]
  prevLeftY = gamepadInput[yIndex]

  // Axis has changed, so get mutable reference to Input and set data
  if (x !== prevLeftX || y !== prevLeftY) {
    useEngine().inputState.set(mappedInputValue, {
      type: InputType.TWODIM,
      value: [x, y],
      lifecycleState: LifecycleValue.Changed
    })

    gamepadInput[xIndex] = x
    gamepadInput[yIndex] = y
  }
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
  gamepad = event.gamepad

  for (let index = 0; index < gamepad.buttons.length; index++) {
    if (typeof gamepadButtons[index] === 'undefined') gamepadButtons[index] = 0
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

  if (!gamepadButtons) return // Already disconnected?

  for (let index = 0; index < gamepadButtons.length; index++) {
    if (gamepadButtons[index] === BinaryValue.ON) {
      useEngine().inputState.set(gamepadMapping[event.gamepad.mapping || 'standard'][index], {
        type: InputType.BUTTON,
        value: [BinaryValue.OFF],
        lifecycleState: LifecycleValue.Changed
      })
    }
    gamepadButtons[index] = 0
  }
}

export const gamepadMapping = {
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
      buttons: {
        0: GamepadButtons.LTrigger,
        1: GamepadButtons.LBumper,
        2: GamepadButtons.LPad,
        3: GamepadButtons.LStick,
        4: GamepadButtons.X,
        5: GamepadButtons.Y
      },
      axes: XRAxes.Left
    },
    right: {
      buttons: {
        0: GamepadButtons.RTrigger,
        1: GamepadButtons.RBumper,
        2: GamepadButtons.RPad,
        3: GamepadButtons.RStick,
        4: GamepadButtons.A,
        5: GamepadButtons.B
      },
      axes: XRAxes.Right
    }
  }
}
