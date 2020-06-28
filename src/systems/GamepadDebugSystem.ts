import { System } from "ecsy"
import GamepadInput from "../components/GamepadInput"
import ActionValues from "../enums/ActionValues"
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
        // X Axis
        if (gp.dpadOneAxisX < -gp.axis_threshold || gp.dpadOneAxisX > gp.axis_threshold)
          console.log(`X: ${gp.dpadOneAxisX}`)

        if (gp.dpadOneAxisY < -gp.axis_threshold || gp.dpadOneAxisY > gp.axis_threshold)
          console.log(`Y: ${gp.dpadOneAxisY}`)

        if (gp.dpadTwoAxisX < -gp.axis_threshold || gp.dpadTwoAxisX > gp.axis_threshold)
          console.log(`X: ${gp.dpadTwoAxisX}`)

        if (gp.dpadTwoAxisY < -gp.axis_threshold || gp.dpadTwoAxisY > gp.axis_threshold)
          console.log(`Y: ${gp.dpadTwoAxisY}`)

        if (gp.buttonA === ActionValues.START) console.log("Button A pressed")

        if (gp.buttonB === ActionValues.START) console.log("Button B pressed")

        if (gp.buttonX === ActionValues.START) console.log("Button X pressed")

        if (gp.buttonY === ActionValues.START) console.log("Button Y pressed")
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
