import { detect, detectOS } from 'detect-browser'
import _ from 'lodash'
import { AudioListener, BufferGeometry, Euler, Mesh, PerspectiveCamera, Quaternion, Scene } from 'three'
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh'
import { loadDRACODecoder } from './assets/loaders/gltf/NodeDracoLoader'
import { AudioSystem } from './audio/systems/AudioSystem'
import { PositionalAudioSystem } from './audio/systems/PositionalAudioSystem'
import { AnimationSystem } from './avatar/AnimationSystem'
import { AvatarControllerSystem } from './avatar/AvatarControllerSystem'
import { ClientAvatarSpawnSystem } from './avatar/ClientAvatarSpawnSystem'
import { ServerAvatarSpawnSystem, SpawnPoints } from './avatar/ServerAvatarSpawnSystem'
import { BotHookFunctions, BotHookSystem } from './bot/functions/botHookFunctions'
import { CameraSystem } from './camera/systems/CameraSystem'
import { Timer } from './common/functions/Timer'
import { DebugHelpersSystem } from './debug/systems/DebugHelpersSystem'
import { Engine } from './ecs/classes/Engine'
import { EngineEvents } from './ecs/classes/EngineEvents'
import { createWorld, reset } from './ecs/functions/EngineFunctions'
import { injectSystem, registerSystem } from './ecs/functions/SystemFunctions'
import { SystemUpdateType } from './ecs/functions/SystemUpdateType'
import { DefaultInitializationOptions, EngineSystemPresets, InitializeOptions } from './initializationOptions'
import { addClientInputListeners, removeClientInputListeners } from './input/functions/clientInputListeners'
import { ClientInputSystem } from './input/systems/ClientInputSystem'
import { EquippableSystem } from './interaction/systems/EquippableSystem'
import { InteractiveSystem } from './interaction/systems/InteractiveSystem'
import { AutopilotSystem } from './navigation/systems/AutopilotSystem'
import { Network } from './networking/classes/Network'
import { MediaStreamSystem } from './networking/systems/MediaStreamSystem'
import { ParticleSystem } from './particles/systems/ParticleSystem'
import { InterpolationSystem } from './physics/systems/InterpolationSystem'
import { PhysicsSystem } from './physics/systems/PhysicsSystem'
import { configCanvasElement } from './renderer/functions/canvas'
import { HighlightSystem } from './renderer/HighlightSystem'
import { WebGLRendererSystem } from './renderer/WebGLRendererSystem'
import { SceneObjectSystem } from './scene/systems/SceneObjectSystem'
import { TransformSystem } from './transform/systems/TransformSystem'
import { XRSystem } from './xr/systems/XRSystem'
import { FontManager } from './xrui/classes/FontManager'
import { XRUISystem } from './xrui/systems/XRUISystem'
import { AvatarLoadingSystem } from './avatar/AvatarLoadingSystem'
import { MapUpdateSystem } from './map/MapUpdateSystem'
import { NamedEntitiesSystem } from './scene/systems/NamedEntitiesSystem'
import { OutgoingNetworkSystem } from './networking/systems/OutgoingNetworkSystem'
import { IncomingNetworkSystem } from './networking/systems/IncomingNetworkSystem'
import { ProximitySystem } from './proximityChecker/systems/ProximitySystem'
import { FollowSystem } from './navigation/systems/FollowSystem'
import { FixedPipelineSystem } from './ecs/functions/FixedPipelineSystem'
import { AvatarSystem } from './avatar/AvatarSystem'

// @ts-ignore
Quaternion.prototype.toJSON = function () {
  return { x: this._x, y: this._y, z: this._z, w: this._w }
}

// @ts-ignore
Euler.prototype.toJSON = function () {
  return { x: this._x, y: this._y, z: this._z, order: this._order }
}

Mesh.prototype.raycast = acceleratedRaycast
BufferGeometry.prototype['disposeBoundsTree'] = disposeBoundsTree
BufferGeometry.prototype['computeBoundsTree'] = computeBoundsTree

const configureClient = async (options: Required<InitializeOptions>) => {
  const canvas = configCanvasElement(options.renderer.canvasId!)

  Engine.audioListener = new AudioListener()
  console.log(Engine.audioListener)

  Engine.scene = new Scene()
  EngineEvents.instance.once(EngineEvents.EVENTS.JOINED_WORLD, () => {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl')!
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')!
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    const enableRenderer = !/SwiftShader/.test(renderer)
    canvas.remove()
    EngineEvents.instance.dispatchEvent({
      type: EngineEvents.EVENTS.ENABLE_SCENE,
      renderer: enableRenderer,
      physics: true
    })
    Engine.hasJoinedWorld = true
  })

  if (options.scene.disabled !== true) {
    Engine.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000)
    Engine.camera.layers.enableAll()
    Engine.scene.add(Engine.camera)
    Engine.camera.add(Engine.audioListener)
    addClientInputListeners(canvas)
  }

  Network.instance = new Network()

  const { schema } = options.networking

  if (schema) {
    Network.instance.schema = schema
    if (schema.transport) Network.instance.transport = new schema.transport()
  }

  await FontManager.instance.getDefaultFont()

  globalThis.botHooks = BotHookFunctions
  globalThis.Engine = Engine
  globalThis.EngineEvents = EngineEvents
  globalThis.Network = Network

  registerClientSystems(options, canvas)
}

const configureEditor = async (options: Required<InitializeOptions>) => {
  Engine.scene = new Scene()

  Engine.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000)
  Engine.camera.layers.enableAll()
  Engine.scene.add(Engine.camera)

  registerEditorSystems(options)
}

const configureServer = async (options: Required<InitializeOptions>) => {
  Engine.scene = new Scene()
  Network.instance = new Network()

  const { schema, app } = options.networking
  Network.instance.schema = schema
  Network.instance.transport = new schema.transport(app)

  if (
    process.env.SERVER_MODE !== undefined &&
    (process.env.SERVER_MODE === 'realtime' || process.env.SERVER_MODE === 'local')
  ) {
    Network.instance.transport.initialize()
    Network.instance.isInitialized = true
  }

  EngineEvents.instance.once(EngineEvents.EVENTS.JOINED_WORLD, () => {
    console.log('joined world')
    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.ENABLE_SCENE, renderer: true, physics: true })
    Engine.hasJoinedWorld = true
  })

  await loadDRACODecoder()

  new SpawnPoints()

  registerServerSystems(options)
}

const registerClientSystems = (options: Required<InitializeOptions>, canvas: HTMLCanvasElement) => {
  if (options.scene.disabled) {
    registerSystem(SystemUpdateType.Free, IncomingNetworkSystem)
    registerSystem(SystemUpdateType.Free, OutgoingNetworkSystem)
    return
  }

  // Network (Incoming)
  registerSystem(SystemUpdateType.Free, IncomingNetworkSystem)

  // Input
  registerSystem(SystemUpdateType.Free, ClientInputSystem)
  registerSystem(SystemUpdateType.Free, XRSystem)
  registerSystem(SystemUpdateType.Free, CameraSystem)
  registerSystem(SystemUpdateType.Free, BotHookSystem)

  // Fixed Systems
  registerSystem(SystemUpdateType.Free, FixedPipelineSystem, { updatesPerSecond: 60 })

  // Input Systems
  // registerSystem(SystemUpdateType.Fixed, AutopilotSystem)

  // Maps & Navigation
  // registerSystem(SystemUpdateType.Fixed, MapUpdateSystem)
  // registerSystem(SystemUpdateType.Fixed, ProximitySystem)
  // registerSystem(SystemUpdateType.Fixed, FollowSystem)

  // Avatar Systems
  registerSystem(SystemUpdateType.Fixed, InterpolationSystem)
  registerSystem(SystemUpdateType.Fixed, ClientAvatarSpawnSystem)
  registerSystem(SystemUpdateType.Fixed, AvatarSystem)
  registerSystem(SystemUpdateType.Fixed, AvatarControllerSystem)

  // Scene Systems
  registerSystem(SystemUpdateType.Fixed, EquippableSystem)
  registerSystem(SystemUpdateType.Fixed, SceneObjectSystem)
  registerSystem(SystemUpdateType.Fixed, NamedEntitiesSystem)
  registerSystem(SystemUpdateType.Fixed, TransformSystem)
  registerSystem(SystemUpdateType.Fixed, PhysicsSystem, {
    simulationEnabled: options.physics.simulationEnabled
  })

  // Camera & UI systems
  registerSystem(SystemUpdateType.Free, MediaStreamSystem)
  registerSystem(SystemUpdateType.Free, XRUISystem)
  registerSystem(SystemUpdateType.Free, InteractiveSystem)

  // Audio Systems
  registerSystem(SystemUpdateType.Free, AudioSystem)
  registerSystem(SystemUpdateType.Free, PositionalAudioSystem)

  // Animation Systems
  registerSystem(SystemUpdateType.Free, AvatarLoadingSystem)
  registerSystem(SystemUpdateType.Free, AnimationSystem)
  registerSystem(SystemUpdateType.Free, ParticleSystem)
  registerSystem(SystemUpdateType.Free, DebugHelpersSystem)
  registerSystem(SystemUpdateType.Free, HighlightSystem)
  registerSystem(SystemUpdateType.Free, WebGLRendererSystem, { canvas, enabled: !options.renderer.disabled })

  // Network (Outgoing)
  registerSystem(SystemUpdateType.Free, OutgoingNetworkSystem)
}

const registerEditorSystems = (options: Required<InitializeOptions>) => {
  // Scene Systems
  // registerSystem(SystemUpdateType.Fixed, GameManagerSystem)
  registerSystem(SystemUpdateType.Fixed, NamedEntitiesSystem)
  registerSystem(SystemUpdateType.Fixed, TransformSystem)
  registerSystem(SystemUpdateType.Fixed, PhysicsSystem, {
    simulationEnabled: options.physics.simulationEnabled
  })

  // Miscellaneous Systems
  registerSystem(SystemUpdateType.Fixed, ParticleSystem)
  registerSystem(SystemUpdateType.Fixed, DebugHelpersSystem)
}

const registerServerSystems = (options: Required<InitializeOptions>) => {
  registerSystem(SystemUpdateType.Free, FixedPipelineSystem, { updatesPerSecond: 60 })

  // Network Incoming Systems
  registerSystem(SystemUpdateType.Fixed, IncomingNetworkSystem, { ...options.networking }) // first
  registerSystem(SystemUpdateType.Fixed, MediaStreamSystem)

  // Input Systems
  registerSystem(SystemUpdateType.Fixed, AvatarSystem)

  // Scene Systems
  registerSystem(SystemUpdateType.Fixed, NamedEntitiesSystem)
  registerSystem(SystemUpdateType.Fixed, EquippableSystem)
  registerSystem(SystemUpdateType.Fixed, TransformSystem)
  registerSystem(SystemUpdateType.Fixed, PhysicsSystem, {
    simulationEnabled: options.physics.simulationEnabled
  })

  // Miscellaneous Systems
  registerSystem(SystemUpdateType.Fixed, ServerAvatarSpawnSystem)

  // Network Outgoing Systems
  registerSystem(SystemUpdateType.Fixed, OutgoingNetworkSystem)
}

export const initializeEngine = async (initOptions: InitializeOptions = {}): Promise<void> => {
  const options: Required<InitializeOptions> = _.defaultsDeep({}, initOptions, DefaultInitializationOptions)
  const sceneWorld = createWorld()
  Engine.currentWorld = sceneWorld

  Engine.initOptions = options
  Engine.offlineMode = typeof options.networking.schema.transport === 'undefined'
  Engine.publicPath = options.publicPath

  // Browser state set
  if (options.type !== EngineSystemPresets.SERVER && navigator && window) {
    const browser = detect()
    const os = detectOS(navigator.userAgent)

    // Add iOS and safari flag to window object -- To use it for creating an iOS compatible WebGLRenderer for example
    ;(window as any).iOS =
      os === 'iOS' ||
      /iPad|iPhone|iPod/.test(navigator.platform) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    ;(window as any).safariWebBrowser = browser?.name === 'safari'

    Engine.isHMD = /Oculus/i.test(navigator.userAgent) // TODO: more HMDs;
    Engine.xrSupported = await (navigator as any).xr?.isSessionSupported('immersive-vr')
  }

  // Config Engine based on passed type
  if (options.type === EngineSystemPresets.CLIENT) {
    await configureClient(options)
  } else if (options.type === EngineSystemPresets.EDITOR) {
    await configureEditor(options)
  } else if (options.type === EngineSystemPresets.SERVER) {
    await configureServer(options)
  }

  options.systems?.forEach((init) => {
    injectSystem(init)
  })

  await sceneWorld.initSystems()

  const executeWorlds = (delta, elapsedTime) => {
    for (const world of Engine.worlds) {
      Engine.currentWorld = world
      world.execute(delta, elapsedTime)
    }
    Engine.currentWorld = null
  }

  Engine.engineTimer = Timer(executeWorlds)

  // Engine type specific post configuration work
  if (options.type === EngineSystemPresets.CLIENT) {
    EngineEvents.instance.once(EngineEvents.EVENTS.SCENE_LOADED, () => {
      Engine.engineTimer.start()
    })
    const onUserEngage = () => {
      Engine.hasEngaged = true
      EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.USER_ENGAGE })
      ;['click', 'touchstart', 'touchend', 'pointerdown'].forEach((type) => {
        window.addEventListener(type, onUserEngage)
      })
    }
    ;['click', 'touchstart', 'touchend', 'pointerdown'].forEach((type) => {
      window.addEventListener(type, onUserEngage)
    })

    EngineEvents.instance.once(EngineEvents.EVENTS.CONNECT, ({ id }) => {
      Network.instance.isInitialized = true
      Network.instance.userId = id
    })
  } else if (options.type === EngineSystemPresets.SERVER) {
    Engine.engineTimer.start()
  }

  // Mark engine initialized
  Engine.isInitialized = true
  EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.INITIALIZED_ENGINE })
}

export const shutdownEngine = async () => {
  if (Engine.initOptions?.type === EngineSystemPresets.CLIENT) {
    removeClientInputListeners()
  }

  Engine.engineTimer?.clear()
  Engine.engineTimer = null

  await reset()
}
