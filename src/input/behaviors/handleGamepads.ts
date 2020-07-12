import { Entity } from "ecsy"
import GamepadInput from "../components/GamepadInput"
import Axis from "../../axis/components/Axis"
import UserInput from "../components/Input"
import Binary from "../../common/enums/Binary"
import AxisAlias from "../../axis/types/AxisAlias"
import { applyThreshold } from "../../common/utils/applyThreshold"
import InputData from "../interfaces/InputData"

let gamepadInput: GamepadInput
let inputMap: InputData
let gamepads: Gamepad[]
const axisPerGamepad = 2

export function handleGamepads(entityIn: Entity) {
  gamepadInput = entityIn.getMutableComponent(GamepadInput)
  if (gamepadInput.connected) {
    inputMap = entityIn.getComponent(UserInput).inputMap
    if (!inputMap) {
      // no need to process if gamepad is not mapped
      console.error("No gamepad input map")
      return
    }

    gamepads = navigator.getGamepads()

    for (let index = 0; index < gamepads.length; index++) {
      const gamepad = gamepads[index]
      if (!gamepad) {
        return
      }

      if (gamepad.axes) {
        const axis0 = axisPerGamepad * index
        const axis1 = axisPerGamepad * index + 1

        // GamePad 0 LStick XY
        if (inputMap.gamepad.axes[axis0] && gamepad.axes.length >= 2) {
          handleGamepadInput(entityIn, gamepad, 0, inputMap.gamepad.axes[axis0])
        }

        // GamePad 1 LStick XY
        if (inputMap.gamepad.axes[axis1] && gamepad.axes.length >= 4) {
          handleGamepadInput(entityIn, gamepad, 1, inputMap.gamepad.axes[axis1])
        }
      }

      if (gamepad.buttons && inputMap.gamepad.axes) {
        const actionHandler = entityIn.getMutableComponent(Axis)

        for (let index = 0; index < gamepad.buttons.length; index++) {
          if (typeof inputMap.gamepad.axes[index] === "undefined") {
            continue
          }
          if (gamepad.buttons[index].touched !== gamepadInput.buttons[index]) {
            actionHandler.values.add({
              axis: inputMap.gamepad.axes[index],
              value: gamepad.buttons[index].touched ? Binary.ON : Binary.OFF
            })
            gamepadInput.buttons[index] = gamepad.buttons[index].touched
          }
        }
      }
    }
  }
}

function handleGamepadInput(entity: Entity, gamepad: Gamepad, axisIndex: number, mappedAxisValue: AxisAlias) {
  const gamepadInput = entity.getMutableComponent(GamepadInput)
  const axisBase = axisIndex * 2

  const x = applyThreshold(gamepad.axes[axisBase], gamepadInput.threshold)
  const y = applyThreshold(gamepad.axes[axisBase + 1], gamepadInput.threshold)
  const prevLeftX = gamepadInput.axes[axisBase]
  const prevLeftY = gamepadInput.axes[axisBase + 1]

  if (x !== prevLeftX || y !== prevLeftY) {
    entity.getComponent(Axis).values.add({
      axis: mappedAxisValue,
      value: [x, y]
    })

    gamepadInput.axes[axisBase] = x
    gamepadInput.axes[axisBase + 1] = y
  }
}
