import { detect, detectOS } from 'detect-browser'
import _ from 'lodash'
import { AudioListener, BufferGeometry, Euler, Mesh, PerspectiveCamera, Quaternion, Scene } from 'three'
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh'
import { loadDRACODecoder } from './assets/loaders/gltf/NodeDracoLoader'
import { SpawnPoints } from './avatar/ServerAvatarSpawnSystem'
import { BotHookFunctions } from './bot/functions/botHookFunctions'
import { Timer } from './common/functions/Timer'
import { Engine } from './ecs/classes/Engine'
import { EngineEvents } from './ecs/classes/EngineEvents'
import { createWorld, reset } from './ecs/functions/EngineFunctions'
import { injectSystem, registerSystem } from './ecs/functions/SystemFunctions'
import { SystemUpdateType } from './ecs/functions/SystemUpdateType'
import { DefaultInitializationOptions, EngineSystemPresets, InitializeOptions } from './initializationOptions'
import { addClientInputListeners, removeClientInputListeners } from './input/functions/clientInputListeners'
import { Network } from './networking/classes/Network'
import { configCanvasElement } from './renderer/functions/canvas'
import { FontManager } from './xrui/classes/FontManager'

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

const registerClientSystems = async (options: Required<InitializeOptions>, canvas: HTMLCanvasElement) => {
  if (options.scene.disabled) {
    registerSystem(
      SystemUpdateType.Free,
      async () => (await import('./networking/systems/IncomingNetworkSystem')).default
    )
    registerSystem(
      SystemUpdateType.Free,
      async () => (await import('./networking/systems/OutgoingNetworkSystem')).default
    )
    return
  }

  // Network (Incoming)
  registerSystem(
    SystemUpdateType.Free,
    async () => (await import('./networking/systems/IncomingNetworkSystem')).default
  )

  // Input
  registerSystem(SystemUpdateType.Free, async () => (await import('./input/systems/ClientInputSystem')).default)
  registerSystem(SystemUpdateType.Free, async () => (await import('./xr/systems/XRSystem')).default)
  registerSystem(SystemUpdateType.Free, async () => (await import('./camera/systems/CameraSystem')).default)
  registerSystem(SystemUpdateType.Free, async () => (await import('./bot/systems/BotHookSystem')).default)

  // INPUT INJECTION POINT

  // Fixed Systems
  registerSystem(SystemUpdateType.Free, async () => (await import('./ecs/functions/FixedPipelineSystem')).default, {
    updatesPerSecond: 60
  })

  // PRE FIXED INJECTION POINT

  // Input Systems
  registerSystem(SystemUpdateType.Fixed, async () => (await import('./navigation/systems/AutopilotSystem')).default)

  // Maps & Navigation
  registerSystem(SystemUpdateType.Fixed, async () => (await import('./map/MapUpdateSystem')).default)
  registerSystem(
    SystemUpdateType.Fixed,
    async () => (await import('./proximityChecker/systems/ProximitySystem')).default
  )
  registerSystem(SystemUpdateType.Fixed, async () => (await import('./navigation/systems/FollowSystem')).default)

  // Avatar Systems
  registerSystem(SystemUpdateType.Fixed, async () => (await import('./physics/systems/InterpolationSystem')).default)
  registerSystem(SystemUpdateType.Fixed, async () => (await import('./avatar/ClientAvatarSpawnSystem')).default)
  registerSystem(SystemUpdateType.Fixed, async () => (await import('./avatar/AvatarSystem')).default)
  registerSystem(SystemUpdateType.Fixed, async () => (await import('./avatar/AvatarControllerSystem')).default)

  // FIXED INJECTION POINT

  // Scene Systems
  registerSystem(SystemUpdateType.Fixed, async () => (await import('./interaction/systems/EquippableSystem')).default)
  registerSystem(SystemUpdateType.Fixed, async () => (await import('./scene/systems/SceneObjectSystem')).default)
  registerSystem(SystemUpdateType.Fixed, async () => (await import('./scene/systems/NamedEntitiesSystem')).default)
  registerSystem(SystemUpdateType.Fixed, async () => (await import('./transform/systems/TransformSystem')).default)
  registerSystem(SystemUpdateType.Fixed, async () => (await import('./physics/systems/PhysicsSystem')).default, {
    simulationEnabled: options.physics.simulationEnabled
  })

  // POST FIXED INJECTION POINT

  // Camera & UI systems
  registerSystem(SystemUpdateType.Free, async () => (await import('./networking/systems/MediaStreamSystem')).default)
  registerSystem(SystemUpdateType.Free, async () => (await import('./xrui/systems/XRUISystem')).default)
  registerSystem(SystemUpdateType.Free, async () => (await import('./interaction/systems/InteractiveSystem')).default)

  // UI INJECTION POINT

  // Audio Systems
  registerSystem(SystemUpdateType.Free, async () => (await import('./audio/systems/AudioSystem')).default)
  registerSystem(SystemUpdateType.Free, async () => (await import('./audio/systems/PositionalAudioSystem')).default)

  // ANIMATION INJECTION POINT

  // Animation Systems
  registerSystem(SystemUpdateType.Free, async () => (await import('./avatar/AvatarLoadingSystem')).default)
  registerSystem(SystemUpdateType.Free, async () => (await import('./avatar/AnimationSystem')).default)
  registerSystem(SystemUpdateType.Free, async () => (await import('./particles/systems/ParticleSystem')).default)
  registerSystem(SystemUpdateType.Free, async () => (await import('./debug/systems/DebugHelpersSystem')).default)
  registerSystem(SystemUpdateType.Free, async () => (await import('./renderer/HighlightSystem')).default)
  registerSystem(SystemUpdateType.Free, async () => (await import('./renderer/WebGLRendererSystem')).default, {
    canvas,
    enabled: !options.renderer.disabled
  })

  // Network (Outgoing)
  registerSystem(
    SystemUpdateType.Free,
    async () => (await import('./networking/systems/OutgoingNetworkSystem')).default
  )
}

const registerEditorSystems = (options: Required<InitializeOptions>) => {
  // Scene Systems
  registerSystem(SystemUpdateType.Fixed, async () => (await import('./scene/systems/NamedEntitiesSystem')).default)
  registerSystem(SystemUpdateType.Fixed, async () => (await import('./transform/systems/TransformSystem')).default)
  registerSystem(SystemUpdateType.Fixed, async () => (await import('./physics/systems/PhysicsSystem')).default, {
    simulationEnabled: options.physics.simulationEnabled
  })

  // Miscellaneous Systems
  registerSystem(SystemUpdateType.Fixed, async () => (await import('./particles/systems/ParticleSystem')).default)
  registerSystem(SystemUpdateType.Fixed, async () => (await import('./debug/systems/DebugHelpersSystem')).default)
}

const registerServerSystems = (options: Required<InitializeOptions>) => {
  registerSystem(SystemUpdateType.Free, async () => (await import('./ecs/functions/FixedPipelineSystem')).default, {
    updatesPerSecond: 60
  })

  // Network Incoming Systems
  registerSystem(
    SystemUpdateType.Fixed,
    async () => (await import('./networking/systems/IncomingNetworkSystem')).default
  ) // first
  registerSystem(SystemUpdateType.Fixed, async () => (await import('./networking/systems/MediaStreamSystem')).default)

  // Input Systems
  registerSystem(SystemUpdateType.Fixed, async () => (await import('./avatar/AvatarSystem')).default)

  // Scene Systems
  registerSystem(SystemUpdateType.Fixed, async () => (await import('./scene/systems/NamedEntitiesSystem')).default)
  registerSystem(SystemUpdateType.Fixed, async () => (await import('./transform/systems/TransformSystem')).default)
  registerSystem(SystemUpdateType.Fixed, async () => (await import('./physics/systems/PhysicsSystem')).default, {
    simulationEnabled: options.physics.simulationEnabled
  })

  // Miscellaneous Systems
  registerSystem(SystemUpdateType.Fixed, async () => (await import('./avatar/ServerAvatarSpawnSystem')).default)

  // Network Outgoing Systems
  registerSystem(
    SystemUpdateType.Fixed,
    async () => (await import('./networking/systems/OutgoingNetworkSystem')).default
  )
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
