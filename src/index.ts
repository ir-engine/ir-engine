import { Entity, World } from "ecsy"

import MouseInputSystem from "./systems/MouseInputSystem"
import KeyboardInputSystem from "./systems/KeyboardInputSystem"
import GamepadInputSystem from "./systems/GamepadInputSystem"

import MouseInput from "./components/MouseInput"
import KeyboardInput from "./components/KeyboardInput"
import GamepadInput from "./components/GamepadInput"

import { isBrowser } from "./utils/IsBrowser"
import UserInput from "./components/UserInput"
import InputActionHandler from "./components/InputActionHandler"
import InputAxisHandler2D from "./components/InputAxisHandler2D"
import InputDebugSystem from "./systems/InputDebugSystem"
import InputActionSystem from "./systems/InputActionSystem"
import InputAxisSystem from "./systems/InputAxisSystem"
import InputActionMapData from "./components/InputActionMapData"
import InputReceiver from "./components/InputReceiver"
import AxisMap from "./interfaces/AxisMap"
import ActionMap from "./interfaces/ActionMap"

const DEFAULT_OPTIONS = {
  mouse: true,
  keyboard: true,
  touchscreen: true,
  gamepad: true,
  debug: false
}

export {
  InputReceiver,
  InputActionHandler,
  InputAxisHandler2D,
  initializeInputSystems
}

function initializeInputSystems(
  world: World,
  options = DEFAULT_OPTIONS,
  keyboardInputMap?,
  mouseInputMap?,
  // mobileInputMap?,
  // VRInputMap?,
  actionMap?
): void {
  if (options.debug) console.log("Initializing input systems...")

  if (!isBrowser) return console.error("Couldn't initialize input, are you in a browser?")

  if (options.debug) {
    console.log("Registering input systems with the following options:")
    console.log(options)
  }

  world.registerSystem(InputActionSystem).registerSystem(InputAxisSystem)

  world
    .registerComponent(UserInput)
    .registerComponent(InputActionHandler)
    .registerComponent(InputAxisHandler2D)
    .registerComponent(InputReceiver)
    .registerComponent(InputActionMapData)

  if (options.keyboard) world.registerSystem(KeyboardInputSystem).registerComponent(KeyboardInput)
  if (options.mouse) world.registerSystem(MouseInputSystem).registerComponent(MouseInput)
  if (options.gamepad) world.registerSystem(GamepadInputSystem).registerComponent(GamepadInput)
  // TODO: VR, Mobile

  const inputSystemEntity = world
    .createEntity()
    .addComponent(UserInput)
    .addComponent(InputActionHandler)
    .addComponent(InputAxisHandler2D)
    .addComponent(InputActionMapData)
    .addComponent(InputReceiver)

  const inputReceiverEntity = world
    .createEntity()
    .addComponent(InputReceiver)
    .addComponent(InputActionHandler)
    .addComponent(InputAxisHandler2D)

  // Custom Action Map
  if (actionMap) {
    inputSystemEntity.getMutableComponent(InputActionMapData).actionMap = actionMap
  }

  if (options.keyboard) {
    inputSystemEntity.addComponent(KeyboardInput)
    if (keyboardInputMap) {
      inputSystemEntity.getMutableComponent(KeyboardInput).inputMap = keyboardInputMap
    }
    console.log("Registered KeyboardInputSystem and added KeyboardInput component to input entity")
  }

  if (options.mouse) {
    inputSystemEntity.addComponent(MouseInput)

    if (mouseInputMap) {
      inputSystemEntity.getMutableComponent(MouseInput).actionMap = mouseInputMap
    }

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
}

export function addActionHandlingToEntity(entity: Entity, actionFilter?: ActionMap){
  // Try get component on actionhandler, inputreceiver
  // If either is true, throw warning
  // If either fails, add components
}

export function AddAxisHandlingToEntity(entity: Entity, axisFilter?: AxisMap){
  // Try get component on axishandler, inputreceiver
  // If either is true, throw warning
  // If either fails, add components
}