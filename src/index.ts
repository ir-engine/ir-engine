import { Entity, World } from "ecsy"

import InputSystem from "./input/systems/InputSystem"
import KeyboardInputSystem from "./input/systems/KeyboardInputSystem"
import GamepadInputSystem from "./input/systems/GamepadInputSystem"

import MouseInput from "./input/components/MouseInput"
import KeyboardInput from "./input/components/KeyboardInput"
import GamepadInput from "./input/components/GamepadInput"

import { isBrowser } from "./common/utils/IsBrowser"
import UserInput from "./input/components/Input"
import InputActionHandler from "./input/components/InputActionHandler"
import Input from "./input/components/Input"
import InputDebugSystem from "./input/systems/InputDebugSystem"
import InputActionSystem from "./input/systems/InputActionSystem"
import InputInputSystem from "./input/systems/InputPropogationSystem"
import InputReceiver from "./input/components/InputReceiver"
import InputMap from "./input/interfaces/InputMap"
import DefaultInputMap from "./input/defaults/DefaultInputData"

const DEFAULT_OPTIONS = {
  mouse: true,
  keyboard: true,
  touchscreen: true,
  gamepad: true,
  debug: false
}

export { InputReceiver, InputActionHandler, Input as InputInputHandler2D }

export function initializeInputSystems(world: World, options = DEFAULT_OPTIONS, inputMap?: InputMap): World | null {
  if (options.debug) console.log("Initializing input systems...")

  if (!isBrowser) {
    console.error("Couldn't initialize input, are you in a browser?")
    return null
  }

  if (options.debug) {
    console.log("Registering input systems with the following options:")
    console.log(options)
  }

  world.registerSystem(InputActionSystem).registerSystem(InputInputSystem)

  world
    .registerComponent(UserInput)
    .registerComponent(InputActionHandler)
    .registerComponent(Input)
    .registerComponent(InputReceiver)

  if (options.keyboard) world.registerSystem(KeyboardInputSystem).registerComponent(KeyboardInput)
  if (options.mouse) world.registerSystem(InputSystem).registerComponent(MouseInput)
  if (options.gamepad) world.registerSystem(GamepadInputSystem).registerComponent(GamepadInput)
  // TODO: VR, Mobile

  const inputSystemEntity = world
    .createEntity()
    .addComponent(UserInput)
    .addComponent(InputActionHandler)
    .addComponent(Input)

  // inputReceiverEntity
  world
    .createEntity()
    .addComponent(InputReceiver)
    .addComponent(InputActionHandler)
    .addComponent(Input)

  // Custom Action Map
  if (inputMap) {
    console.log("Using input map:")
    console.log(inputMap)
    inputSystemEntity.getMutableComponent(UserInput).inputMap = inputMap
  } else {
    console.log("No input map")
    inputSystemEntity.getMutableComponent(UserInput).inputMap = DefaultInputMap
  }

  if (options.keyboard) {
    inputSystemEntity.addComponent(KeyboardInput)
    if (options.debug) console.log("Registered KeyboardInputSystem and added KeyboardInput component to input entity")
  }

  if (options.mouse) {
    inputSystemEntity.addComponent(MouseInput)
    if (options.debug) console.log("Registered MouseInputSystem and added MouseInput component to input entity")
  }

  if (options.gamepad) {
    inputSystemEntity.addComponent(GamepadInput)
    // TODO: Initialize with user mappings
    if (options.debug) console.log("Registered GamepadInputSystem and added MouseInput component to input entity")
  }

  // TODO: Add touchscreen
  if (options.touchscreen) {
    // world.registerSystem(TouchscreenInputSystem, null)
    // inputSystemEntity.addComponent(TouchscreenInput)
    if (options.debug) {
      console.log("Touchscreen is not yet implemented")
    }
  }

  if (options.debug) {
    world.registerSystem(InputDebugSystem)
    console.log("INPUT: Registered input systems.")
  }

  return world
}

export function addInputHandlingToEntity(entity: Entity, inputFilter?: InputMap): Entity {
  // Try get component on inputhandler, inputreceiver
  if (entity.getComponent(InputReceiver) !== undefined) console.warn("Warning: Entity already has input receiver component")
  else {
    entity
      .addComponent(InputReceiver)
      .addComponent(Input)
      .addComponent(InputActionHandler)
  }
  return entity
}
