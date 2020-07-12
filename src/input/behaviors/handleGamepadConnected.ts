import { Entity } from "ecsy"
import GamepadInput from "../components/Input"
let gamepadInput
export const handleGamepadConnected: Behavior = (entityIn: Entity, args: { event: any }): void => {
  gamepadInput = entityIn.getMutableComponent(GamepadInput)
  console.log("A gamepad connected:", event.gamepad, event.gamepad.mapping)
  if (event.gamepad.mapping !== "standard") {
    return
  }
  gamepadInput.connected = true

  const gamepad = event.gamepad
  for (let index = 0; index < gamepad.buttons.length; index++) {
    if (typeof gamepadInput.buttons[index] === "undefined") {
      gamepadInput.buttons[index] = false
    }
  }
}
