import { World } from "ecsy"
import {
  DefaultInputSchema,
  WebXRSession,
  WebXRSpace,
  WebXRViewPoint,
  WebXRPointer,
  WebXRMainController,
  WebXRSecondController,
  WebXRMainGamepad,
  WebXRSecondGamepad,
  Input,
  InputSystem,
  WebXRButton,
  WebXRRenderer
} from "./input"
import {
  DefaultNetworkSchema,
  Network,
  NetworkClient,
  NetworkObject,
  NetworkSystem,
  MediaStreamComponent,
  MediaStreamSystem,
  initializeNetworkSession
} from "./networking"
import { DefaultStateSchema, State, StateSystem } from "./state"
import { DefaultSubscriptionSchema, Subscription, SubscriptionSystem } from "./subscription"
import { WorldComponent, isBrowser, SceneComponent } from "./common"
import { CameraComponent, CameraSystem } from "./camera"
import { RigidBody, VehicleBody, WheelBody, PhysicsSystem, VehicleSystem, WheelSystem } from "./physics"
import { ParticleEmitter, Keyframe, ParticleSystem, KeyframeSystem } from "./particles"
import { TransformComponent, TransformParentComponent, TransformSystem } from "./transform"

export const DefaultInitializationOptions = {
  debug: false,
  withTransform: true,
  withWebXRInput: true,
  input: {
    enabled: true,
    schema: DefaultInputSchema
  },
  networking: {
    enabled: true,
    supportsMediaStreams: true,
    schema: DefaultNetworkSchema
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

export function initialize(world: World, options: any = DefaultInitializationOptions, scene?: any, camera?: any) {
  console.log("Initializing Armada")
  world.registerComponent(SceneComponent).registerComponent(WorldComponent)

  // World singleton
  const worldEntity = world
    .createEntity()
    .addComponent(WorldComponent)
    .getMutableComponent(WorldComponent) as WorldComponent

  worldEntity.world = world

  // Set up our scene singleton so we can bind to our scene elsewhere
  const sceneEntity = world
    .createEntity()
    .addComponent(SceneComponent)
    .getMutableComponent(SceneComponent)
  if (scene) sceneEntity.scene = scene // Bind whatever scene is provided to our camera entity

  // Camera
  if (options.camera && options.camera.enabled) {
    world.registerComponent(CameraComponent).registerSystem(CameraSystem)

    const cameraEntity = world
      .createEntity()
      .addComponent(CameraComponent, { camera: camera ? camera : null, followTarget: null })
      .getMutableComponent(CameraComponent)
    if (camera) cameraEntity.camera = camera // Bind whatever camera is provide to our camera entity
    camera.position.z = 10 // TODO: Remove, just here for setup
  }

  // Input
  if (options.input && options.input.enabled && isBrowser)
    world
      .registerComponent(Input)
      .registerComponent(WebXRSession)
      .registerComponent(WebXRSpace)
      .registerComponent(WebXRViewPoint)
      .registerComponent(WebXRPointer)
      .registerComponent(WebXRButton)
      .registerComponent(WebXRMainController)
      .registerComponent(WebXRMainGamepad)
      .registerComponent(WebXRRenderer)
      .registerComponent(WebXRSecondController)
      .registerComponent(WebXRSecondGamepad)
      .registerSystem(InputSystem)

  // Networking
  if (options.networking && options.networking.enabled) {
    world
      .registerComponent(Network)
      .registerComponent(NetworkClient)
      .registerComponent(NetworkObject)
      .registerSystem(NetworkSystem)
    const networkEntity = world.createEntity()
    networkEntity.addComponent(Network)

    if (options.networking.supportsMediaStreams == true) {
      world.registerComponent(MediaStreamComponent)
      world.registerSystem(MediaStreamSystem)
      const mediaStreamComponent = networkEntity.addComponent(MediaStreamComponent).getMutableComponent(MediaStreamComponent)
      MediaStreamComponent.instance = mediaStreamComponent
    } else {
      console.warn("Does not support media streams")
    }

    setTimeout(() => initializeNetworkSession(world, options.networking.schema ?? DefaultNetworkSchema, options.networking.schema.transport), 1)
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
