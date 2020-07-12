import { Entity } from "ecsy"
import GamepadInput from "../components/GamepadInput"
import UserInput from "../components/Input"
import Binary from "../../common/enums/Binary"
import Axis from "../../axis/components/Axis"
import InputData from "../interfaces/InputData"

let gamepadInput
let axis: Axis
let inputMap: InputData

export const handleGamepadDisconnected: Behavior = (entityIn: Entity, event: any): void => {
  gamepadInput = entityIn.getMutableComponent(GamepadInput)
  axis = entityIn.getMutableComponent(Axis)
  inputMap = entityIn.getComponent(UserInput).inputMap
  console.log("A gamepad disconnected:", event.gamepad)
  gamepadInput.connected = false
  // trigger buttons release
  if (!inputMap) {
    return
  }
  for (let index = 0; index < gamepadInput.buttons.length; index++) {
    if (gamepadInput.buttons[index] === true && typeof inputMap.gamepad.axes[index] !== "undefined") {
      axis.values.add({
        axis: inputMap.gamepad.axes[index],
        value: Binary.OFF
      })
    }
    gamepadInput.buttons[index] = false
  }
}
