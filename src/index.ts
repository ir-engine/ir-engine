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
import SubscriptionSystem from "./subscription/systems/SubscriptionSystem"
import Subscription from "./subscription/components/Subscription"
import SubscriptionMap from "./subscription/interfaces/SubscriptionMap"
import { DefaultSubscriptionMap } from "./subscription/defaults/DefaultSubscriptionData"
import State from "./state/components/State"
import { TransformComponent } from "./common/defaults/components/TransformComponent"
import TransformComponentSystem from "./common/defaults/systems/TransformComponentSystem"
import Actor from "./common/defaults/components/Actor"
import StateSystem from "./state/systems/StateSystem"
import StateSchema from "./state/interfaces/StateSchema"
import { DefaultStateSchema } from "./state/defaults/DefaultStateSchema"
import { NetworkSystem } from "./networking/systems/NetworkSystem"
import NetworkClient from "./networking/components/NetworkClient"
import NetworkObject from "./networking/components/NetworkObject"
import NetworkTransport from "./networking/interfaces/NetworkTransport"
import { MediaStreamControlSystem } from "./networking/systems/MediaStreamSystem"

import { Transform } from "ecsy-three/src/extras/components"

const DEFAULT_OPTIONS = {
  debug: false,
  withTransform: false
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

  world
    .registerSystem(InputSystem)
    .registerSystem(StateSystem)
    .registerSystem(SubscriptionSystem)
    .registerSystem(TransformComponentSystem)
  world
    .registerComponent(Input)
    .registerComponent(State)
    .registerComponent(Actor)
    .registerComponent(Subscription)
    .registerComponent(TransformComponent)
  if (options.withTransform) world.registerComponent(Transform)
  return world
}

export function initializeActor(
  entity: Entity,
  options: {
    inputMap?: InputSchema
    stateMap?: StateSchema
    subscriptionMap?: SubscriptionMap
  },
  withTransform = false
): Entity {
  entity
    .addComponent(Input)
    .addComponent(State)
    .addComponent(Actor)
    .addComponent(Subscription)
    .addComponent(TransformComponent)
  // .addComponent(Transform)
  if (withTransform) entity.addComponent(Transform)

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
    console.log("No state map provided, defaulting to default state")
    entity.getMutableComponent(State).map = DefaultStateSchema
  }

  // Custom Subscription Map
  if (options.subscriptionMap) {
    console.log("Using subscription map:")
    console.log(options.subscriptionMap)
    entity.getMutableComponent(Subscription).map = options.subscriptionMap
  } else {
    console.log("No subscription map provided, defaulting to default subscriptions")
    entity.getMutableComponent(Subscription).map = DefaultSubscriptionMap
  }

  return entity
}

export function initializeNetworking(world: World, transport?: NetworkTransport) {
  world.registerSystem(NetworkSystem).registerComponent(NetworkClient)
  if (transport.supportsMediaStreams) world.registerSystem(MediaStreamControlSystem)

  const networkSystem = world.getSystem(NetworkSystem) as NetworkSystem
  networkSystem.initializeSession(world, transport)
}
