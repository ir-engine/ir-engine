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
import { setupBotHooks } from './bot/functions/botHookFunctions'
import { CameraSystem } from './camera/systems/CameraSystem'
import { now } from './common/functions/now'
import { Timer } from './common/functions/Timer'
import { DebugHelpersSystem } from './debug/systems/DebugHelpersSystem'
import { Engine } from './ecs/classes/Engine'
import { EngineEvents } from './ecs/classes/EngineEvents'
import { ActiveSystems } from './ecs/classes/System'
import { execute, reset } from './ecs/functions/EngineFunctions'
import { getSystem, registerSystem } from './ecs/functions/SystemFunctions'
import { SystemUpdateType } from './ecs/functions/SystemUpdateType'
import { GameManagerSystem } from './game/systems/GameManagerSystem'
import { DefaultInitializationOptions, EngineSystemPresets, InitializeOptions } from './initializationOptions'
import { addClientInputListeners, removeClientInputListeners } from './input/functions/clientInputListeners'
import { ClientInputSystem } from './input/systems/ClientInputSystem'
import { EquippableSystem } from './interaction/systems/EquippableSystem'
import { InteractiveSystem } from './interaction/systems/InteractiveSystem'
import { AutopilotSystem } from './navigation/systems/AutopilotSystem'
import { Network } from './networking/classes/Network'
import { ClientNetworkStateSystem } from './networking/systems/ClientNetworkStateSystem'
import { MediaStreamSystem } from './networking/systems/MediaStreamSystem'
import { ServerNetworkIncomingSystem } from './networking/systems/ServerNetworkIncomingSystem'
import { ServerNetworkOutgoingSystem } from './networking/systems/ServerNetworkOutgoingSystem'
import { ParticleSystem } from './particles/systems/ParticleSystem'
import { InterpolationSystem } from './physics/systems/InterpolationSystem'
import { PhysicsSystem } from './physics/systems/PhysicsSystem'
import { configCanvasElement } from './renderer/functions/canvas'
import { HighlightSystem } from './renderer/HighlightSystem'
import { VisibilitySystem } from './renderer/VisibleSystem'
import { WebGLRendererSystem } from './renderer/WebGLRendererSystem'
import { SceneObjectSystem } from './scene/systems/SceneObjectSystem'
import { TransformSystem } from './transform/systems/TransformSystem'
import { XRSystem } from './xr/systems/XRSystem'
import { FontManager } from './xrui/classes/FontManager'
import { UISystem } from './xrui/systems/UISystem'

// @ts-ignore
Quaternion.prototype.toJSON = function () {
  return { x: this._x, y: this._y, z: this._z, w: this._w }
}

// @ts-ignore
Euler.prototype.toJSON = function () {
  return { x: this._x, y: this._y, z: this._z }
}

Mesh.prototype.raycast = acceleratedRaycast
BufferGeometry.prototype['disposeBoundsTree'] = disposeBoundsTree
BufferGeometry.prototype['computeBoundsTree'] = computeBoundsTree

const configureClient = async (options: Required<InitializeOptions>) => {
  const canvas = configCanvasElement(options.renderer.canvasId!)

  Engine.audioListener = new AudioListener()

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

  if (options.renderer.disabled !== true) {
    Engine.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000)
    Engine.camera.layers.enableAll()
    Engine.scene.add(Engine.camera)
  }

  Network.instance = new Network()

  const { schema } = options.networking

  Network.instance.schema = schema
  Network.instance.transport = new schema.transport()

  await FontManager.instance.getDefaultFont()

  setupBotHooks()

  addClientInputListeners()

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
  // Network Systems

  !Engine.offlineMode && registerSystem(SystemUpdateType.Fixed, ClientNetworkStateSystem)

  registerSystem(SystemUpdateType.Fixed, MediaStreamSystem)

  if (options.renderer.disabled) return

  // Input Systems
  registerSystem(SystemUpdateType.Fixed, ClientInputSystem)

  // Input Systems
  registerSystem(SystemUpdateType.Fixed, UISystem)
  registerSystem(SystemUpdateType.Fixed, AvatarControllerSystem)
  registerSystem(SystemUpdateType.Fixed, AnimationSystem)
  registerSystem(SystemUpdateType.Fixed, AutopilotSystem)

  // Scene Systems
  registerSystem(SystemUpdateType.Fixed, InteractiveSystem)
  registerSystem(SystemUpdateType.Fixed, EquippableSystem)
  registerSystem(SystemUpdateType.Fixed, GameManagerSystem)
  registerSystem(SystemUpdateType.Fixed, TransformSystem)
  registerSystem(SystemUpdateType.Fixed, InterpolationSystem)
  registerSystem(SystemUpdateType.Fixed, PhysicsSystem, {
    simulationEnabled: options.physics.simulationEnabled,
    worker: options.physics.physxWorker
  })

  // Miscellaneous Systems
  registerSystem(SystemUpdateType.Fixed, ParticleSystem)
  registerSystem(SystemUpdateType.Fixed, DebugHelpersSystem)
  registerSystem(SystemUpdateType.Fixed, AudioSystem)
  registerSystem(SystemUpdateType.Fixed, PositionalAudioSystem)
  registerSystem(SystemUpdateType.Fixed, SceneObjectSystem)
  registerSystem(SystemUpdateType.Fixed, ClientAvatarSpawnSystem)

  // Free systems
  registerSystem(SystemUpdateType.Free, XRSystem)
  registerSystem(SystemUpdateType.Free, CameraSystem)
  registerSystem(SystemUpdateType.Free, WebGLRendererSystem, { canvas })
  registerSystem(SystemUpdateType.Free, HighlightSystem)
  registerSystem(SystemUpdateType.Free, VisibilitySystem)
}

const registerEditorSystems = (options: Required<InitializeOptions>) => {
  // Scene Systems
  registerSystem(SystemUpdateType.Fixed, GameManagerSystem)
  registerSystem(SystemUpdateType.Fixed, TransformSystem)
  registerSystem(SystemUpdateType.Fixed, PhysicsSystem, {
    simulationEnabled: options.physics.simulationEnabled,
    worker: options.physics.physxWorker
  })

  // Miscellaneous Systems
  registerSystem(SystemUpdateType.Fixed, ParticleSystem)
  registerSystem(SystemUpdateType.Fixed, DebugHelpersSystem)
}

const registerServerSystems = (options: Required<InitializeOptions>) => {
  // Network Incoming Systems
  registerSystem(SystemUpdateType.Fixed, ServerNetworkIncomingSystem, { ...options.networking }) // first
  registerSystem(SystemUpdateType.Fixed, MediaStreamSystem)

  // Input Systems
  registerSystem(SystemUpdateType.Fixed, AvatarControllerSystem)
  registerSystem(SystemUpdateType.Fixed, AutopilotSystem)

  // Scene Systems
  registerSystem(SystemUpdateType.Fixed, EquippableSystem)
  registerSystem(SystemUpdateType.Fixed, GameManagerSystem)
  registerSystem(SystemUpdateType.Fixed, TransformSystem)
  registerSystem(SystemUpdateType.Fixed, PhysicsSystem, {
    simulationEnabled: options.physics.simulationEnabled,
    worker: options.physics.physxWorker
  })

  // Miscellaneous Systems
  registerSystem(SystemUpdateType.Fixed, ServerAvatarSpawnSystem)

  // Network Outgoing Systems
  registerSystem(SystemUpdateType.Fixed, ServerNetworkOutgoingSystem) // last
}

export const initializeEngine = async (initOptions: InitializeOptions = {}): Promise<void> => {
  const options: Required<InitializeOptions> = _.defaultsDeep({}, initOptions, DefaultInitializationOptions)
  Engine.initOptions = options
  Engine.offlineMode = typeof options.networking.schema === 'undefined'
  Engine.publicPath = options.publicPath
  Engine.lastTime = now() / 1000
  Engine.activeSystems = new ActiveSystems()

  if (options.renderer && options.renderer.canvasId) {
    Engine.options.canvasId = options.renderer.canvasId
  }

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
    const system = new init.system(init.args)
    Engine.systems.push(system)
    if ('before' in init) {
      const BeforeSystem = init.before
      const updateType = BeforeSystem.updateType
      const before = getSystem(BeforeSystem)
      const idx = Engine.activeSystems[updateType].indexOf(before)
      Engine.activeSystems[updateType].splice(idx, 0, system)
    } else if ('after' in init) {
      const AfterSystem = init.after
      const updateType = AfterSystem.updateType
      const after = getSystem(AfterSystem)
      const idx = Engine.activeSystems[updateType].lastIndexOf(after) + 1
      Engine.activeSystems[updateType].splice(idx, 0, system)
    }
  })

  // Initialize all registered systems
  await Promise.all(Engine.systems.map((system) => system.initialize()))

  // Set timer
  Engine.engineTimer = Timer(
    {
      networkUpdate: (delta, elapsedTime) => execute(delta, elapsedTime, SystemUpdateType.Network),
      fixedUpdate: (delta, elapsedTime) => execute(delta, elapsedTime, SystemUpdateType.Fixed),
      update: (delta, elapsedTime) => execute(delta, elapsedTime, SystemUpdateType.Free)
    },
    Engine.physicsFrameRate,
    Engine.networkFramerate
  )

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

    EngineEvents.instance.once(ClientNetworkStateSystem.EVENTS.CONNECT, ({ id }) => {
      Network.instance.isInitialized = true
      Network.instance.userId = id
    })
  } else {
    Engine.engineTimer.start()
  }

  // Mark engine initialized
  Engine.isInitialized = true
  EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.INITIALIZED_ENGINE })
}

export const shutdownEngine = async () => {
  if (Engine.initOptions.type === EngineSystemPresets.CLIENT) {
    removeClientInputListeners()
  }

  Engine.engineTimer?.clear()
  Engine.engineTimer = null

  await reset()
}
