import { detect, detectOS } from 'detect-browser'
import _ from 'lodash'
import {
  BufferGeometry,
  Euler,
  Mesh,
  PerspectiveCamera,
  Quaternion,
  Scene,
  AudioListener as PositionalAudioListener
} from 'three'
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
import { addClientInputListeners, removeClientInputListeners } from './input/functions/clientInputListeners'
import { Network } from './networking/classes/Network'
import { FontManager } from './xrui/classes/FontManager'
import { createWorld, World } from './ecs/classes/World'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { ObjectLayers } from './scene/constants/ObjectLayers'
import { registerPrefabs } from './scene/functions/registerPrefabs'
import { accessEngineState, EngineActions, EngineEventReceptor } from './ecs/classes/EngineService'
import { dispatchLocal } from './networking/functions/dispatchFrom'
import { receiveActionOnce } from './networking/functions/matchActionOnce'
import { EngineRenderer } from './renderer/WebGLRendererSystem'
import { applyIncomingActions } from './networking/systems/IncomingNetworkSystem'
import { loadEngineInjection } from '@xrengine/projects/loadEngineInjection'
import { registerDefaultSceneFunctions } from './scene/functions/registerSceneFunctions'
import { useWorld } from './ecs/functions/SystemHooks'
import { isClient } from './common/functions/isClient'

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

/**
 * initializeBrowser
 *
 * initializes everything for the browser context
 */
export const initializeBrowser = async () => {
  // https://bugs.chromium.org/p/chromium/issues/detail?id=1106389
  Engine.audioListener = new AudioListener()
  Engine.publicPath = location.origin

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

  const joinedWorld = () => {
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
  }
  receiveActionOnce(EngineEvents.EVENTS.JOINED_WORLD, joinedWorld)

  const canvas = document.querySelector('canvas')!
  addClientInputListeners(canvas)

  setupInitialClickListener()
}

/**
 * initializeNode
 *
 * initializes everything for the ndoe context
 */
export const initializeNode = () => {
  const joinedWorld = () => {
    dispatchLocal(EngineActions.enableScene({ physics: true }))
    Engine.hasJoinedWorld = true
  }
  receiveActionOnce(EngineEvents.EVENTS.JOINED_WORLD, joinedWorld)
}

/**
 * configures engine for a realtime networked location
 */
export const configureClient = async () => {
  Engine.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000)
  Engine.camera.layers.set(ObjectLayers.Render)
  Engine.scene.add(Engine.camera)
  Engine.camera.add(Engine.audioListener)
  receiveActionOnce(EngineEvents.EVENTS.CONNECT, (action: any) => {
    Engine.userId = action.id
  })

  globalThis.botHooks = BotHookFunctions

  await Promise.all([FontManager.instance.getDefaultFont(), registerClientSystems()])
}

/**
 * configures engine for a non-realtime editor
 */
export const configureEditor = async () => {
  Engine.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000)
  Engine.camera.layers.enable(ObjectLayers.Scene)
  Engine.camera.name = 'Camera'
  Engine.audioListener = new PositionalAudioListener()
  Engine.camera.add(Engine.audioListener)

  await registerEditorSystems()
}

export const configureServer = async (isMediaServer = false) => {
  if (!isMediaServer) {
    await loadDRACODecoder()

    await registerServerSystems()
  } else {
    await registerMediaServerSystems()
  }
}

// todo - expose this as a default and overridable pipeline

export const registerClientSystems = async () => {
  registerSystem(SystemUpdateType.UPDATE, import('./networking/systems/IncomingNetworkSystem'))
  registerSystem(SystemUpdateType.UPDATE, import('./networking/systems/OutgoingNetworkSystem'))

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
  registerSystem(SystemUpdateType.FIXED_LATE, import('./physics/systems/PhysicsSystem'))

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

  registerSystem(SystemUpdateType.POST_RENDER, import('./renderer/WebGLRendererSystem'))

  // POST_RENDER injection point
}

export const registerEditorSystems = async () => {
  registerSystemWithArgs(SystemUpdateType.UPDATE, import('./ecs/functions/FixedPipelineSystem'), { tickRate: 60 })

  registerSystem(
    SystemUpdateType.FIXED,
    new Promise((resolve) =>
      resolve({
        default: async (world: World) => () => applyIncomingActions(world)
      })
    )
  )

  // Bot
  registerSystem(SystemUpdateType.FIXED, import('./bot/systems/BotHookSystem'))

  registerSystem(SystemUpdateType.FIXED_LATE, import('./scene/systems/SceneObjectSystem'))
  registerSystem(SystemUpdateType.FIXED_LATE, import('./transform/systems/TransformSystem'))

  registerSystem(SystemUpdateType.PRE_RENDER, import('./audio/systems/PositionalAudioSystem'))
  registerSystem(SystemUpdateType.PRE_RENDER, import('./scene/systems/EntityNodeEventSystem'))

  // Scene Systems
  registerSystem(SystemUpdateType.FIXED, import('./physics/systems/PhysicsSystem'))

  // Miscellaneous Systems
  // registerSystem(SystemUpdateType.FIXED, import('./particles/systems/ParticleSystem'))
  registerSystem(SystemUpdateType.FIXED, import('./debug/systems/DebugHelpersSystem'))
}

export const registerServerSystems = async () => {
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
  registerSystem(SystemUpdateType.FIXED_LATE, import('./physics/systems/PhysicsSystem'))

  // Network Outgoing Systems
  registerSystem(SystemUpdateType.FIXED_LATE, import('./networking/systems/OutgoingNetworkSystem'))
}

export const registerMediaServerSystems = async () => {
  registerSystem(SystemUpdateType.UPDATE, import('./networking/systems/MediaStreamSystem'))
  registerSystemWithArgs(SystemUpdateType.UPDATE, import('./ecs/functions/FixedPipelineSystem'), {
    tickRate: 60
  })
  registerSystem(
    SystemUpdateType.FIXED,
    new Promise((resolve) =>
      resolve({
        default: async (world: World) => () => applyIncomingActions(world)
      })
    )
  )
}

export const createEngine = async (): Promise<void> => {
  Engine.isLoading = true

  const world = createWorld()
  Engine.currentWorld = world
  Engine.scene = new Scene()

  registerDefaultSceneFunctions(world)
  registerPrefabs(world)

  world.receptors.push(EngineEventReceptor)

  globalThis.Engine = Engine
  globalThis.EngineEvents = EngineEvents
  globalThis.Network = Network

  Engine.isLoading = false
  Engine.isInitialized = true
  dispatchLocal(EngineActions.initializeEngine(true) as any)
}

export const initializeCoreSystems = async () => {
  const executeWorlds = (delta, elapsedTime) => {
    for (const world of Engine.worlds) {
      world.execute(delta, elapsedTime)
    }
  }
  Engine.engineTimer = Timer(executeWorlds)
  Engine.engineTimer.start()
}

export const initializeWorldSystems = async () => {
  for (const system of initOptions.systems || []) {
    registerSystemWithArgs(system.type, system.systemModulePromise, system.args, system.sceneSystem)
  }

  const world = useWorld()

  await world.physics.createScene()

  await world.initSystems()

  await loadEngineInjection(world, initOptions.projects ?? [])
}

export const shutdownEngine = async () => {
  removeClientInputListeners()

  Engine.engineTimer?.clear()
  Engine.engineTimer = null!

  await reset()
}

const setupInitialClickListener = () => {
  const initialClickListener = () => {
    dispatchLocal(EngineActions.setUserHasInteracted())
    window.removeEventListener('click', initialClickListener)
    window.removeEventListener('touchend', initialClickListener)
  }
  window.addEventListener('click', initialClickListener)
  window.addEventListener('touchend', initialClickListener)
}
