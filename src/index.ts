import { Entity, World } from "ecsy"

import InputSystem from "./input/systems/InputSystem"
import { isBrowser } from "./common/utils/IsBrowser"
import Input from "./input/components/Input"
import InputMap from "./input/interfaces/InputMap"
import { DefaultInputMap } from "./input/defaults/DefaultInputData"
import Subscription from "./subscription/components/Subscription"
import State from "./state/components/State"
import { TransformComponent } from "./common/defaults/components/TransformComponent"
import Actor from "./common/defaults/components/Actor"
import StateSystem from "./state/systems/StateSystem"

const DEFAULT_OPTIONS = {
  debug: false
}

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

  world.registerSystem(InputSystem).registerSystem(StateSystem)
  world
    .registerComponent(Input)
    .registerComponent(State)
    .registerComponent(Actor)
    .registerComponent(Subscription)
    .registerComponent(TransformComponent)

  const inputSystemEntity = world
    .createEntity()
    .addComponent(Input)
    .addComponent(State)
    .addComponent(Actor)
    .addComponent(Subscription)
    .addComponent(TransformComponent)

  // Custom Action Map
  if (inputMap) {
    console.log("Using input map:")
    console.log(inputMap)
    ;(inputSystemEntity.getMutableComponent(Input) as any).map = inputMap
  } else {
    console.log("No input map provided, defaulting to default input")
    ;(inputSystemEntity.getMutableComponent(Input) as any).map = DefaultInputMap
  }

  // if (options.debug) {
  //   world.registerSystem(InputDebugSystem)
  //   console.log("INPUT: Registered input systems.")
  // }

  return world
}

export function addInputHandlingToEntity(entity: Entity): Entity {
  // Try get component on inputhandler, inputreceiver
  if (entity.getComponent(Input) !== undefined) console.warn("Warning: Entity already has input component")
  else {
    entity
      .addComponent(Input)
      .addComponent(State)
      .addComponent(Subscription)
  }
  return entity
}
