import { Entity } from "ecsy"
import Input from "../../input/components/Input"
import BinaryValue from "../../common/enums/BinaryValue"
import InputAlias from "../../input/types/InputAlias"
import { applyThreshold } from "../../common/utils/applyThreshold"
import InputMap from "../interfaces/InputMap"
import Input from "../components/Input"
import Behavior from "../../common/interfaces/Behavior"
import { InputType } from "../../input/enums/InputType"

const inputPerGamepad = 2
let input: Input
let input: Input
let inputMap: InputMap
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
  if (!inputMap || !inputMap.gamepadInputMap || !input.gamepadConnected) return
  input = entityIn.getComponent(Input)
  gamepads = navigator.getGamepads()

  for (let index = 0; index < gamepads.length; index++) {
    if (!gamepads[index]) return
    gamepad = gamepads[index]

    if (gamepad.input) {
      input0 = inputPerGamepad * index
      input1 = inputPerGamepad * index + 1

      // GamePad 0 LStick XY
      if (inputMap.eventBindings.input[input0] && gamepad.input.length >= inputPerGamepad)
        handleGamepadInput(entityIn, { gamepad: gamepad, inputIndex: 0, mappedInputValue: inputMap.gamepadInputMap.input[input0] })

      // GamePad 1 LStick XY
      if (inputMap.gamepadInputMap.input[input1] && gamepad.input.length >= inputPerGamepad * 2)
        handleGamepadInput(entityIn, { gamepad, inputIndex: 1, mappedInputValue: inputMap.gamepadInputMap.input[input1] })
    }

    if (!gamepad.buttons || !inputMap.gamepadInputMap.input) return
    input = entityIn.getMutableComponent(Input)

    for (let index = 0; index < gamepad.buttons.length; index++) {
      if (typeof inputMap.gamepadInputMap.input[index] === "undefined" || gamepad.buttons[index].touched === input.gamepadButtons[index]) continue
      input.data.set(inputMap.gamepadInputMap.input[index], {
        type: InputType.BUTTON,
        value: gamepad.buttons[index].touched ? BinaryValue.ON : BinaryValue.OFF
      })
      input.gamepadButtons[index] = gamepad.buttons[index].touched
    }
  }
}

export const handleGamepadInput: Behavior = (entityIn: Entity, args: { gamepad: Gamepad; inputIndex: number; mappedInputValue: InputAlias }) => {
  input = entityIn.getComponent(Input)

  inputBase = args.inputIndex * 2

  x = applyThreshold(gamepad.input[inputBase], input.gamepadThreshold)
  y = applyThreshold(gamepad.input[inputBase + 1], input.gamepadThreshold)
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
    if (typeof input.gamepadButtons[index] === "undefined") input.gamepadButtons[index] = false
  }
}

export const handleGamepadDisconnected: Behavior = (entityIn: Entity, args: { event: any }): void => {
  input = entityIn.getMutableComponent(Input)
  input = entityIn.getMutableComponent(Input)
  inputMap = input.inputMap
  console.log("A gamepad disconnected:", args.event.gamepad)

  input.gamepadConnected = false

  if (!inputMap) return

  for (let index = 0; index < input.gamepadButtons.length; index++) {
    if (input.gamepadButtons[index] === true && typeof inputMap.gamepadInputMap.input[index] !== "undefined") {
      input.data.set(inputMap.gamepadInputMap.input[index], {
        type: InputType.BUTTON,
        value: BinaryValue.OFF
      })
    }
    input.gamepadButtons[index] = false
  }
}
