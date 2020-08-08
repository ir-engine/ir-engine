export * from "./common"
export * from "./input"
export * from "./state"
export * from "./physics"
export * from "./particles"
export * from "./networking"
export * from "./subscription"
export * from "./transform"

import { World } from "ecsy"

import InputSystem from "./input/systems/InputSystem"
import { isBrowser } from "./common/functions/isBrowser"
import Input from "./input/components/Input"
import SubscriptionSystem from "./subscription/systems/SubscriptionSystem"
import Subscription from "./subscription/components/Subscription"
import { DefaultInputSchema } from "./input/defaults/DefaultInputSchema"
import { DefaultSubscriptionSchema } from "./subscription/defaults/DefaultSubscriptionSchema"
import { DefaultStateSchema } from "./state/defaults/DefaultStateSchema"
import State from "./state/components/State"
import Transform from "./transform/components/Transform"
import NetworkClient from "./networking/components/NetworkClient"
import TransformSystem from "./transform/systems/TransformSystem"
import StateSystem from "./state/systems/StateSystem"
import { NetworkSystem } from "./networking/systems/NetworkSystem"
import { MediaStreamControlSystem } from "./networking/systems/MediaStreamSystem"
import WebXRInputSystem from "./input/systems/WebXRInputSystem"
import TransformParent from "./transform/components/TransformParent"
import { DefaultNetworkSchema } from "./networking/defaults/DefaultNetworkSchema"
import NetworkObject from "./networking/components/NetworkObject"
import { ParticleSystem, ParticleEmitter, Keyframe, KeyframeSystem } from "./particles"
import { RigidBody, VehicleBody, WheelBody, PhysicsSystem, VehicleSystem, WheelSystem } from "./physics"
import SceneData from "./common/components/SceneData"
import { WebXRRenderer } from "./input/components/WebXRRenderer"
import { WebXRButton } from "./input/components/WebXRButton"
import { WebXRMainController } from "./input/components/WebXRMainController"
import { WebXRMainGamepad } from "./input/components/WebXRMainGamepad"
import { WebXRPointer } from "./input/components/WebXRPointer"
import { WebXRSecondController } from "./input/components/WebXRSecondController"
import { WebXRSecondGamepad } from "./input/components/WebXRSecondGamepad"
import { WebXRSession } from "./input/components/WebXRSession"
import { WebXRTrackingDevice } from "./input/components/WebXRTrackingDevice"
import { WebXRViewPoint } from "./input/components/WebXRViewPoint"
import { WebXRSpace } from "./input/components/WebXRSpace"
import MediaStreamComponent from "./networking/components/MediaStreamComponent"
import Network from "./networking/components/Network"

const DEFAULT_OPTIONS = {
  debug: false,
  withTransform: true,
  withWebXRInput: true,
  input: {
    enabled: true,
    schema: DefaultInputSchema
  },
  networking: {
    enabled: true,
    schema: DefaultNetworkSchema,
    supportsMediaStreams: true
  },
  state: {
    enabled: true,
    schema: DefaultStateSchema
  },
  subscriptions: {
    enabled: true,
    schema: DefaultSubscriptionSchema
  },
  physics: {
    enabled: false
  },
  particles: {
    enabled: false
  },
  transform: {
    enabled: true
  }
}
// TODO: Schema injections
export function initializeArmada(world: World, options: any = DEFAULT_OPTIONS, scene?: any, camera?: any) {
  world.registerComponent(SceneData)

  // Set up our scene singleton so we can bind to our scene elsewhere
  const sceneData = world
    .createEntity()
    .addComponent(SceneData)
    .getMutableComponent(SceneData)
  if (scene) sceneData.scene = scene
  if (camera) sceneData.camera = camera

  // Input
  if (options.input && options.input.enabled && isBrowser)
    world
      .registerComponent(Input)
      .registerSystem(InputSystem)
      .registerComponent(WebXRButton)
      .registerComponent(WebXRMainController)
      .registerComponent(WebXRMainGamepad)
      .registerComponent(WebXRPointer)
      .registerComponent(WebXRRenderer)
      .registerComponent(WebXRSecondController)
      .registerComponent(WebXRSecondGamepad)
      .registerComponent(WebXRSession)
      .registerComponent(WebXRSpace)
      .registerComponent(WebXRViewPoint)
      .registerSystem(WebXRInputSystem, {
        onVRSupportRequested(vrSupported) {
          if (vrSupported) {
            const webxr: any = world.getSystem(WebXRInputSystem)
            webxr.startVR()
          }
        }
      })

  // Networking
  if (options.networking && options.networking.enabled) {
    world
      .registerComponent(Network)
      .registerComponent(NetworkClient)
      .registerComponent(NetworkObject)
      .registerSystem(NetworkSystem)
    if (options.networking.supportsMediaStreams) {
      world.registerComponent(MediaStreamComponent)
      world.registerSystem(MediaStreamControlSystem)
    }
    world.getSystem(NetworkSystem).initializeSession(world, options.networking.schema ?? DefaultNetworkSchema, options.networking.schema.transport)
  }

  // State
  if (options.state && options.state.enabled) world.registerComponent(State).registerSystem(StateSystem)

  // Subscriptions
  if (options.subscriptions && options.subscriptions.enabled) world.registerComponent(Subscription).registerSystem(SubscriptionSystem)

  // Physics
  if (options.physics && options.physics.enabled)
    world
      .registerComponent(RigidBody)
      .registerComponent(VehicleBody)
      .registerComponent(WheelBody)
      .registerSystem(PhysicsSystem)
      .registerSystem(VehicleSystem)
      .registerSystem(WheelSystem)

  // Particles
  if (options.particles && options.particles.enabled)
    world
      .registerComponent(ParticleEmitter)
      .registerComponent(Keyframe)
      .registerSystem(ParticleSystem)
      .registerSystem(KeyframeSystem)

  //Transform
  if (options.transform && options.transform.enabled)
    world
      .registerComponent(Transform)
      .registerComponent(TransformParent)
      .registerSystem(TransformSystem)
}
