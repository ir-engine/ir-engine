import { detect, detectOS } from 'detect-browser'
import _ from 'lodash'
import { BufferGeometry, Euler, Mesh, PerspectiveCamera, Quaternion, Scene } from 'three'
import { AudioListener } from './audio/StereoAudioListener'
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh'
import { loadDRACODecoder } from './assets/loaders/gltf/NodeDracoLoader'
import { SpawnPoints } from './avatar/ServerAvatarSpawnSystem'
import { BotHookFunctions } from './bot/functions/botHookFunctions'
import { Timer } from './common/functions/Timer'
import { Engine } from './ecs/classes/Engine'
import { EngineEvents } from './ecs/classes/EngineEvents'
import { reset } from './ecs/functions/EngineFunctions'
import { InjectionPoint, injectSystem, registerSystem, registerSystemWithArgs } from './ecs/functions/SystemFunctions'
import { SystemUpdateType } from './ecs/functions/SystemUpdateType'
import { DefaultInitializationOptions, EngineSystemPresets, InitializeOptions } from './initializationOptions'
import { addClientInputListeners, removeClientInputListeners } from './input/functions/clientInputListeners'
import { Network } from './networking/classes/Network'
import { configCanvasElement } from './renderer/functions/canvas'
import { FontManager } from './xrui/classes/FontManager'
import { createWorld } from './ecs/classes/World'

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

  // https://bugs.chromium.org/p/chromium/issues/detail?id=1106389
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

  await registerClientSystems(options, canvas)
}

const configureEditor = async (options: Required<InitializeOptions>) => {
  Engine.scene = new Scene()

  Engine.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000)
  Engine.camera.layers.enableAll()
  Engine.scene.add(Engine.camera)

  await registerEditorSystems(options)
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

  await registerServerSystems(options)
}

const registerClientSystems = async (options: Required<InitializeOptions>, canvas: HTMLCanvasElement) => {
  if (options.scene.disabled) {
    registerSystem(SystemUpdateType.Free, import('./networking/systems/IncomingNetworkSystem'))
    registerSystem(SystemUpdateType.Free, import('./networking/systems/OutgoingNetworkSystem'))
    return
  }

  // Network (Incoming)
  registerSystem(SystemUpdateType.Free, import('./networking/systems/IncomingNetworkSystem'))

  // Input
  registerSystem(SystemUpdateType.Free, import('./input/systems/ClientInputSystem'))
  registerSystem(SystemUpdateType.Free, import('./xr/systems/XRSystem'))
  registerSystem(SystemUpdateType.Free, import('./camera/systems/CameraSystem'))
  registerSystem(SystemUpdateType.Free, import('./navigation/systems/AutopilotSystem'))

  // UPDATE INJECTION POINT
  registerSystemWithArgs(SystemUpdateType.Free, import('./ecs/functions/InjectedPipelineSystem'), {
    injectionPoint: InjectionPoint.UPDATE
  })

  // Fixed Systems
  registerSystemWithArgs(SystemUpdateType.Free, import('./ecs/functions/FixedPipelineSystem'), {
    updatesPerSecond: 60
  })

  // EARLY FIXED UPDATE INJECTION POINT
  registerSystemWithArgs(SystemUpdateType.Fixed, import('./ecs/functions/InjectedPipelineSystem'), {
    injectionPoint: InjectionPoint.FIXED_EARLY
  })

  // Bot
  registerSystem(SystemUpdateType.Fixed, import('./bot/systems/BotHookSystem'))

  // Maps
  registerSystem(SystemUpdateType.Fixed, import('./map/MapUpdateSystem'))

  // Navigation
  registerSystem(SystemUpdateType.Fixed, import('./navigation/systems/FollowSystem'))
  registerSystem(SystemUpdateType.Fixed, import('./navigation/systems/AfkCheckSystem'))

  // Avatar Systems
  registerSystem(SystemUpdateType.Fixed, import('./physics/systems/InterpolationSystem'))
  registerSystem(SystemUpdateType.Fixed, import('./avatar/ClientAvatarSpawnSystem'))
  registerSystem(SystemUpdateType.Fixed, import('./avatar/AvatarSystem'))
  registerSystem(SystemUpdateType.Fixed, import('./avatar/AvatarControllerSystem'))
  // Avatar IKRig
  registerSystem(SystemUpdateType.Fixed, import('./ikrig/systems/IKRigSystem'))

  // FIXED UPDATE INJECTION POINT
  registerSystemWithArgs(SystemUpdateType.Fixed, import('./ecs/functions/InjectedPipelineSystem'), {
    injectionPoint: InjectionPoint.FIXED
  })

  // Scene Systems
  registerSystem(SystemUpdateType.Fixed, import('./interaction/systems/EquippableSystem'))
  registerSystem(SystemUpdateType.Fixed, import('./scene/systems/SceneObjectSystem'))
  registerSystem(SystemUpdateType.Fixed, import('./scene/systems/NamedEntitiesSystem'))
  registerSystem(SystemUpdateType.Fixed, import('./transform/systems/TransformSystem'))
  registerSystemWithArgs(SystemUpdateType.Fixed, import('./physics/systems/PhysicsSystem'), {
    simulationEnabled: options.physics.simulationEnabled
  })

  // LATE FIXED UPDATE INJECTION POINT
  registerSystemWithArgs(SystemUpdateType.Fixed, import('./ecs/functions/InjectedPipelineSystem'), {
    injectionPoint: InjectionPoint.FIXED_LATE
  })

  // Camera & UI systems
  registerSystem(SystemUpdateType.Free, import('./networking/systems/MediaStreamSystem'))
  registerSystem(SystemUpdateType.Free, import('./xrui/systems/XRUISystem'))
  registerSystem(SystemUpdateType.Free, import('./interaction/systems/InteractiveSystem'))

  // Audio Systems
  registerSystem(SystemUpdateType.Free, import('./audio/systems/AudioSystem'))
  registerSystem(SystemUpdateType.Free, import('./audio/systems/PositionalAudioSystem'))

  // PRE RENDER INJECTION POINT
  registerSystemWithArgs(SystemUpdateType.Free, import('./ecs/functions/InjectedPipelineSystem'), {
    injectionPoint: InjectionPoint.PRE_RENDER
  })

  // Animation Systems
  registerSystem(SystemUpdateType.Free, import('./avatar/AvatarLoadingSystem'))
  registerSystem(SystemUpdateType.Free, import('./avatar/AnimationSystem'))
  registerSystem(SystemUpdateType.Free, import('./particles/systems/ParticleSystem'))
  registerSystem(SystemUpdateType.Free, import('./debug/systems/DebugHelpersSystem'))
  registerSystem(SystemUpdateType.Free, import('./renderer/HighlightSystem'))
  registerSystemWithArgs(SystemUpdateType.Free, import('./renderer/WebGLRendererSystem'), {
    canvas,
    enabled: !options.renderer.disabled
  })

  // POST RENDER INJECTION POINT
  registerSystemWithArgs(SystemUpdateType.Free, import('./ecs/functions/InjectedPipelineSystem'), {
    injectionPoint: InjectionPoint.POST_RENDER
  })

  // Network (Outgoing)
  registerSystem(SystemUpdateType.Free, import('./networking/systems/OutgoingNetworkSystem'))
}

const registerEditorSystems = async (options: Required<InitializeOptions>) => {
  // Scene Systems
  registerSystem(SystemUpdateType.Fixed, import('./scene/systems/NamedEntitiesSystem'))
  registerSystem(SystemUpdateType.Fixed, import('./transform/systems/TransformSystem'))
  registerSystemWithArgs(SystemUpdateType.Fixed, import('./physics/systems/PhysicsSystem'), {
    simulationEnabled: options.physics.simulationEnabled
  })

  // Miscellaneous Systems
  registerSystem(SystemUpdateType.Fixed, import('./particles/systems/ParticleSystem'))
  registerSystem(SystemUpdateType.Fixed, import('./debug/systems/DebugHelpersSystem'))
}

const registerServerSystems = async (options: Required<InitializeOptions>) => {
  registerSystem(SystemUpdateType.Free, import('./networking/systems/IncomingNetworkSystem'))

  registerSystemWithArgs(SystemUpdateType.Free, import('./ecs/functions/FixedPipelineSystem'), {
    updatesPerSecond: 60
  })

  registerSystemWithArgs(SystemUpdateType.Free, import('./ecs/functions/InjectedPipelineSystem'), {
    injectionPoint: InjectionPoint.UPDATE
  })

  // Network Incoming Systems
  registerSystem(SystemUpdateType.Fixed, import('./networking/systems/MediaStreamSystem'))

  registerSystemWithArgs(SystemUpdateType.Fixed, import('./ecs/functions/InjectedPipelineSystem'), {
    injectionPoint: InjectionPoint.FIXED_EARLY
  })

  // Input Systems
  registerSystem(SystemUpdateType.Fixed, import('./avatar/AvatarSystem'))

  registerSystemWithArgs(SystemUpdateType.Fixed, import('./ecs/functions/InjectedPipelineSystem'), {
    injectionPoint: InjectionPoint.FIXED
  })

  // Scene Systems
  registerSystem(SystemUpdateType.Fixed, import('./scene/systems/NamedEntitiesSystem'))
  registerSystem(SystemUpdateType.Fixed, import('./transform/systems/TransformSystem'))
  registerSystemWithArgs(SystemUpdateType.Fixed, import('./physics/systems/PhysicsSystem'), {
    simulationEnabled: options.physics.simulationEnabled
  })

  registerSystemWithArgs(SystemUpdateType.Fixed, import('./ecs/functions/InjectedPipelineSystem'), {
    injectionPoint: InjectionPoint.FIXED_LATE
  })

  // Miscellaneous Systems
  registerSystem(SystemUpdateType.Fixed, import('./avatar/ServerAvatarSpawnSystem'))

  registerSystemWithArgs(SystemUpdateType.Free, import('./ecs/functions/InjectedPipelineSystem'), {
    injectionPoint: InjectionPoint.PRE_RENDER
  })

  registerSystemWithArgs(SystemUpdateType.Free, import('./ecs/functions/InjectedPipelineSystem'), {
    injectionPoint: InjectionPoint.POST_RENDER
  })

  // Network Outgoing Systems
  registerSystem(SystemUpdateType.Free, import('./networking/systems/OutgoingNetworkSystem'))
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

  await sceneWorld.physics.createScene()

  options.systems?.forEach((init) => {
    injectSystem(sceneWorld, init)
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
      Engine.userId = id
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
  Engine.engineTimer = null!

  await reset()
}
