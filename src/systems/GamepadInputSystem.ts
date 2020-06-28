import { System } from "ecsy"
import GamepadInput from "../components/GamepadInput"
export default class GamepadInputSystem extends System {
  public execute(): void {
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
        const gamepads = navigator.getGamepads()
        for (let i = 0; i < gamepads.length; i++) {
          if (gamepads[i].axes && gamepads[i].axes.length >= 2) {
            // X Axis
            if (gamepads[i].axes[0] < -gp.axis_threshold || gamepads[i].axes[0] > gp.axis_threshold) {
              if (i == 0) gp.dpadOneAxisX = gamepads[i].axes[0]
              else if (i == 1) gp.dpadTwoAxisX = gamepads[i].axes[0]
            }

            if (gamepads[i].axes[1] < -gp.axis_threshold || gamepads[i].axes[1] > gp.axis_threshold) {
              if (i == 0) gp.dpadOneAxisY = gamepads[i].axes[1]
              else if (i == 1) gp.dpadTwoAxisY = gamepads[i].axes[1]
            }
          }
        }
      }
    })
  }
}
GamepadInputSystem.queries = {
  gamepad: {
    components: [GamepadInput],
    listen: {
      added: true,
      removed: true
    }
  }
}
