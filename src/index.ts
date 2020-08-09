export * from "./camera"
export * from "./common"
export * from "./input"
export * from "./networking"
export * from "./particles"
export * from "./physics"
export * from "./state"
export * from "./subscription"
export * from "./transform"

import { World } from "ecsy"
import { Camera } from "./camera/components/Camera"
import { CameraSystem } from "./camera/systems/CameraSystem"
import { Scene } from "./common/components/Scene"
import { isBrowser } from "./common/functions/isBrowser"
import { Input } from "./input/components/Input"
import { WebXRButton } from "./input/components/WebXRButton"
import { WebXRMainController } from "./input/components/WebXRMainController"
import { WebXRMainGamepad } from "./input/components/WebXRMainGamepad"
import { WebXRPointer } from "./input/components/WebXRPointer"
import { WebXRRenderer } from "./input/components/WebXRRenderer"
import { WebXRSecondController } from "./input/components/WebXRSecondController"
import { WebXRSecondGamepad } from "./input/components/WebXRSecondGamepad"
import { WebXRSession } from "./input/components/WebXRSession"
import { WebXRSpace } from "./input/components/WebXRSpace"
import { WebXRViewPoint } from "./input/components/WebXRViewPoint"
import { DefaultInputSchema } from "./input/defaults/DefaultInputSchema"
import { InputSystem } from "./input/systems/InputSystem"
import { WebXRInputSystem } from "./input/systems/WebXRInputSystem"
import { MediaStreamComponent } from "./networking/components/MediaStreamComponent"
import { Network as NetworkComponent } from "./networking/components/Network"
import { NetworkClient } from "./networking/components/NetworkClient"
import { NetworkObject } from "./networking/components/NetworkObject"
import { DefaultNetworkSchema } from "./networking/defaults/DefaultNetworkSchema"
import { MediaStreamControlSystem } from "./networking/systems/MediaStreamSystem"
import { NetworkSystem } from "./networking/systems/NetworkSystem"
import { Keyframe, KeyframeSystem, ParticleEmitter, ParticleSystem } from "./particles"
import { PhysicsSystem, RigidBody, VehicleBody, VehicleSystem, WheelBody, WheelSystem } from "./physics"
import { State } from "./state/components/State"
import { DefaultStateSchema } from "./state/defaults/DefaultStateSchema"
import { StateSystem } from "./state/systems/StateSystem"
import { Subscription } from "./subscription/components/Subscription"
import { DefaultSubscriptionSchema } from "./subscription/defaults/DefaultSubscriptionSchema"
import { SubscriptionSystem } from "./subscription/systems/SubscriptionSystem"
import { TransformComponent } from "./transform/components/TransformComponent"
import { TransformParentComponent } from "./transform/components/TransformParentComponent"
import { TransformSystem } from "./transform/systems/TransformSystem"

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
  camera: {
    enabled: true
  },
  transform: {
    enabled: true
  }
}

export function initializeArmada(world: World, options: any = DEFAULT_OPTIONS, scene?: any, camera?: any) {
  world.registerComponent(Scene)

  // Set up our scene singleton so we can bind to our scene elsewhere
  const sceneEntity = world
    .createEntity()
    .addComponent(Scene)
    .getMutableComponent(Scene)
  if (scene) sceneEntity.scene = scene // Bind whatever scene is provided to our camera entity

  // Camera
  if (options.camera && options.camera.enabled) {
    world.registerComponent(Camera).registerSystem(CameraSystem)

    const cameraEntity = world
      .createEntity()
      .addComponent(Camera, { camera: camera ? camera : null, followTarget: null })
      .getMutableComponent(Camera)
    if (camera) cameraEntity.camera = camera // Bind whatever camera is provide to our camera entity
    camera.position.z = 10 // TODO: Remove, just here for setup
  }

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
      .registerComponent(NetworkComponent)
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
      .registerComponent(TransformComponent)
      .registerComponent(TransformParentComponent)
      .registerSystem(TransformSystem)
}
