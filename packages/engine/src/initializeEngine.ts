import { detect, detectOS } from 'detect-browser'
import _ from 'lodash'
import { AudioListener, PerspectiveCamera, Scene } from 'three'

import { BotUserAgent } from '@xrengine/common/src/constants/BotUserAgent'
import { addActionReceptor, dispatchAction, registerState } from '@xrengine/hyperflux'
import ActionFunctions from '@xrengine/hyperflux/functions/ActionFunctions'

import { getGLTFLoader } from './assets/classes/AssetLoader'
import { initializeKTX2Loader } from './assets/functions/createGLTFLoader'
import { isClient } from './common/functions/isClient'
import { Timer } from './common/functions/Timer'
import { Engine } from './ecs/classes/Engine'
import { EngineActions, EngineEventReceptor, EngineState } from './ecs/classes/EngineState'
import { createWorld } from './ecs/classes/World'
import { initSystems, SystemModuleType } from './ecs/functions/SystemFunctions'
import { SystemUpdateType } from './ecs/functions/SystemUpdateType'
import { matchActionOnce } from './networking/functions/matchActionOnce'
import { NetworkActionReceptor } from './networking/functions/NetworkActionReceptor'
import { WorldState } from './networking/interfaces/WorldState'
import { EngineRenderer } from './renderer/WebGLRendererSystem'
import { ObjectLayers } from './scene/constants/ObjectLayers'

import './threejsPatches'

import { FontManager } from './xrui/classes/FontManager'

/**
 * Creates a new instance of the engine and engine renderer. This initializes all properties and state for the engine,
 * adds action receptors and creates a new world.
 * @returns {Engine}
 */
export const createEngine = () => {
  Engine.instance = new Engine()
  Engine.instance.currentWorld = createWorld()
  Engine.instance.scene = new Scene()
  Engine.instance.scene.layers.set(ObjectLayers.Scene)
  EngineRenderer.instance = new EngineRenderer()
  if (isClient) EngineRenderer.instance.initialize()
  registerState(Engine.instance.store, EngineState)
  registerState(Engine.instance.currentWorld.store, WorldState)
  addActionReceptor(Engine.instance.store, EngineEventReceptor)
}

/**
 * initializeBrowser
 *
 * initializes everything for the browser context
 */
export const initializeBrowser = () => {
  Engine.instance.publicPath = location.origin
  Engine.instance.audioListener = new AudioListener()
  Engine.instance.audioListener.context.resume()
  Engine.instance.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000)
  Engine.instance.camera.add(Engine.instance.audioListener)
  Engine.instance.camera.layers.disableAll()
  Engine.instance.camera.layers.enable(ObjectLayers.Scene)
  Engine.instance.camera.layers.enable(ObjectLayers.Avatar)
  Engine.instance.camera.layers.enable(ObjectLayers.UI)

  Engine.instance.isBot = navigator.userAgent === BotUserAgent

  const browser = detect()
  const os = detectOS(navigator.userAgent)

  // Add iOS and safari flag to window object -- To use it for creating an iOS compatible WebGLRenderer for example
  ;(window as any).iOS =
    os === 'iOS' ||
    /iPad|iPhone|iPod/.test(navigator.platform) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  ;(window as any).safariWebBrowser = browser?.name === 'safari'

  Engine.instance.isHMD = /Oculus/i.test(navigator.userAgent) // TODO: more HMDs;

  setupInitialClickListener()

  // maybe needs to be awaited?
  FontManager.instance.getDefaultFont()

  matchActionOnce(Engine.instance.store, EngineActions.connect.matches, (action: any) => {
    Engine.instance.userId = action.id
  })
}

const setupInitialClickListener = () => {
  const initialClickListener = () => {
    dispatchAction(Engine.instance.store, EngineActions.setUserHasInteracted())
    window.removeEventListener('click', initialClickListener)
    window.removeEventListener('touchend', initialClickListener)
  }
  window.addEventListener('click', initialClickListener)
  window.addEventListener('touchend', initialClickListener)
}

/**
 * initializeNode
 *
 * initializes everything for the node context
 */
export const initializeNode = () => {
  // node currently does not need to initialize anything
}

const executeWorlds = (delta, elapsedTime) => {
  Engine.instance.elapsedTime = elapsedTime
  ActionFunctions.applyIncomingActions(Engine.instance.store)
  for (const world of Engine.instance.worlds) {
    world.execute(delta)
  }
}

export const initializeMediaServerSystems = async () => {
  const coreSystems: SystemModuleType<any>[] = []
  coreSystems.push(
    {
      type: SystemUpdateType.UPDATE,
      systemModulePromise: import('./ecs/functions/FixedPipelineSystem'),
      args: { tickRate: 60 }
    },
    {
      type: SystemUpdateType.FIXED_EARLY,
      systemModulePromise: import('./networking/systems/IncomingActionSystem')
    },
    {
      type: SystemUpdateType.FIXED_LATE,
      systemModulePromise: import('./networking/systems/OutgoingActionSystem')
    }
  )

  const world = Engine.instance.currentWorld

  await initSystems(world, coreSystems)

  NetworkActionReceptor.createNetworkActionReceptor(world)

  Engine.instance.engineTimer = Timer(executeWorlds)
  Engine.instance.engineTimer.start()

  dispatchAction(Engine.instance.store, EngineActions.initializeEngine({ initialised: true }))
}

export const initializeCoreSystems = async () => {
  const systemsToLoad: SystemModuleType<any>[] = []
  systemsToLoad.push(
    {
      type: SystemUpdateType.UPDATE,
      systemModulePromise: import('./ecs/functions/FixedPipelineSystem'),
      args: { tickRate: 60 }
    },
    {
      type: SystemUpdateType.FIXED_EARLY,
      systemModulePromise: import('./networking/systems/IncomingActionSystem')
    },
    {
      type: SystemUpdateType.FIXED_LATE,
      systemModulePromise: import('./transform/systems/TransformSystem')
    },

    {
      type: SystemUpdateType.FIXED_LATE,
      systemModulePromise: import('./scene/systems/SceneObjectSystem')
    },
    {
      type: SystemUpdateType.FIXED_LATE,
      systemModulePromise: import('./scene/systems/AssetSystem')
    },
    {
      type: SystemUpdateType.FIXED_LATE,
      systemModulePromise: import('./networking/systems/OutgoingActionSystem')
    }
  )

  if (isClient) {
    systemsToLoad.push(
      {
        type: SystemUpdateType.POST_RENDER,
        systemModulePromise: import('./renderer/WebGLRendererSystem')
      },
      {
        type: SystemUpdateType.UPDATE,
        systemModulePromise: import('./xr/systems/XRSystem')
      },
      {
        type: SystemUpdateType.UPDATE,
        systemModulePromise: import('./input/systems/ClientInputSystem')
      },
      {
        type: SystemUpdateType.UPDATE,
        systemModulePromise: import('./xrui/systems/XRUISystem')
      }
    )
  }

  const world = Engine.instance.currentWorld
  await initSystems(world, systemsToLoad)

  // load injected systems which may rely on core systems
  await initSystems(world, Engine.instance.injectedSystems)

  Engine.instance.engineTimer = Timer(executeWorlds)
  Engine.instance.engineTimer.start()

  dispatchAction(Engine.instance.store, EngineActions.initializeEngine({ initialised: true }))
}

/**
 * everything needed for rendering 3d scenes
 */

export const initializeSceneSystems = async () => {
  const world = Engine.instance.currentWorld
  NetworkActionReceptor.createNetworkActionReceptor(world)

  const systemsToLoad: SystemModuleType<any>[] = []

  systemsToLoad.push(
    {
      type: SystemUpdateType.FIXED,
      systemModulePromise: import('./avatar/AvatarSpawnSystem')
    },
    {
      type: SystemUpdateType.FIXED,
      systemModulePromise: import('./avatar/AvatarSystem')
    },
    {
      type: SystemUpdateType.FIXED_LATE,
      systemModulePromise: import('./interaction/systems/EquippableSystem')
    },
    {
      type: SystemUpdateType.FIXED_LATE,
      systemModulePromise: import('./scene/systems/TriggerSystem')
    },
    {
      type: SystemUpdateType.FIXED_LATE,
      systemModulePromise: import('./physics/systems/PhysicsSystem')
    }
  )
  if (isClient) {
    systemsToLoad.push(
      {
        type: SystemUpdateType.UPDATE,
        systemModulePromise: import('./navigation/systems/AutopilotSystem')
      },
      {
        type: SystemUpdateType.UPDATE,
        systemModulePromise: import('./scene/systems/HyperspacePortalSystem')
      },
      {
        type: SystemUpdateType.UPDATE,
        systemModulePromise: import('./camera/systems/CameraSystem')
      },
      {
        type: SystemUpdateType.FIXED,
        systemModulePromise: import('./bot/systems/BotHookSystem')
      },
      {
        type: SystemUpdateType.FIXED,
        systemModulePromise: import('./avatar/AvatarTeleportSystem')
      },
      {
        type: SystemUpdateType.FIXED,
        systemModulePromise: import('./avatar/AvatarControllerSystem')
      },
      {
        type: SystemUpdateType.PRE_RENDER,
        systemModulePromise: import('./interaction/systems/InteractiveSystem')
      },
      {
        type: SystemUpdateType.PRE_RENDER,
        systemModulePromise: import('./interaction/systems/MediaControlSystem')
      },
      {
        type: SystemUpdateType.PRE_RENDER,
        systemModulePromise: import('./audio/systems/AudioSystem')
      },
      {
        type: SystemUpdateType.PRE_RENDER,
        systemModulePromise: import('./audio/systems/PositionalAudioSystem')
      },
      {
        type: SystemUpdateType.PRE_RENDER,
        systemModulePromise: import('./avatar/AvatarLoadingSystem')
      },
      {
        type: SystemUpdateType.PRE_RENDER,
        systemModulePromise: import('./avatar/AnimationSystem')
      },
      {
        type: SystemUpdateType.PRE_RENDER,
        systemModulePromise: import('./scene/systems/RendererUpdateSystem')
      },
      {
        type: SystemUpdateType.PRE_RENDER,
        systemModulePromise: import('./particles/systems/ParticleSystem')
      },
      {
        type: SystemUpdateType.PRE_RENDER,
        systemModulePromise: import('./debug/systems/DebugHelpersSystem')
      },
      {
        type: SystemUpdateType.PRE_RENDER,
        systemModulePromise: import('./renderer/HighlightSystem')
      },
      {
        systemModulePromise: import('./scene/systems/EntityNodeEventSystem'),
        type: SystemUpdateType.PRE_RENDER
      }
    )

    // todo: figure out the race condition that is stopping us from moving this to SceneObjectSystem
    initializeKTX2Loader(getGLTFLoader())
  }

  await initSystems(world, systemsToLoad)
}

export const initializeRealtimeSystems = async (media = true, pose = true) => {
  const systemsToLoad: SystemModuleType<any>[] = []

  if (media) {
    systemsToLoad.push({
      type: SystemUpdateType.PRE_RENDER,
      systemModulePromise: import('./networking/systems/MediaStreamSystem')
    })
  }

  if (pose) {
    systemsToLoad.push(
      {
        type: SystemUpdateType.FIXED_EARLY,
        systemModulePromise: import('./networking/systems/IncomingNetworkSystem')
      },
      {
        type: SystemUpdateType.FIXED_LATE,
        systemModulePromise: import('./networking/systems/OutgoingNetworkSystem')
      }
    )
  }

  await initSystems(Engine.instance.currentWorld, systemsToLoad)
}
