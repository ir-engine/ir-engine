// TODO: Test gamepad support!

import { System } from "ecsy"
import Input from "../components/Input"
import GamepadInput from "../components/GamepadInput"
import MouseInput from "../components/MouseInput"
import KeyboardInput from "../components/KeyboardInput"

export default class InputDebugSystem extends System {
  mouse: MouseInput
  inp: Input
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(): void {
    this.handleGamePads()
    this.handleMouse()
    this.handleKeyboard()
    this.handleTouchscreen()
  }

  handleMouse(): void {
    this.queries.mouse.added.forEach(ent => {
      document.addEventListener(
        "mousedown",
        (e: any) => console.log("Mouse button pressed"),
        false
      )
      document.addEventListener(
        "mouseup",
        (e: any) => console.log("Mouse button released"),
        false
      )
    })
  }

  handleKeyboard(): void {
    this.queries.keyboard.added.forEach(() => {
      document.addEventListener("keydown", (e: any) =>
        console.log(`${e.key} pressed`)
      )
      document.addEventListener("keyup", (e: any) =>
        console.log(`${e.key} released`)
      )
    })
  }

  handleTouchscreen(): void {
    // TODO: Add touchscreen support
  }

  handleGamePads(): void {
    this.queries.gamepad.added.forEach(ent => {
      const gp = ent.getMutableComponent(GamepadInput)
      window.addEventListener("gamepadconnected", (event: any) => {
        console.log("A gamepad connected:", event.gamepad)
      })
      window.addEventListener("gamepaddisconnected", (event: any) => {
        console.log("A gamepad disconnected:", event.gamepad)
      })
    })
    this.queries.gamepad.results.forEach(ent => {
      const gp = ent.getMutableComponent(GamepadInput)
      if (gp.connected) {
        const input = ent.getMutableComponent(Input)
        const gamepads = navigator.getGamepads()
        gamepads.forEach(gamepad => {
          if (gamepad.axes) {
            if (gamepad.axes.length >= 2) {
              console.log("left: " + input.states.left)
              console.log("right: " + input.states.right)
              console.log("up: " + input.states.up)
              console.log("down: " + input.states.down)
            }
          }
        })
      }
    })
  }
}

InputDebugSystem.queries = {
  gamepad: {
    components: [GamepadInput, Input],
    listen: {
      added: true,
      removed: true
    }
  },
  mouse: {
    components: [MouseInput, Input],
    listen: {
      added: true,
      removed: true
    }
  },
  keyboard: {
    components: [KeyboardInput, Input],
    listen: { added: true, removed: true }
  }
}
