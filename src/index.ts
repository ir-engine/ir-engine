import { World } from "ecsy"

import MouseInputSystem from "./systems/MouseInputSystem"
import KeyboardInputSystem from "./systems/KeyboardInputSystem"
import GamepadInputSystem from "./systems/GamepadInputSystem"

import MouseInput from "./components/MouseInput"
import KeyboardInput from "./components/KeyboardInput"
import GamepadInput from "./components/GamepadInput"

import { isBrowser } from "./utils/IsBrowser"
import Input from "./components/Input"
import KeyboardDebugSystem from "./systems/KeyboardDebugSystem"
import ActionQueue from "./components/ActionQueue"
import UserInputReceiver from "./components/UserInputReceiver"

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
  keyboardInputMappings?,
  mouseInputMappings?,
  mobileInputMappings?,
  VRInputMappings?
): void {
  if (options.debug) console.log("Initializing input systems...")

  if (!isBrowser)
    return console.error("Couldn't initialize input, are you in a browser?")

  // TODO: If input mappings is not null, create input mappings object
  // TODO: Otherwise, read default

  if (window && options.debug) (window as any).DEBUG_INPUT = true

  if (options.debug) {
    console.log("Registering input systems with the following options:")
    console.log(options)
  }

  const inputSystemEntity = world.createEntity()
  world
    .registerComponent(Input)
    .registerComponent(ActionQueue)
    .registerComponent(UserInputReceiver)

  inputSystemEntity.addComponent(Input)
  inputSystemEntity.addComponent(ActionQueue)

  const inputReceiverEntity = world
    .createEntity()
    .addComponent(UserInputReceiver)
    .addComponent(ActionQueue)

  if (options.keyboard) {
    world
      .registerComponent(KeyboardInput)
      .registerSystem(KeyboardInputSystem, null)
    inputSystemEntity.addComponent(KeyboardInput)
    // TODO: Initialize with user mappings
    if (options.debug) {
      world.registerSystem(KeyboardDebugSystem)
    }
    console.log(
      "Registered KeyboardInputSystem and added KeyboardInput component to input entity"
    )
  }

  if (options.mouse) {
    world.registerComponent(MouseInput).registerSystem(MouseInputSystem, null)
    inputSystemEntity.addComponent(MouseInput)
    // TODO: Initialize with user mappings
    if (options.debug)
      console.log(
        "Registered MouseInputSystem and added MouseInput component to input entity"
      )
  }

  if (options.gamepad) {
    world
      .registerComponent(GamepadInput)
      .registerSystem(GamepadInputSystem, null)
    inputSystemEntity.addComponent(GamepadInput)
    // TODO: Initialize with user mappings
    if (options.debug)
      console.log(
        "Registered GamepadInputSystem and added MouseInput component to input entity"
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
