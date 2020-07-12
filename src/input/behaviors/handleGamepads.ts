import { Entity } from "ecsy"
import Axis from "../../axis/components/Axis"
import Binary from "../../common/enums/Binary"
import AxisAlias from "../../axis/types/AxisAlias"
import { applyThreshold } from "../../common/utils/applyThreshold"
import InputMap from "../interfaces/InputMap"
import Input from "../components/Input"
import Behavior from "../../common/interfaces/Behavior"
import { AxisType } from "../../axis/enums/AxisType"

let input: Input
let axis: Axis
let inputMap: InputMap
let gamepads: Gamepad[]
const axisPerGamepad = 2
let axis0: number
let axis1: number
let gamepad: Gamepad
let axisBase: number
let x: number
let y: number
let prevLeftX: number
let prevLeftY: number

export const handleGamepads: Behavior = (entityIn: Entity) => {
  if (!inputMap || !inputMap.gamepadAxisMap || !input.gamepadConnected) return
  input = entityIn.getComponent(Input)
  gamepads = navigator.getGamepads()

  for (let index = 0; index < gamepads.length; index++) {
    if (!gamepads[index]) return
    gamepad = gamepads[index]

    if (gamepad.axes) {
      axis0 = axisPerGamepad * index
      axis1 = axisPerGamepad * index + 1

      // GamePad 0 LStick XY
      if (inputMap.eventBindings.axes[axis0] && gamepad.axes.length >= axisPerGamepad)
        handleGamepadInput(entityIn, { gamepad: gamepad, axisIndex: 0, mappedAxisValue: inputMap.gamepadAxisMap.axes[axis0] })

      // GamePad 1 LStick XY
      if (inputMap.gamepadAxisMap.axes[axis1] && gamepad.axes.length >= axisPerGamepad * 2)
        handleGamepadInput(entityIn, { gamepad, axisIndex: 1, mappedAxisValue: inputMap.gamepadAxisMap.axes[axis1] })
    }

    if (!gamepad.buttons || !inputMap.gamepadAxisMap.axes) return
    axis = entityIn.getMutableComponent(Axis)

    for (let index = 0; index < gamepad.buttons.length; index++) {
      if (typeof inputMap.gamepadAxisMap.axes[index] === "undefined" || gamepad.buttons[index].touched === input.gamepadButtons[index]) continue
      axis.data.set(inputMap.gamepadAxisMap.axes[index], {
        type: AxisType.BUTTON,
        value: gamepad.buttons[index].touched ? Binary.ON : Binary.OFF
      })
      input.gamepadButtons[index] = gamepad.buttons[index].touched
    }
  }
}

export const handleGamepadInput: Behavior = (entityIn: Entity, args: { gamepad: Gamepad; axisIndex: number; mappedAxisValue: AxisAlias }) => {
  input = entityIn.getComponent(Input)

  axisBase = args.axisIndex * 2

  x = applyThreshold(gamepad.axes[axisBase], input.gamepadThreshold)
  y = applyThreshold(gamepad.axes[axisBase + 1], input.gamepadThreshold)
  prevLeftX = input.gamepadAxes[axisBase]
  prevLeftY = input.gamepadAxes[axisBase + 1]

  if (x !== prevLeftX || y !== prevLeftY) {
    entityIn.getComponent(Axis).data.set(args.mappedAxisValue, {
      type: AxisType.TWOD,
      value: [x, y]
    })

    input.gamepadAxes[axisBase] = x
    input.gamepadAxes[axisBase + 1] = y
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
  axis = entityIn.getMutableComponent(Axis)
  inputMap = input.inputMap
  console.log("A gamepad disconnected:", args.event.gamepad)

  input.gamepadConnected = false

  if (!inputMap) return

  for (let index = 0; index < input.gamepadButtons.length; index++) {
    if (input.gamepadButtons[index] === true && typeof inputMap.gamepadAxisMap.axes[index] !== "undefined") {
      axis.data.set(inputMap.gamepadAxisMap.axes[index], {
        type: AxisType.BUTTON,
        value: Binary.OFF
      })
    }
    input.gamepadButtons[index] = false
  }
}
