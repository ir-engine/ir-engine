import { detect, detectOS } from 'detect-browser'
import _ from 'lodash'
import { BufferGeometry, Euler, Mesh, PerspectiveCamera, Quaternion, Scene } from 'three'
import { AudioListener } from './audio/StereoAudioListener'
//@ts-ignore
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh'
import { loadDRACODecoder } from './assets/loaders/gltf/NodeDracoLoader'
import { BotHookFunctions } from './bot/functions/botHookFunctions'
import { Timer } from './common/functions/Timer'
import { Engine } from './ecs/classes/Engine'
import { EngineEvents } from './ecs/classes/EngineEvents'
import { reset } from './ecs/functions/EngineFunctions'
import { registerSystem, registerSystemWithArgs } from './ecs/functions/SystemFunctions'
import { SystemUpdateType } from './ecs/functions/SystemUpdateType'
import { DefaultInitializationOptions, EngineSystemPresets, InitializeOptions } from './initializationOptions'
import { addClientInputListeners, removeClientInputListeners } from './input/functions/clientInputListeners'
import { Network } from './networking/classes/Network'
import { FontManager } from './xrui/classes/FontManager'
import { createWorld } from './ecs/classes/World'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { ObjectLayers } from './scene/constants/ObjectLayers'
import { registerPrefabs } from './scene/functions/registerPrefabs'
import { EngineActions, receptors } from './ecs/classes/EngineService'
import { dispatchLocal } from './networking/functions/dispatchFrom'

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
    if (!enableRenderer)
      dispatchLocal(
        EngineActions.browserNotSupported(
          'Your brower does not support webgl,or it disable webgl,Please enable webgl'
        ) as any
      )
    dispatchLocal(EngineActions.enableScene({ renderer: enableRenderer, physics: true }) as any)
    Engine.hasJoinedWorld = true
  })

  const canvas = document.querySelector('canvas')!

  if (options.scene.disabled !== true) {
    Engine.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000)
    Engine.camera.layers.set(ObjectLayers.Render)
    Engine.scene.add(Engine.camera)
    Engine.camera.add(Engine.audioListener)
    addClientInputListeners(canvas)
  }

  globalThis.botHooks = BotHookFunctions
  globalThis.Engine = Engine
  globalThis.EngineEvents = EngineEvents
  globalThis.Network = Network

  await Promise.all([FontManager.instance.getDefaultFont(), registerClientSystems(options, canvas)])
}

const configureEditor = async (options: Required<InitializeOptions>) => {
  Engine.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000)
  Engine.camera.layers.enable(ObjectLayers.Scene)
  Engine.camera.name = 'Camera'

  await registerEditorSystems(options)
}

const configureServer = async (options: Required<InitializeOptions>, isMediaServer = false) => {
  Engine.scene = new Scene()

  // Had to add this to make mocha tests pass
  Network.instance ||= new Network()
  Network.instance.isInitialized = true

  EngineEvents.instance.once(EngineEvents.EVENTS.JOINED_WORLD, () => {
    console.log('joined world')
    dispatchLocal(EngineActions.enableScene({ renderer: true, physics: true }) as any)
    Engine.hasJoinedWorld = true
  })

  if (!isMediaServer) {
    await loadDRACODecoder()

    await registerServerSystems(options)
  } else {
    await registerMediaServerSystems(options)
  }
}

// todo - expose this as a default and overridable pipeline

const registerClientSystems = async (options: Required<InitializeOptions>, canvas: HTMLCanvasElement) => {
  if (options.scene.disabled) {
    registerSystem(SystemUpdateType.UPDATE, import('./networking/systems/IncomingNetworkSystem'))
    registerSystem(SystemUpdateType.UPDATE, import('./networking/systems/OutgoingNetworkSystem'))
    return
  }

  // Input
  registerSystem(SystemUpdateType.UPDATE, import('./xr/systems/XRSystem'))
  registerSystem(SystemUpdateType.UPDATE, import('./input/systems/ClientInputSystem'))
  registerSystem(SystemUpdateType.UPDATE, import('./navigation/systems/AutopilotSystem'))
  // Avatar IKRig
  registerSystem(SystemUpdateType.UPDATE, import('./ikrig/systems/SkeletonRigSystem'))

  // UPDATE injection point

  /**
   *
   *  Begin FIXED Systems
   *
   */

  // Network (Incoming)
  registerSystem(SystemUpdateType.FIXED_EARLY, import('./networking/systems/IncomingNetworkSystem'))

  // FIXED_EARLY injection point

  // Bot
  registerSystem(SystemUpdateType.FIXED, import('./bot/systems/BotHookSystem'))

  // Maps
  registerSystem(SystemUpdateType.FIXED, import('./map/MapUpdateSystem'))

  // Avatar Systems
  registerSystem(SystemUpdateType.FIXED, import('./avatar/AvatarSpawnSystem'))
  registerSystem(SystemUpdateType.FIXED, import('./avatar/AvatarSystem'))
  registerSystem(SystemUpdateType.FIXED, import('./avatar/AvatarControllerSystem'))

  // FIXED injection point

  // Scene Systems
  registerSystem(SystemUpdateType.FIXED_LATE, import('./interaction/systems/EquippableSystem'))
  registerSystem(SystemUpdateType.FIXED_LATE, import('./scene/systems/SceneObjectSystem'))
  registerSystem(SystemUpdateType.FIXED_LATE, import('./scene/systems/NamedEntitiesSystem'))
  registerSystem(SystemUpdateType.FIXED_LATE, import('./transform/systems/TransformSystem'))
  registerSystem(SystemUpdateType.FIXED_LATE, import('./scene/systems/TriggerSystem'))
  registerSystemWithArgs(SystemUpdateType.FIXED_LATE, import('./physics/systems/PhysicsSystem'), {
    simulationEnabled: options.physics.simulationEnabled
  })

  // Network (Outgoing)
  registerSystem(SystemUpdateType.FIXED_LATE, import('./networking/systems/OutgoingNetworkSystem'))

  // FIXED_LATE injection point

  /**
   *
   *  End FIXED Systems
   *
   */

  registerSystemWithArgs(SystemUpdateType.PRE_RENDER, import('./ecs/functions/FixedPipelineSystem'), {
    tickRate: 60
  })

  // Camera & UI systems
  registerSystem(SystemUpdateType.PRE_RENDER, import('./networking/systems/MediaStreamSystem'))
  registerSystem(SystemUpdateType.PRE_RENDER, import('./xrui/systems/XRUISystem'))
  registerSystem(SystemUpdateType.PRE_RENDER, import('./interaction/systems/InteractiveSystem'))
  registerSystem(SystemUpdateType.PRE_RENDER, import('./camera/systems/CameraSystem'))

  // Audio Systems
  registerSystem(SystemUpdateType.PRE_RENDER, import('./audio/systems/AudioSystem'))
  registerSystem(SystemUpdateType.PRE_RENDER, import('./audio/systems/PositionalAudioSystem'))

  // Animation Systems
  registerSystem(SystemUpdateType.PRE_RENDER, import('./avatar/AvatarLoadingSystem'))
  registerSystem(SystemUpdateType.PRE_RENDER, import('./avatar/AnimationSystem'))

  //Rendered Update
  registerSystem(SystemUpdateType.PRE_RENDER, import('./scene/systems/RendererUpdateSystem'))

  // Animation Systems
  registerSystem(SystemUpdateType.PRE_RENDER, import('./particles/systems/ParticleSystem'))
  registerSystem(SystemUpdateType.PRE_RENDER, import('./debug/systems/DebugHelpersSystem'))
  registerSystem(SystemUpdateType.PRE_RENDER, import('./renderer/HighlightSystem'))

  // PRE_RENDER injection point

  registerSystemWithArgs(SystemUpdateType.POST_RENDER, import('./renderer/WebGLRendererSystem'), {
    canvas,
    enabled: !options.renderer.disabled
  })

  // POST_RENDER injection point
}

const registerEditorSystems = async (options: Required<InitializeOptions>) => {
  registerSystemWithArgs(SystemUpdateType.UPDATE, import('./ecs/functions/FixedPipelineSystem'), { tickRate: 60 })

  registerSystem(SystemUpdateType.FIXED_LATE, import('./scene/systems/SceneObjectSystem'))
  registerSystem(SystemUpdateType.FIXED_LATE, import('./transform/systems/TransformSystem'))

  if (options.systems) {
    options.systems.forEach((system) => {
      if (system.args) {
        registerSystemWithArgs(system.type, system.systemModulePromise, system.args, system.sceneSystem)
      } else {
        registerSystem(system.type, system.systemModulePromise, system.sceneSystem)
      }
    })
  }

  registerSystem(SystemUpdateType.PRE_RENDER, import('./audio/systems/PositionalAudioSystem'))
  registerSystem(SystemUpdateType.PRE_RENDER, import('./scene/systems/EntityNodeEventSystem'))

  // Scene Systems
  // registerSystem(SystemUpdateType.FIXED, import('./scene/systems/NamedEntitiesSystem'))
  // registerSystemWithArgs(SystemUpdateType.FIXED, import('./physics/systems/PhysicsSystem'), {
  //   simulationEnabled: options.physics.simulationEnabled
  // })
  // Miscellaneous Systems
  // registerSystem(SystemUpdateType.FIXED, import('./particles/systems/ParticleSystem'))
  // registerSystem(SystemUpdateType.FIXED, import('./debug/systems/DebugHelpersSystem'))
}

const registerServerSystems = async (options: Required<InitializeOptions>) => {
  registerSystemWithArgs(SystemUpdateType.UPDATE, import('./ecs/functions/FixedPipelineSystem'), {
    tickRate: 60
  })
  // Network Incoming Systems
  registerSystem(SystemUpdateType.FIXED_EARLY, import('./networking/systems/IncomingNetworkSystem'))

  // Input Systems
  registerSystem(SystemUpdateType.FIXED, import('./avatar/AvatarSystem'))
  registerSystem(SystemUpdateType.FIXED, import('./avatar/AvatarSpawnSystem'))
  registerSystem(SystemUpdateType.FIXED, import('./interaction/systems/EquippableSystem'))
  registerSystem(SystemUpdateType.FIXED_LATE, import('./scene/systems/SceneObjectSystem'))

  // Scene Systems
  registerSystem(SystemUpdateType.FIXED_LATE, import('./scene/systems/NamedEntitiesSystem'))
  registerSystem(SystemUpdateType.FIXED_LATE, import('./transform/systems/TransformSystem'))
  registerSystem(SystemUpdateType.FIXED_LATE, import('./scene/systems/TriggerSystem'))
  registerSystemWithArgs(SystemUpdateType.FIXED_LATE, import('./physics/systems/PhysicsSystem'), {
    simulationEnabled: options.physics.simulationEnabled
  })

  // Network Outgoing Systems
  registerSystem(SystemUpdateType.FIXED_LATE, import('./networking/systems/OutgoingNetworkSystem'))
}

const registerMediaServerSystems = async (options: Required<InitializeOptions>) => {
  registerSystem(SystemUpdateType.UPDATE, import('./networking/systems/MediaStreamSystem'))
}

export const initializeEngine = async (initOptions: InitializeOptions = {}): Promise<void> => {
  const options: Required<InitializeOptions> = _.defaultsDeep({}, initOptions, DefaultInitializationOptions)
  const sceneWorld = createWorld()
  registerPrefabs(sceneWorld)

  Engine.currentWorld = sceneWorld
  Engine.publicPath = options.publicPath

  Engine.currentWorld.receptors.push(...receptors())
  // Browser state set
  if (options.type !== EngineSystemPresets.SERVER && globalThis.navigator && globalThis.window) {
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
  } else if (options.type === EngineSystemPresets.MEDIA) {
    await configureServer(options, true)
  }

  for (const system of initOptions.systems || []) {
    registerSystemWithArgs(system.type, system.systemModulePromise, system.args, system.sceneSystem)
  }

  await sceneWorld.physics.createScene()

  await sceneWorld.initSystems()

  const executeWorlds = (delta, elapsedTime) => {
    for (const world of Engine.worlds) {
      world.execute(delta, elapsedTime)
    }
  }

  Engine.engineTimer = Timer(executeWorlds)

  // Engine type specific post configuration work
  Engine.engineTimer.start()

  if (options.type === EngineSystemPresets.CLIENT) {
    EngineEvents.instance.once(EngineEvents.EVENTS.CONNECT, ({ id }) => {
      Network.instance.isInitialized = true
      Engine.userId = id
    })
  } else if (options.type === EngineSystemPresets.SERVER) {
    Engine.userId = 'server' as UserId
    Engine.currentWorld.clients.set('server' as UserId, { name: 'server' } as any)
  } else if (options.type === EngineSystemPresets.MEDIA) {
    Engine.userId = 'mediaserver' as UserId
  } else if (options.type === EngineSystemPresets.EDITOR) {
    Engine.userId = 'editor' as UserId
    Engine.isEditor = true
    // Engine timer should not start here for eidtor since we load scene after selecting.
  }

  // Mark engine initialized
  Engine.isInitialized = true
  dispatchLocal(EngineActions.initializeEngine(true) as any)
}

export const shutdownEngine = async () => {
  removeClientInputListeners()

  Engine.engineTimer?.clear()
  Engine.engineTimer = null!

  await reset()
}
