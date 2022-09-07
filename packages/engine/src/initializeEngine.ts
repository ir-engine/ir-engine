import { detect, detectOS } from 'detect-browser'
import _ from 'lodash'

import { BotUserAgent } from '@xrengine/common/src/constants/BotUserAgent'
import { addActionReceptor, dispatchAction, getState } from '@xrengine/hyperflux'

import { getGLTFLoader } from './assets/classes/AssetLoader'
import { initializeKTX2Loader } from './assets/functions/createGLTFLoader'
import { isClient } from './common/functions/isClient'
import { Timer } from './common/functions/Timer'
import { Engine } from './ecs/classes/Engine'
import { EngineActions, EngineEventReceptor, EngineState } from './ecs/classes/EngineState'
import { createWorld, destroyWorld } from './ecs/classes/World'
import FixedPipelineSystem from './ecs/functions/FixedPipelineSystem'
import { initSystems, initSystemSync, SystemModuleType } from './ecs/functions/SystemFunctions'
import { SystemUpdateType } from './ecs/functions/SystemUpdateType'
import { matchActionOnce } from './networking/functions/matchActionOnce'
import IncomingActionSystem from './networking/systems/IncomingActionSystem'
import OutgoingActionSystem from './networking/systems/OutgoingActionSystem'
import { EngineRenderer } from './renderer/WebGLRendererSystem'
import { ObjectLayers } from './scene/constants/ObjectLayers'
import { FontManager } from './xrui/classes/FontManager'

/**
 * Creates a new instance of the engine and engine renderer. This initializes all properties and state for the engine,
 * adds action receptors and creates a new world.
 * @returns {Engine}
 */
export const createEngine = () => {
  if (Engine.instance?.currentWorld) {
    destroyWorld(Engine.instance.currentWorld)
  }
  Engine.instance = new Engine()
  createWorld()
  EngineRenderer.instance = new EngineRenderer()
  addActionReceptor(EngineEventReceptor)
  Engine.instance.engineTimer = Timer(executeWorlds, Engine.instance.tickRate)
}

export const setupEngineActionSystems = () => {
  const world = Engine.instance.currentWorld
  initSystemSync(world, {
    type: SystemUpdateType.UPDATE,
    systemFunction: FixedPipelineSystem
  })
  initSystemSync(world, {
    type: SystemUpdateType.FIXED_EARLY,
    systemFunction: IncomingActionSystem
  })
  initSystemSync(world, {
    type: SystemUpdateType.FIXED_LATE,
    systemFunction: OutgoingActionSystem
  })
}

/**
 * initializeBrowser
 *
 * initializes everything for the browser context
 */
export const initializeBrowser = () => {
  const audioContext = new (globalThis.AudioContext || globalThis.webkitAudioContext)()
  audioContext.resume()
  Engine.instance.audioContext = audioContext
  Engine.instance.publicPath = location.origin
  Engine.instance.cameraGainNode = audioContext.createGain()
  Engine.instance.cameraGainNode.connect(audioContext.destination)
  const world = Engine.instance.currentWorld
  world.camera.layers.disableAll()
  world.camera.layers.enable(ObjectLayers.Scene)
  world.camera.layers.enable(ObjectLayers.Avatar)
  world.camera.layers.enable(ObjectLayers.UI)

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

  matchActionOnce(EngineActions.connect.matches, (action: any) => {
    Engine.instance.userId = action.id
  })
  EngineRenderer.instance.initialize()
  Engine.instance.engineTimer.start()
}

const setupInitialClickListener = () => {
  const initialClickListener = () => {
    dispatchAction(EngineActions.setUserHasInteracted({}))
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
  Engine.instance.engineTimer.start()
}

const executeWorlds = (elapsedTime) => {
  const engineState = getState(EngineState)
  engineState.frameTime.set(elapsedTime)
  for (const world of Engine.instance.worlds) {
    world.execute(elapsedTime)
  }
}

export const initializeMediaServerSystems = async () => {
  dispatchAction(EngineActions.initializeEngine({ initialised: true }))
}

export const initializeCoreSystems = async () => {
  const systemsToLoad: SystemModuleType<any>[] = []
  systemsToLoad.push(
    {
      uuid: 'core.engine.TransformSystem',
      type: SystemUpdateType.UPDATE_LATE,
      systemModulePromise: () => import('./transform/systems/TransformSystem')
    },
    {
      uuid: 'core.engine.SceneObjectSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemModulePromise: () => import('./scene/systems/SceneObjectSystem')
    },
    {
      uuid: 'core.engine.SceneLoadingSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemModulePromise: () => import('./scene/systems/SceneLoadingSystem')
    },
    {
      uuid: 'core.engine.SceneObjectUpdateSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemModulePromise: () => import('./scene/systems/SceneObjectUpdateSystem')
    },
    {
      uuid: 'core.engine.LightSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemModulePromise: () => import('./scene/systems/LightSystem')
    },
    {
      uuid: 'core.engine.AssetSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemModulePromise: () => import('./scene/systems/AssetSystem')
    }
  )

  if (isClient) {
    systemsToLoad.push(
      {
        uuid: 'core.engine.CameraSystem',
        type: SystemUpdateType.UPDATE,
        systemModulePromise: () => import('./camera/systems/CameraSystem')
      },
      {
        uuid: 'core.engine.XRSystem',
        type: SystemUpdateType.UPDATE_EARLY,
        systemModulePromise: () => import('./xr/XRSystem')
      },
      {
        uuid: 'core.engine.ClientInputSystem',
        type: SystemUpdateType.UPDATE_EARLY,
        systemModulePromise: () => import('./input/systems/ClientInputSystem')
      },
      {
        uuid: 'core.engine.XRUISystem',
        type: SystemUpdateType.UPDATE,
        systemModulePromise: () => import('./xrui/systems/XRUISystem')
      },
      {
        uuid: 'core.engine.SceneObjectDynamicLoadSystem',
        type: SystemUpdateType.FIXED_LATE,
        systemModulePromise: () => import('./scene/systems/SceneObjectDynamicLoadSystem')
      },
      {
        uuid: 'core.engine.MaterialOverrideSystem',
        type: SystemUpdateType.FIXED_LATE,
        systemModulePromise: () => import('./scene/systems/MaterialOverrideSystem')
      },
      {
        uuid: 'core.engine.InstancingSystem',
        type: SystemUpdateType.FIXED_LATE,
        systemModulePromise: () => import('./scene/systems/InstancingSystem')
      },
      {
        uuid: 'core.engine.WebGLRendererSystem',
        type: SystemUpdateType.RENDER,
        systemModulePromise: () => import('./renderer/WebGLRendererSystem')
      }
    )
  }

  const world = Engine.instance.currentWorld
  await initSystems(world, systemsToLoad)

  // load injected systems which may rely on core systems
  await initSystems(world, Engine.instance.injectedSystems)

  dispatchAction(EngineActions.initializeEngine({ initialised: true }))
}

/**
 * everything needed for rendering 3d scenes
 */

export const initializeSceneSystems = async () => {
  const world = Engine.instance.currentWorld

  const systemsToLoad: SystemModuleType<any>[] = []

  systemsToLoad.push(
    {
      uuid: 'core.engine.AvatarSpawnSystem',
      type: SystemUpdateType.FIXED,
      systemModulePromise: () => import('./avatar/AvatarSpawnSystem')
    },
    {
      uuid: 'core.engine.AvatarSystem',
      type: SystemUpdateType.FIXED,
      systemModulePromise: () => import('./avatar/AvatarSystem')
    },
    /** @todo fix equippable implementation */
    // {
    //   uuid: 'core.engine.EquippableSystem',
    //   type: SystemUpdateType.FIXED_LATE,
    //   systemModulePromise: () => import('./interaction/systems/EquippableSystem')
    // },
    {
      uuid: 'core.engine.PhysicsSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemModulePromise: () => import('./physics/systems/PhysicsSystem')
    },
    {
      uuid: 'core.engine.TriggerSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemModulePromise: () => import('./scene/systems/TriggerSystem')
    }
  )
  if (isClient) {
    systemsToLoad.push(
      {
        uuid: 'core.engine.AutopilotSystem',
        type: SystemUpdateType.UPDATE,
        systemModulePromise: () => import('./navigation/systems/AutopilotSystem')
      },
      {
        uuid: 'core.engine.HyperspacePortalSystem',
        type: SystemUpdateType.UPDATE,
        systemModulePromise: () => import('./scene/systems/HyperspacePortalSystem')
      },
      {
        uuid: 'core.engine.AvatarTeleportSystem',
        type: SystemUpdateType.FIXED,
        systemModulePromise: () => import('./avatar/AvatarTeleportSystem')
      },
      {
        uuid: 'core.engine.AvatarControllerSystem',
        type: SystemUpdateType.FIXED,
        systemModulePromise: () => import('./avatar/AvatarControllerSystem')
      },
      {
        uuid: 'core.engine.InteractiveSystem',
        type: SystemUpdateType.UPDATE_LATE,
        systemModulePromise: () => import('./interaction/systems/InteractiveSystem')
      },
      {
        uuid: 'core.engine.MountPointSystem',
        type: SystemUpdateType.PRE_RENDER,
        systemModulePromise: () => import('./interaction/systems/MountPointSystem')
      },
      {
        uuid: 'core.engine.AudioSystem',
        type: SystemUpdateType.PRE_RENDER,
        systemModulePromise: () => import('./audio/systems/AudioSystem')
      },
      {
        uuid: 'core.engine.PositionalAudioSystem',
        type: SystemUpdateType.PRE_RENDER,
        systemModulePromise: () => import('./audio/systems/PositionalAudioSystem')
      },
      {
        uuid: 'core.engine.MediaControlSystem',
        type: SystemUpdateType.PRE_RENDER,
        systemModulePromise: () => import('./interaction/systems/MediaControlSystem')
      },
      {
        uuid: 'core.engine.AvatarLoadingSystem',
        type: SystemUpdateType.PRE_RENDER,
        systemModulePromise: () => import('./avatar/AvatarLoadingSystem')
      },
      {
        uuid: 'core.engine.AnimationSystem',
        type: SystemUpdateType.PRE_RENDER,
        systemModulePromise: () => import('./avatar/AnimationSystem')
      },
      {
        uuid: 'core.engine.RendererUpdateSystem',
        type: SystemUpdateType.PRE_RENDER,
        systemModulePromise: () => import('./scene/systems/RendererUpdateSystem')
      },
      {
        uuid: 'core.engine.ParticleSystem',
        type: SystemUpdateType.PRE_RENDER,
        systemModulePromise: () => import('./scene/systems/ParticleSystem')
      },
      {
        uuid: 'core.engine.DebugHelpersSystem',
        type: SystemUpdateType.PRE_RENDER,
        systemModulePromise: () => import('./debug/systems/DebugHelpersSystem')
      },
      {
        uuid: 'core.engine.HighlightSystem',
        type: SystemUpdateType.PRE_RENDER,
        systemModulePromise: () => import('./renderer/HighlightSystem')
      },
      {
        uuid: 'core.engine.EntityNodeEventSystem',
        type: SystemUpdateType.PRE_RENDER,
        systemModulePromise: () => import('./scene/systems/EntityNodeEventSystem')
      }
    )

    // todo: figure out the race condition that is stopping us from moving this to SceneObjectSystem
    initializeKTX2Loader(getGLTFLoader())
  }

  await initSystems(world, systemsToLoad)
}

export const initializeRealtimeSystems = async (media = true, pose = true) => {
  const systemsToLoad: SystemModuleType<any>[] = []

  systemsToLoad.push({
    uuid: 'core.engine.WorldNetworkActionSystem',
    type: SystemUpdateType.FIXED_EARLY,
    systemModulePromise: () => import('./networking/systems/WorldNetworkActionSystem')
  })

  if (media) {
    systemsToLoad.push({
      uuid: 'core.engine.MediaStreamSystem',
      type: SystemUpdateType.UPDATE,
      systemModulePromise: () => import('./networking/systems/MediaStreamSystem')
    })
  }

  if (pose) {
    systemsToLoad.push(
      {
        uuid: 'core.engine.IncomingNetworkSystem',
        type: SystemUpdateType.FIXED_EARLY,
        systemModulePromise: () => import('./networking/systems/IncomingNetworkSystem')
      },
      {
        uuid: 'core.engine.OutgoingNetworkSystem',
        type: SystemUpdateType.FIXED_LATE,
        systemModulePromise: () => import('./networking/systems/OutgoingNetworkSystem')
      }
    )
  }

  await initSystems(Engine.instance.currentWorld, systemsToLoad)
}
