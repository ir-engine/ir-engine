import { World } from "ecsy"
import { Camera, CameraSystem } from "."
import {
  Input,
  InputSystem,
  WebXRButton,
  WebXRMainController,
  WebXRMainGamepad,
  WebXRPointer,
  WebXRRenderer,
  WebXRSecondController,
  WebXRSecondGamepad,
  WebXRSession,
  WebXRSpace,
  WebXRViewPoint
} from "."
import {
  Network,
  NetworkSystem,
  MediaStreamComponent,
  MediaStreamControlSystem,
  NetworkClient,
  NetworkObject,
  DefaultNetworkSchema,
  initializeNetworkSession
} from "."
import { Keyframe, KeyframeSystem, ParticleEmitter, ParticleSystem } from "."
import { PhysicsSystem, RigidBody, VehicleBody, VehicleSystem, WheelBody, WheelSystem } from "."
import { State, StateSystem } from "."
import { Subscription, SubscriptionSystem } from "."
import { TransformComponent, TransformParentComponent, TransformSystem } from "."
import { Scene, WorldComponent, DefaultInputSchema, DefaultStateSchema, DefaultSubscriptionSchema, isBrowser } from "."

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

export function initialize(world: World, options: any = DefaultInitializationOptions, scene?: any, camera?: any) {
  world.registerComponent(Scene)

  // World singleton
  const worldEntity = world
    .createEntity()
    .addComponent(WorldComponent)
    .getMutableComponent(WorldComponent) as WorldComponent

  worldEntity.world = world

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

  WorldComponent.instance.world
    .registerComponent(WebXRSession)
    .registerComponent(WebXRSpace)
    .registerComponent(WebXRViewPoint)
    .registerComponent(WebXRPointer)
    .registerComponent(WebXRMainController)
    .registerComponent(WebXRSecondController)
    .registerComponent(WebXRMainGamepad)
    .registerComponent(WebXRSecondGamepad)

  // Input
  if (options.input && options.input.enabled && isBrowser)
    world
      .registerComponent(Input)
      .registerSystem(InputSystem)
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
    initializeNetworkSession(world, options.networking.schema ?? DefaultNetworkSchema, options.networking.schema.transport)
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
