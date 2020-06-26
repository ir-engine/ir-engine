// TODO: Test gamepad support!

import { System } from "ecsy"
import Input from "../components/Input"
import GamepadInput from "../components/GamepadInput"
export default class GamepadInputSystem extends System {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(): void {
    this.queries.gamepad.added.forEach(ent => {
      const gp = ent.getMutableComponent(GamepadInput)
      window.addEventListener("gamepadconnected", (event: any) => {
        console.log("A gamepad connected:", event.gamepad)
        gp.connected = true
      })
      window.addEventListener("gamepaddisconnected", (event: any) => {
        console.log("A gamepad disconnected:", event.gamepad)
        gp.connected = false
      })
    })
    this.queries.gamepad.results.forEach(ent => {
      const gp = ent.getMutableComponent(GamepadInput)
      if (gp.connected) {
        this.GetGamepadInput(gp, ent.getMutableComponent(Input))
      }
    })
  }

  GetGamepadInput(gp: GamepadInput, input: Input): void {
    const gamepads = navigator.getGamepads()
    gamepads.forEach(gamepad => {
      // TODO: Add axis values set in state
      if (gamepad.axes && gamepad.axes.length >= 2) {
        // X Axis
        if (gamepad.axes[0] < -gp.axis_threshold)
          input.states.right = !(input.states.left = true)
        else if (gamepad.axes[0] > gp.axis_threshold)
          input.states.right = !(input.states.left = false)
        else input.states.right = input.states.left = false
        // Y Axis
        if (gamepad.axes[1] < -gp.axis_threshold)
          input.states.down = !(input.states.up = false)
        else if (gamepad.axes[1] > gp.axis_threshold)
          input.states.down = !(input.states.up = true)
        else input.states.up = input.states.down = false
      }
    })
  }
}

GamepadInputSystem.queries = {
  gamepad: {
    components: [GamepadInput, Input],
    listen: {
      added: true,
      removed: true
    }
  }
}
