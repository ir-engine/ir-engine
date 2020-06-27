export * from "./components/index"
export * from "./enums/index"
export * from "./interfaces/index"
export * from "./mappings/index"
export * from "./systems/index"

import {
  MouseInputSystem,
  KeyboardInputSystem,
  GamepadInputSystem
} from "./systems/index"

import { isBrowser } from "./utils/IsBrowser"

import { World } from "ecsy"
import Input from "./components/Input"
import KeyboardInput from "./components/KeyboardInput"
import GamepadInput from "./components/GamepadInput"
import MouseInput from "./components/MouseInput"

const DEFAULT_OPTIONS = {
  mouse: true,
  keyboard: true,
  touchscreen: true,
  gamepad: true,
  debug: false
}

export function initializeInputSystems(
  world: World,
  options = DEFAULT_OPTIONS,
  inputMappings?
): void {
  if (options.debug) console.log("Initializing input systems...")

  if (!isBrowser)
    return console.error("Couldn't initialize input, are you in a browser?")

  // TODO: If input mappings is not null, create input mappings object
  // TODO:  Otherwise, read default

  if (window && options.debug) (window as any).DEBUG_INPUT = true

  if (options.debug) {
    console.log("Registering input systems with the following options:")
    console.log(options)
  }

  const inputSystemEntity = world.createEntity().addComponent(Input)

  if (options.keyboard) {
    world.registerSystem(KeyboardInputSystem, null)
    inputSystemEntity.addComponent(KeyboardInput)
    if (options.debug)
      console.log(
        "Registered KeyboardInputSystem and added KeyboardInput component to input entity"
      )
  }

  if (options.mouse) {
    world.registerSystem(MouseInputSystem, null)
    inputSystemEntity.addComponent(MouseInput)
    if (options.debug)
      console.log(
        "Registered MouseInputSystem and added MouseInput component to input entity"
      )
  }

  if (options.gamepad) {
    world.registerSystem(GamepadInputSystem, null)
    inputSystemEntity.addComponent(GamepadInput)
    if (options.debug)
      console.log(
        "Registered MouseInputSystem and added MouseInput component to input entity"
      )
  }

  // TODO: Add touchscreen
  if (options.touchscreen) {
    // world.registerSystem(TouchscreenInputSystem, null)
    // inputSystemEntity.addComponent(TouchscreenInput)
    if (options.debug) {
      console.log("Touchscreen is not yet implemented")
    }
  }

  if (options.debug) console.log("INPUT: Registered input systems.")
}
