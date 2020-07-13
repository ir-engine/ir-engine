import { Entity } from "ecsy"
import Input from "../../input/components/Input"
import BinaryValue from "../../common/enums/BinaryValue"
import InputAlias from "../../input/types/InputAlias"
import { applyThreshold } from "../../common/utils/applyThreshold"
import Behavior from "../../common/interfaces/Behavior"
import { InputType } from "../../input/enums/InputType"

const inputPerGamepad = 2
let input: Input
let gamepads: Gamepad[]
let input0: number
let input1: number
let gamepad: Gamepad
let inputBase: number
let x: number
let y: number
let prevLeftX: number
let prevLeftY: number

export const handleGamepads: Behavior = (entityIn: Entity) => {
  if (!input.map || !input.map.gamepadInputMap || !input.gamepadConnected) return
  input = entityIn.getComponent(Input)
  gamepads = navigator.getGamepads()

  for (let index = 0; index < gamepads.length; index++) {
    if (!gamepads[index]) return
    gamepad = gamepads[index]

    if (gamepad.axes) {
      input0 = inputPerGamepad * index
      input1 = inputPerGamepad * index + 1

      // GamePad 0 LStick XY
      if (input.map.eventBindings.input[input0] && gamepad.axes.length >= inputPerGamepad)
        handleGamepadInput(entityIn, { gamepad: gamepad, inputIndex: 0, mappedInputValue: input.map.gamepadInputMap.input[input0] })

      // GamePad 1 LStick XY
      if (input.map.gamepadInputMap.input[input1] && gamepad.axes.length >= inputPerGamepad * 2)
        handleGamepadInput(entityIn, { gamepad, inputIndex: 1, mappedInputValue: input.map.gamepadInputMap.input[input1] })
    }

    if (!gamepad.buttons || !input.map.gamepadInputMap.input) return
    input = entityIn.getMutableComponent(Input)

    for (let index = 0; index < gamepad.buttons.length; index++) {
      if (
        typeof input.map.gamepadInputMap.input[index] === "undefined" ||
        gamepad.buttons[index].touched === (input.gamepadButtons[index] === BinaryValue.ON)
      )
        continue
      input.data.set(input.map.gamepadInputMap.input[index], {
        type: InputType.BUTTON,
        value: gamepad.buttons[index].touched ? BinaryValue.ON : BinaryValue.OFF
      })
      input.gamepadButtons[index] = gamepad.buttons[index].touched ? BinaryValue.ON : BinaryValue.OFF
    }
  }
}

export const handleGamepadInput: Behavior = (entityIn: Entity, args: { gamepad: Gamepad; inputIndex: number; mappedInputValue: InputAlias }) => {
  input = entityIn.getComponent(Input)

  inputBase = args.inputIndex * 2

  x = applyThreshold(gamepad.axes[inputBase], input.gamepadThreshold)
  y = applyThreshold(gamepad.axes[inputBase + 1], input.gamepadThreshold)
  prevLeftX = input.gamepadInput[inputBase]
  prevLeftY = input.gamepadInput[inputBase + 1]

  if (x !== prevLeftX || y !== prevLeftY) {
    entityIn.getComponent(Input).data.set(args.mappedInputValue, {
      type: InputType.TWOD,
      value: [x, y]
    })

    input.gamepadInput[inputBase] = x
    input.gamepadInput[inputBase + 1] = y
  }
}

export const handleGamepadConnected: Behavior = (entityIn: Entity, args: { event: any }): void => {
  input = entityIn.getMutableComponent(Input)

  console.log("A gamepad connected:", args.event.gamepad, args.event.gamepad.mapping)

  if (args.event.gamepad.mapping !== "standard") return console.error("Non-standard gamepad mapping detected, not properly handled")

  input.gamepadConnected = true
  gamepad = args.event.gamepad

  for (let index = 0; index < gamepad.buttons.length; index++) {
    if (typeof input.gamepadButtons[index] === "undefined") input.gamepadButtons[index] = BinaryValue.OFF
  }
}

export const handleGamepadDisconnected: Behavior = (entityIn: Entity, args: { event: any }): void => {
  input = entityIn.getMutableComponent(Input)
  console.log("A gamepad disconnected:", args.event.gamepad)

  input.gamepadConnected = false

  if (!input.map) return // Already disconnected?

  for (let index = 0; index < input.gamepadButtons.length; index++) {
    if (input.gamepadButtons[index] === BinaryValue.ON && typeof input.map.gamepadInputMap.input[index] !== "undefined") {
      input.data.set(input.map.gamepadInputMap.input[index], {
        type: InputType.BUTTON,
        value: BinaryValue.OFF
      })
    }
    input.gamepadButtons[index] = BinaryValue.OFF
  }
}
