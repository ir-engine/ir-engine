export * from "./common"
export * from "./input"
export * from "./state"
export * from "./physics"
export * from "./particles"
export * from "./networking"

import { Entity, World } from "ecsy"

import InputSystem from "./input/systems/InputSystem"
import { isBrowser } from "./common/functions/isBrowser"
import Input from "./input/components/Input"
import InputSchema from "./input/interfaces/InputSchema"
import { DefaultInputSchema } from "./input/defaults/DefaultInputSchema"
import SubscriptionSystem from "./subscription/systems/SubscriptionSystem"
import Subscription from "./subscription/components/Subscription"
import SubscriptionSchema from "./subscription/interfaces/SubscriptionSchema"
import { DefaultSubscriptionSchema } from "./subscription/defaults/DefaultSubscriptionSchema"
import State from "./state/components/State"
import Transform from "./transform/components/Transform"
import TransformSystem from "./transform/systems/TransformSystem"
import Actor from "./common/defaults/components/Actor"
import StateSystem from "./state/systems/StateSystem"
import StateSchema from "./state/interfaces/StateSchema"
import { DefaultStateSchema } from "./state/defaults/DefaultStateSchema"
import { NetworkSystem } from "./networking/systems/NetworkSystem"
import NetworkClient from "./networking/components/NetworkClient"
import NetworkTransport from "./networking/interfaces/NetworkTransport"
import { MediaStreamControlSystem } from "./networking/systems/MediaStreamSystem"

import TransformParent from "./transform/components/TransformParent"
import NetworkObject from "./networking/defaults/components/NetworkObject"

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

  world
    .registerComponent(Input)
    .registerComponent(State)
    .registerComponent(Actor)
    .registerComponent(Subscription)
    .registerComponent(Transform)
    .registerComponent(TransformParent)

  world
    .registerSystem(InputSystem)
    .registerSystem(StateSystem)
    .registerSystem(SubscriptionSystem)
    .registerSystem(TransformSystem)

  return world
}

export function initializeActor(
  entity: Entity,
  options: {
    inputSchema?: InputSchema
    stateSchema?: StateSchema
    subscriptionSchema?: SubscriptionSchema
  }
): Entity {
  entity
    .addComponent(Input)
    .addComponent(State)
    .addComponent(Actor)
    .addComponent(Subscription)
    .addComponent(Transform)

  // Custom Action Map
  if (options.inputSchema) {
    console.log("Using input schema:")
    console.log(options.inputSchema)
    entity.getMutableComponent(Input).schema = options.inputSchema
  } else {
    console.log("No input map provided, defaulting to default input")
    entity.getMutableComponent(Input).schema = DefaultInputSchema
  }

  // Custom Action Map
  if (options.stateSchema) {
    console.log("Using state schema:")
    console.log(options.stateSchema)
    entity.getMutableComponent(State).schema = options.stateSchema
  } else {
    console.log("No state map provided, defaulting to default state")
    entity.getMutableComponent(State).schema = DefaultStateSchema
  }

  // Custom Subscription Map
  if (options.subscriptionSchema) {
    console.log("Using subscription schema:")
    console.log(options.subscriptionSchema)
    entity.getMutableComponent(Subscription).schema = options.subscriptionSchema
  } else {
    console.log("No subscription schema provided, defaulting to default subscriptions")
    entity.getMutableComponent(Subscription).schema = DefaultSubscriptionSchema
  }

  return entity
}

export function initializeNetworking(world: World, transport?: NetworkTransport) {
  world.registerComponent(NetworkClient).registerComponent(NetworkObject)
  world.registerSystem(NetworkSystem)
  if (transport.supportsMediaStreams) world.registerSystem(MediaStreamControlSystem)

  const networkSystem = world.getSystem(NetworkSystem) as NetworkSystem
  networkSystem.initializeSession(world, transport)
}
