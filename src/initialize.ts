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
  NetworkInterpolation,
  initializeNetworkSession
} from "./networking"
import { DefaultStateSchema, State, StateSystem } from "./state"
import { DefaultSubscriptionSchema, Subscription, SubscriptionSystem } from "./subscription"
import { WorldComponent, isBrowser, SceneComponent, Timer } from "./common"
import { CameraComponent, CameraSystem } from "./camera"
import { PhysicsWorld, Collider, RigidBody, VehicleBody, VehicleComponent, WheelBody, PhysicsSystem  } from "./physics"
import { ParticleEmitter, Keyframe, ParticleSystem, KeyframeSystem } from "./particles"
import { TransformComponent, TransformParentComponent, TransformSystem } from "./transform"
import { RendererComponent, WebGLRendererSystem } from "./renderer"
import { Clock, WebGLRenderer, Scene, PerspectiveCamera, AmbientLight, Camera, GridHelper } from "three"
import { addObject3DComponent } from "./common/defaults/behaviors/Object3DBehaviors"
import { Object3DComponent, SceneTagComponent } from "ecsy-three"

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
  },
  renderer: {
    enabled: true
  }
}

export function initialize(options: any = DefaultInitializationOptions, world?: World, scene?: Scene, camera?: Camera) {
  console.log("Initializing")
  if (world == undefined || world == null) world = new World()
  if (scene == undefined || scene == null) scene = new Scene()
  if (isBrowser && (camera == undefined || camera == null))
    camera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000)

  const gridHelper = new GridHelper(1000, 100, 0xffffff, 0xeeeeee)
  scene.add(gridHelper)
  scene.add(camera)

  world.registerComponent(SceneComponent).registerComponent(WorldComponent)

  // World singleton
  const worldEntity = world
    .createEntity()
    .addComponent(WorldComponent)
    .getMutableComponent(WorldComponent) as WorldComponent

  worldEntity.world = world

  // Set up our scene singleton so we can bind to our scene elsewhere
  const sceneEntity = world.createEntity()

  const sceneComponent = sceneEntity.addComponent(SceneComponent).getMutableComponent(SceneComponent)
  // If scene exists, bind it
  sceneComponent.scene = scene
  if (!world.hasRegisteredComponent(SceneTagComponent as any)) world.registerComponent(SceneTagComponent)
  if (!world.hasRegisteredComponent(Object3DComponent as any)) world.registerComponent(Object3DComponent)
  sceneEntity
    .addComponent(Object3DComponent)
    .addComponent(SceneTagComponent)
    .getMutableComponent(Object3DComponent).value = scene

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
      .registerComponent(NetworkInterpolation)
      .registerSystem(NetworkSystem)
    const networkEntity = world.createEntity()
    networkEntity.addComponent(Network)

    if (options.networking.supportsMediaStreams == true) {
      world.registerComponent(MediaStreamComponent)
      world.registerSystem(MediaStreamSystem)
      const mediaStreamComponent = networkEntity
        .addComponent(MediaStreamComponent)
        .getMutableComponent(MediaStreamComponent)
      MediaStreamComponent.instance = mediaStreamComponent
    } else {
      console.warn("Does not support media streams")
    }

    setTimeout(
      () =>
        initializeNetworkSession(
          world,
          options.networking.schema ?? DefaultNetworkSchema,
          options.networking.schema.transport
        ),
      1
    )
  }

  // State
  if (options.state && options.state.enabled) world.registerComponent(State).registerSystem(StateSystem)

  // Subscriptions
  if (options.subscriptions && options.subscriptions.enabled)
    world.registerComponent(Subscription).registerSystem(SubscriptionSystem)

  // Physics
  if (options.physics && options.physics.enabled)
    world
      .registerComponent(PhysicsWorld)
      .registerComponent(VehicleComponent)
      .registerComponent(Collider)
      .registerComponent(RigidBody)
      .registerComponent(VehicleBody)
      .registerComponent(WheelBody)
      .registerSystem(PhysicsSystem)

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

  // Camera
  if (options.camera && options.camera.enabled) {
    world.registerComponent(CameraComponent).registerSystem(CameraSystem)

    const cameraEntity = world
      .createEntity()
      .addComponent(CameraComponent, { camera: camera, followTarget: null })
      .addComponent(Object3DComponent, { value: camera })
      .addComponent(TransformComponent)
      .getMutableComponent(CameraComponent)
    if (camera) cameraEntity.camera = camera // Bind whatever camera is provide to our camera entity
    camera.position.z = 10 // TODO: Remove, just here for setup
  }

  // Add an ambient light to the scene, we may wish to remove this later
  addObject3DComponent(world.createEntity(), { obj: AmbientLight })

  // Rendering
  if (options.renderer && options.renderer.enabled) {
    world.registerComponent(RendererComponent).registerSystem(WebGLRendererSystem, { priority: 999 })
    // Create the Three.js WebGL renderer
    const renderer = new WebGLRenderer({
      antialias: true
    })
    // Add the renderer to the body of the HTML document
    document.body.appendChild(renderer.domElement)
    // Create a new Three.js clock
    const clock = new Clock()
    // Create the Renderer singleton
    world.createEntity().addComponent(RendererComponent, {
      renderer: renderer
    })
    // Kick off the loop
    renderer.setAnimationLoop(() => {
      world.execute(clock.getDelta(), clock.elapsedTime)
    })
  } else {
    // If we're not using the renderer, create a timer that calls a fixed update timestep
    setTimeout(() => {
      Timer({
        update: (delta, elapsedTime) => world.execute(delta, elapsedTime)
      }).start()
    }, 1)
  }
}
