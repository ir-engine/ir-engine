export * from "./common"
export * from "./input"
export * from "./state"

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
import StateMap from "./state/interfaces/StateMap"
import { DefaultStateMap } from "./state/defaults/DefaultStateData"

const DEFAULT_OPTIONS = {
  debug: false
}

export function initializeInputSystems(world: World, options = DEFAULT_OPTIONS): World | null {
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
  return world
}

export function initializeActor(entity: Entity, options: { inputMap?: InputMap; stateMap?: StateMap }): Entity {
  entity
    .addComponent(Input)
    .addComponent(State)
    .addComponent(Actor)
    .addComponent(Subscription)
    .addComponent(TransformComponent)

  // Custom Action Map
  if (options.inputMap) {
    console.log("Using input map:")
    console.log(options.inputMap)
    entity.getMutableComponent(Input).map = options.inputMap
  } else {
    console.log("No input map provided, defaulting to default input")
    entity.getMutableComponent(Input).map = DefaultInputMap
  }

  // Custom Action Map
  if (options.stateMap) {
    console.log("Using input map:")
    console.log(options.stateMap)
    entity.getMutableComponent(State).map = options.stateMap
  } else {
    console.log("No input map provided, defaulting to default input")
    entity.getMutableComponent(State).map = DefaultStateMap
  }

  return entity
}
