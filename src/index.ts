export * from "./common"
export * from "./input"
export * from "./state"
export * from "./networking"

import { Entity, World } from "ecsy"

import InputSystem from "./input/systems/InputSystem"
import { isBrowser } from "./common/utils/isBrowser"
import Input from "./input/components/Input"
import InputSchema from "./input/interfaces/InputSchema"
import { DefaultInputMap } from "./input/defaults/DefaultInputData"
import Subscription from "./subscription/components/Subscription"
import State from "./state/components/State"
import { TransformComponent } from "./common/defaults/components/TransformComponent"
import Actor from "./common/defaults/components/Actor"
import StateSystem from "./state/systems/StateSystem"
import StateSchema from "./state/interfaces/StateSchema"
import { DefaultStateSchema } from "./state/defaults/DefaultStateSchema"
import { NetworkSystem } from "./networking/systems/NetworkSystem"
import NetworkClient from "./networking/components/NetworkClient"
import NetworkObject from "./networking/components/NetworkObject"
import NetworkTransport from "./networking/interfaces/NetworkTransport"
import { MediaStreamControlSystem } from "./networking/systems/MediaStreamSystem"

const DEFAULT_OPTIONS = {
  debug: false
}

// TODO: Make this a static function on InputSystem
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

// TODO: Make this a static function on ActorSystem
export function initializeActor(entity: Entity, options: { inputMap?: InputSchema; stateMap?: StateSchema }): Entity {
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
    entity.getMutableComponent(State).map = DefaultStateSchema
  }

  return entity
}

export function initializeNetworking(world: World, transport?: NetworkTransport) {
  world
    .registerSystem(NetworkSystem)
    .registerComponent(NetworkObject)
    .registerComponent(NetworkClient)
  if (transport.supportsMediaStreams) world.registerSystem(MediaStreamControlSystem)

  const networkSystem = world.getSystem(NetworkSystem) as NetworkSystem
  networkSystem.initializeSession(world, transport)
}
