export * from "./common"
export * from "./input"
export * from "./state"

import { Entity, World } from "ecsy"

import InputSystem from "./input/systems/InputSystem"
import { isBrowser } from "./common/utils/IsBrowser"
import Input from "./input/components/Input"
import InputMap from "./input/interfaces/InputMap"
import { DefaultInputMap } from "./input/defaults/DefaultInputData"
import SubscriptionSystem from "./subscription/systems/SubscriptionSystem"
import Subscription from "./subscription/components/Subscription"
import SubscriptionMap from "./subscription/interfaces/SubscriptionMap"
import { DefaultSubscriptionMap } from './subscription/defaults/DefaultSubscriptionData'
import State from "./state/components/State"
import { TransformComponent } from "./common/defaults/components/TransformComponent"
// import TransformComponentSystem from "./common/defaults/systems/TransformComponentSystem"
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

  world.registerSystem(InputSystem)
    .registerSystem(StateSystem)
    .registerSystem(SubscriptionSystem)
    // .registerSystem(TransformComponentSystem)
  world
    .registerComponent(Input)
    .registerComponent(State)
    .registerComponent(Actor)
    .registerComponent(Subscription)
    .registerComponent(TransformComponent)
  return world
}

export function initializeActor(entity: Entity, options: {
  inputMap?: InputMap; stateMap?: StateMap, subscriptionMap?: SubscriptionMap
  }): Entity {
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
    ;(entity.getMutableComponent(Input) as any).map = options.inputMap
  } else {
    console.log("No input map provided, defaulting to default input")
    ;(entity.getMutableComponent(Input) as any).map = DefaultInputMap
  }

  // Custom Action Map
  if (options.stateMap) {
    console.log("Using input map:")
    console.log(options.stateMap)
    ;(entity.getMutableComponent(State) as any).map = options.stateMap
  } else {
    console.log("No state map provided, defaulting to default state")
    ;(entity.getMutableComponent(State) as any).map = DefaultStateMap
  }

  // Custom Subscription Map
  if (options.subscriptionMap) {
    console.log("Using subscription map:")
    console.log(options.subscriptionMap)
    ;(entity.getMutableComponent(Subscription) as any).map = options.subscriptionMap
  } else {
    console.log("No subscription map provided, defaulting to default subscriptions")
    ;(entity.getMutableComponent(Subscription) as any).map = DefaultSubscriptionMap
  }

  return entity
}
