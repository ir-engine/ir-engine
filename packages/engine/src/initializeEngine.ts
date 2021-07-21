import _ from 'lodash'
import { detect, detectOS } from 'detect-browser'
import { AudioListener, BufferGeometry, Mesh, PerspectiveCamera, Quaternion, Scene } from 'three'
import { acceleratedRaycast, disposeBoundsTree, computeBoundsTree } from 'three-mesh-bvh'
import { PositionalAudioSystem } from './audio/systems/PositionalAudioSystem'
import { CameraSystem } from './camera/systems/CameraSystem'
import { CharacterControllerSystem } from './character/CharacterControllerSystem'
import { now } from './common/functions/now'
import { DebugHelpersSystem } from './debug/systems/DebugHelpersSystem'
import { DefaultInitializationOptions, InitializeOptions, EngineSystemPresets } from './initializationOptions'
import { Engine } from './ecs/classes/Engine'
import { EngineEvents } from './ecs/classes/EngineEvents'
import { registerSystem } from './ecs/functions/SystemFunctions'
import { GameManagerSystem } from './game/systems/GameManagerSystem'
import { ActionSystem } from './input/systems/ActionSystem'
import { ClientInputSystem } from './input/systems/ClientInputSystem'
import { InteractiveSystem } from './interaction/systems/InteractiveSystem'
import { Network } from './networking/classes/Network'
import { ClientNetworkStateSystem } from './networking/systems/ClientNetworkStateSystem'
import { ClientNetworkSystem } from './networking/systems/ClientNetworkSystem'
import { MediaStreamSystem } from './networking/systems/MediaStreamSystem'
import { ParticleSystem } from './particles/systems/ParticleSystem'
import { PhysicsSystem } from './physics/systems/PhysicsSystem'
import { configCanvasElement } from './renderer/functions/canvas'
import { HighlightSystem } from './renderer/HighlightSystem'
import { TransformSystem } from './transform/systems/TransformSystem'
import { UISystem } from './xrui/systems/UISystem'
import { XRSystem } from './xr/systems/XRSystem'
import { WebGLRendererSystem } from './renderer/WebGLRendererSystem'
import { Timer } from './common/functions/Timer'
import { execute } from './ecs/functions/EngineFunctions'
import { SystemUpdateType } from './ecs/functions/SystemUpdateType'
import { ServerNetworkIncomingSystem } from './networking/systems/ServerNetworkIncomingSystem'
import { ServerNetworkOutgoingSystem } from './networking/systems/ServerNetworkOutgoingSystem'
import { ServerSpawnSystem } from './scene/systems/ServerSpawnSystem'
import { SceneObjectSystem } from './scene/systems/SceneObjectSystem'
import { ActiveSystems, System } from './ecs/classes/System'
import { AudioSystem } from './audio/systems/AudioSystem'
import { setupBotHooks } from './bot/functions/botHookFunctions'
import { AnimationSystem } from './character/AnimationSystem'
import { InterpolationSystem } from './physics/systems/InterpolationSystem'

// @ts-ignore
Quaternion.prototype.toJSON = function () {
  return { x: this._x, y: this._y, z: this._z, w: this._w }
}
Mesh.prototype.raycast = acceleratedRaycast
BufferGeometry.prototype['disposeBoundsTree'] = disposeBoundsTree
BufferGeometry.prototype['computeBoundsTree'] = computeBoundsTree

const configureClient = async (options: InitializeOptions) => {
  const canvas = configCanvasElement(options.renderer.canvasId)

  Engine.audioListener = new AudioListener()

  Engine.scene = new Scene()
  EngineEvents.instance.once(EngineEvents.EVENTS.JOINED_WORLD, () => {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl')
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
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

  setupBotHooks()

  registerClientSystems(options, canvas)
}

const configureEditor = async (options: InitializeOptions) => {
  Engine.scene = new Scene()

  Engine.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000)
  Engine.camera.layers.enableAll()
  Engine.scene.add(Engine.camera)

  registerEditorSystems(options)
}

const configureServer = async (options: InitializeOptions) => {
  Engine.scene = new Scene()
  Network.instance = new Network()

  EngineEvents.instance.once(EngineEvents.EVENTS.JOINED_WORLD, () => {
    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.ENABLE_SCENE, renderer: true, physics: true })
    Engine.hasJoinedWorld = true
  })

  registerServerSystems(options)
}

const registerClientSystems = (options: InitializeOptions, canvas: HTMLCanvasElement) => {
  // Network Systems
  Network.instance = new Network()

  if (!Engine.offlineMode) {
    Network.instance.schema = options.networking.schema
    registerSystem(ClientNetworkSystem, { ...options.networking, priority: 0 })
  }

  registerSystem(ClientNetworkStateSystem, { priority: 1 })
  registerSystem(MediaStreamSystem, { priority: 2 })

  if (options.renderer.disabled) return

  // Input Systems
  registerSystem(ClientInputSystem, { useWebXR: Engine.xrSupported, priority: 1 })

  // Render systems
  registerSystem(XRSystem, { priority: 1 }) // Free
  registerSystem(CameraSystem, { priority: 2 }) // Free
  registerSystem(WebGLRendererSystem, { priority: 3, canvas }) // Free

  // Input Systems
  registerSystem(UISystem, { priority: 2 }) // Free
  registerSystem(ActionSystem, { priority: 3 })
  registerSystem(CharacterControllerSystem, { priority: 4 })
  registerSystem(AnimationSystem, { priority: 5 })

  // Scene Systems
  registerSystem(InteractiveSystem, { priority: 6 })
  registerSystem(GameManagerSystem, { priority: 7 })
  registerSystem(TransformSystem, { priority: 8 })
  registerSystem(InterpolationSystem, { priority: 9 })
  registerSystem(PhysicsSystem, {
    simulationEnabled: options.physics.simulationEnabled,
    worker: options.physics.physxWorker,
    priority: 10
  })

  // Miscellaneous Systems
  registerSystem(HighlightSystem, { priority: 11 })
  registerSystem(ParticleSystem, { priority: 12 })
  registerSystem(DebugHelpersSystem, { priority: 13 })
  registerSystem(AudioSystem, { priority: 14 })
  registerSystem(PositionalAudioSystem, { priority: 15 })
  registerSystem(SceneObjectSystem, { priority: 16 })
}

const registerEditorSystems = (options: InitializeOptions) => {
  // Scene Systems
  registerSystem(GameManagerSystem, { priority: 6 })
  registerSystem(TransformSystem, { priority: 7 })
  registerSystem(PhysicsSystem, {
    simulationEnabled: options.physics.simulationEnabled,
    worker: options.physics.physxWorker,
    priority: 8
  })

  // Miscellaneous Systems
  registerSystem(ParticleSystem, { priority: 10 })
  registerSystem(DebugHelpersSystem, { priority: 11 })
}

const registerServerSystems = (options: InitializeOptions) => {
  // Network Systems
  registerSystem(ServerNetworkIncomingSystem, { ...options.networking, priority: 1 }) // first
  registerSystem(ServerNetworkOutgoingSystem, { ...options.networking, priority: 100 }) // last
  registerSystem(MediaStreamSystem, { priority: 3 })

  // Input Systems
  registerSystem(CharacterControllerSystem, { priority: 4 })

  // Scene Systems
  registerSystem(InteractiveSystem, { priority: 5 })
  registerSystem(GameManagerSystem, { priority: 6 })
  registerSystem(TransformSystem, { priority: 7 })
  registerSystem(PhysicsSystem, {
    simulationEnabled: options.physics.simulationEnabled,
    worker: options.physics.physxWorker,
    priority: 8
  })

  // Miscellaneous Systems
  registerSystem(ServerSpawnSystem, { priority: 9 })
}

export const initializeEngine = async (initOptions: InitializeOptions = {}): Promise<void> => {
  const options: InitializeOptions = _.defaultsDeep({}, initOptions, DefaultInitializationOptions)

  Engine.gameModes = options.gameModes
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

  options.systems?.forEach(({ system, args }) => {
    registerSystem(system, args)
  })

  // Initialize all registered systems
  await Promise.all(Engine.systems.map((system) => system.initialize()))

  // Set timer
  Engine.engineTimer = Timer(
    {
      networkUpdate: (delta: number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Network),
      fixedUpdate: (delta: number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Fixed),
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

    EngineEvents.instance.once(ClientNetworkSystem.EVENTS.CONNECT, ({ id }) => {
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
