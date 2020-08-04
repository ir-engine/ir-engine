export * from "./common"
export * from "./input"
export * from "./state"
export * from "./physics"
export * from "./particles"
export * from "./networking"

import { Entity, World } from "ecsy"

import InputSystem from "./input/systems/InputSystem"
import { isBrowser } from "./common/utils/isBrowser"
import Input from "./input/components/Input"
import InputSchema from "./input/interfaces/InputSchema"
import { DefaultInputSchema } from "./input/defaults/DefaultInputSchema"
import SubscriptionSystem from "./subscription/systems/SubscriptionSystem"
import Subscription from "./subscription/components/Subscription"
import SubscriptionSchema from "./subscription/interfaces/SubscriptionSchema"
import { DefaultSubscriptionSchema } from "./subscription/defaults/DefaultSubscriptionSchema"
import State from "./state/components/State"
import { TransformComponent } from "./common/defaults/components/TransformComponent"
import TransformComponentSystem from "./common/defaults/systems/TransformComponentSystem"
import Actor from "./common/defaults/components/Actor"
import StateSystem from "./state/systems/StateSystem"
import StateSchema from "./state/interfaces/StateSchema"
import { DefaultStateSchema } from "./state/defaults/DefaultStateSchema"
import { NetworkSystem } from "./networking/systems/NetworkSystem"
import NetworkClient from "./networking/components/NetworkClient"
import NetworkTransport from "./networking/interfaces/NetworkTransport"
import { MediaStreamControlSystem } from "./networking/systems/MediaStreamSystem"

import { Transform } from "ecsy-three/src/extras/components"
import WebXRInputSystem from "./input/systems/WebxrInputSystem"

const DEFAULT_OPTIONS = {
  debug: false,
  withTransform: true,
  withWebXRInput: true
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
  if (options.withWebXRInput) {
    world.registerSystem(WebXRInputSystem, 
      {onVRSupportRequested( vrSupported ){
        if( vrSupported ){
          const webxr:any = world.getSystem(WebXRInputSystem)
          webxr.startVR()
        }
      }}
    )
  }
  return world
}

export function initializeActor(
  entity: Entity,
  options: {
    inputSchema?: InputSchema
    stateSchema?: StateSchema
    subscriptionMap?: SubscriptionSchema
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
  if (options.inputSchema) {
    console.log("Using input map:")
    console.log(options.inputSchema)
    entity.getMutableComponent(Input).schema = options.inputSchema
  } else {
    console.log("No input map provided, defaulting to default input")
    entity.getMutableComponent(Input).schema = DefaultInputSchema
  }

  // Custom Action Map
  if (options.stateSchema) {
    console.log("Using input map:")
    console.log(options.stateSchema)
    entity.getMutableComponent(State).schema = options.stateSchema
  } else {
    console.log("No state map provided, defaulting to default state")
    entity.getMutableComponent(State).schema = DefaultStateSchema
  }

  // Custom Subscription Map
  if (options.subscriptionMap) {
    console.log("Using subscription map:")
    console.log(options.subscriptionMap)
    entity.getMutableComponent(Subscription).schema = options.subscriptionMap
  } else {
    console.log("No subscription map provided, defaulting to default subscriptions")
    entity.getMutableComponent(Subscription).schema = DefaultSubscriptionSchema
  }

  return entity
}

export function initializeNetworking(world: World, transport?: NetworkTransport) {
  world.registerSystem(NetworkSystem).registerComponent(NetworkClient)
  if (transport.supportsMediaStreams) world.registerSystem(MediaStreamControlSystem)

  const networkSystem = world.getSystem(NetworkSystem) as NetworkSystem
  networkSystem.initializeSession(world, transport)
}
