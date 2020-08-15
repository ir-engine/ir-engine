import { AmbientLight, Camera, Clock, GridHelper, PerspectiveCamera, Scene } from "three"
import { CameraSystem } from "./camera"
import { isBrowser, SceneManager, Timer } from "./common"
import { addObject3DComponent } from "./common/defaults/behaviors/Object3DBehaviors"
import { registerSystem } from "./ecs/functions/SystemFunctions"
import { createEntity } from "./ecs/functions/EntityFunctions"
import { execute, initializeWorld, World } from "./ecs/classes/World"
import { DefaultInputSchema, InputSystem } from "./input"
import { DefaultNetworkSchema, MediaStreamSystem, NetworkSystem } from "./networking"
import { KeyframeSystem, ParticleSystem } from "./particles"
// import { PhysicsSystem, WheelSystem } from "../sandbox/physics"
import { WebGLRendererSystem, RendererComponent } from "./renderer"
import { DefaultStateSchema, StateSystem } from "./state"
import { DefaultSubscriptionSchema, SubscriptionSystem } from "./subscription"
import { TransformSystem, TransformComponent, TransformParentComponent } from "./transform"
import { registerComponent } from "./ecs"
import { PhysicsSystem } from "."
import { WheelSystem } from "../sandbox/physics/systems/WheelSystem"

export const DefaultInitializationOptions = {
  debug: true,
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

export function initialize(options: any = DefaultInitializationOptions) {
  console.log("Initializing")
  // Create a new world -- this holds all of our simulation state, entities, etc
  initializeWorld()
  // Create a new three.js scene
  const scene = new Scene()
  // Create a new scene manager -- this is a singleton that holds our scene data
  World.sceneManager = new SceneManager()
  // Add the three.js scene to our manager -- it is now available anywhere
  World.sceneManager.scene = scene

  //Transform
  if (options.transform && options.transform.enabled) {
    registerComponent(TransformComponent)
    registerComponent(TransformParentComponent)
    registerSystem(TransformSystem, { priority: 900 })
  }

  // If we're a browser (we don't need to create or render on the server)
  if (isBrowser) {
    // Create a new three.js camera
    const camera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000)
    // Add the camera to the camera manager so it's available anywhere
    World.camera = new Camera()
    // Add the camera to the three.js scene
    scene.add(camera)

    // Camera system and component setup
    if (options.camera && options.camera.enabled) registerSystem(CameraSystem)
  }

  // Input
  if (options.input && options.input.enabled && isBrowser) {
    registerSystem(InputSystem, { useWebXR: options.withWebXRInput })
  }

  // Networking
  if (options.networking && options.networking.enabled) {
    registerSystem(NetworkSystem)

    // Do we want audio and video streams?
    if (options.networking.supportsMediaStreams == true) {
      registerSystem(MediaStreamSystem)
    } else {
      console.warn("Does not support media streams")
    }
  }

  // State
  if (options.state && options.state.enabled) {
    registerSystem(StateSystem)
  }

  // Subscriptions
  if (options.subscriptions && options.subscriptions.enabled) {
    registerSystem(SubscriptionSystem)
  }
  // Physics
  if (options.physics && options.physics.enabled) {
    registerSystem(PhysicsSystem)
    registerSystem(WheelSystem)
  }
  // Particles
  if (options.particles && options.particles.enabled) {
    registerSystem(ParticleSystem)
    registerSystem(KeyframeSystem)
  }

  // Rendering
  if (options.renderer && options.renderer.enabled) {
    registerSystem(WebGLRendererSystem, { priority: 999 })
  }

  // Start our timer!
  if (isBrowser) setTimeout(startTimerForClient, 1000)
  // TODO: Remove
  // If we're not using the renderer, create a timer that calls a fixed update timestep
  else startTimerForServer()

  if (options.debug === true) {
    // If we're in debug, add a gridhelper
    const gridHelper = new GridHelper(1000, 100, 0xffffff, 0xeeeeee)
    scene.add(gridHelper)

    // Add an ambient light to the scene
    addObject3DComponent(createEntity(), { obj: AmbientLight })
  }
}

export function startTimerForClient() {
  // Create a new Three.js clock
  const clock = new Clock()
  // Kick off the loop
  RendererComponent.instance.renderer.setAnimationLoop(() => {
    execute(clock.getDelta(), clock.elapsedTime)
  })
}

export function startTimerForServer() {
  setTimeout(() => {
    Timer({
      update: (delta, elapsedTime) => execute(delta, elapsedTime)
    }).start()
  }, 1)
}
