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
    uuid: 'xre.engine.FixedPipelineSystem',
    type: SystemUpdateType.UPDATE,
    systemFunction: FixedPipelineSystem
  })
  initSystemSync(world, {
    uuid: 'xre.engine.IncomingActionSystem',
    type: SystemUpdateType.FIXED_EARLY,
    systemFunction: IncomingActionSystem
  })
  initSystemSync(world, {
    uuid: 'xre.engine.OutgoingActionSystem',
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

  setupInitialClickListener()

  // maybe needs to be awaited?
  FontManager.instance.getDefaultFont()

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

export const initializeCoreSystems = async (injectedSystems?: SystemModuleType<any>[]) => {
  const systemsToLoad: SystemModuleType<any>[] = []
  systemsToLoad.push(
    {
      uuid: 'xre.engine.SceneObjectSystem',
      type: SystemUpdateType.UPDATE_LATE,
      systemLoader: () => import('./scene/systems/SceneObjectSystem')
    },
    {
      uuid: 'xre.engine.TransformSystem',
      type: SystemUpdateType.UPDATE_LATE,
      systemLoader: () => import('./transform/systems/TransformSystem')
    },
    {
      uuid: 'xre.engine.SceneLoadingSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemLoader: () => import('./scene/systems/SceneLoadingSystem')
    },
    {
      uuid: 'xre.engine.SceneObjectUpdateSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemLoader: () => import('./scene/systems/SceneObjectUpdateSystem')
    },
    {
      uuid: 'xre.engine.LightSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemLoader: () => import('./scene/systems/LightSystem')
    },
    {
      uuid: 'xre.engine.AssetSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemLoader: () => import('./scene/systems/AssetSystem')
    }
  )

  if (isClient) {
    systemsToLoad.push(
      {
        uuid: 'xre.engine.CameraSystem',
        type: SystemUpdateType.UPDATE,
        systemLoader: () => import('./camera/systems/CameraSystem')
      },
      {
        uuid: 'xre.engine.XRSystem',
        type: SystemUpdateType.UPDATE_EARLY,
        systemLoader: () => import('./xr/XRSystem')
      },
      {
        uuid: 'xre.engine.ClientInputSystem',
        type: SystemUpdateType.UPDATE_EARLY,
        systemLoader: () => import('./input/systems/ClientInputSystem')
      },
      {
        uuid: 'xre.engine.XRUISystem',
        type: SystemUpdateType.UPDATE,
        systemLoader: () => import('./xrui/systems/XRUISystem')
      },
      {
        uuid: 'xre.engine.MaterialLibrarySystem',
        type: SystemUpdateType.UPDATE_LATE,
        systemLoader: () => import('./renderer/materials/systems/MaterialLibrarySystem')
      },
      {
        uuid: 'xre.engine.SceneObjectDynamicLoadSystem',
        type: SystemUpdateType.FIXED_LATE,
        systemLoader: () => import('./scene/systems/SceneObjectDynamicLoadSystem')
      },
      {
        uuid: 'xre.engine.MaterialOverrideSystem',
        type: SystemUpdateType.FIXED_LATE,
        systemLoader: () => import('./scene/systems/MaterialOverrideSystem')
      },
      {
        uuid: 'xre.engine.InstancingSystem',
        type: SystemUpdateType.FIXED_LATE,
        systemLoader: () => import('./scene/systems/InstancingSystem')
      },
      {
        uuid: 'xre.engine.WebGLRendererSystem',
        type: SystemUpdateType.RENDER,
        systemLoader: () => import('./renderer/WebGLRendererSystem')
      }
    )
  }

  const world = Engine.instance.currentWorld
  await initSystems(world, systemsToLoad)

  // load injected systems which may rely on core systems
  if (injectedSystems) await initSystems(world, injectedSystems)

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
      uuid: 'xre.engine.AvatarSpawnSystem',
      type: SystemUpdateType.FIXED,
      systemLoader: () => import('./avatar/AvatarSpawnSystem')
    },
    {
      uuid: 'xre.engine.AvatarSystem',
      type: SystemUpdateType.FIXED,
      systemLoader: () => import('./avatar/AvatarSystem')
    },
    /** @todo fix equippable implementation */
    // {
    //   uuid: 'xre.engine.EquippableSystem',
    //   type: SystemUpdateType.FIXED_LATE,
    //   systemLoader: () => import('./interaction/systems/EquippableSystem')
    // },
    {
      uuid: 'xre.engine.PhysicsSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemLoader: () => import('./physics/systems/PhysicsSystem')
    },
    {
      uuid: 'xre.engine.TriggerSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemLoader: () => import('./scene/systems/TriggerSystem')
    }
  )
  if (isClient) {
    systemsToLoad.push(
      {
        uuid: 'xre.engine.AutopilotSystem',
        type: SystemUpdateType.UPDATE,
        systemLoader: () => import('./navigation/systems/AutopilotSystem')
      },
      {
        uuid: 'xre.engine.PortalSystem',
        type: SystemUpdateType.UPDATE,
        systemLoader: () => import('./scene/systems/PortalSystem')
      },
      {
        uuid: 'xre.engine.HyperspacePortalSystem',
        type: SystemUpdateType.UPDATE,
        systemLoader: () => import('./scene/systems/HyperspacePortalSystem')
      },
      {
        uuid: 'xre.engine.AvatarTeleportSystem',
        type: SystemUpdateType.FIXED,
        systemLoader: () => import('./avatar/AvatarTeleportSystem')
      },
      {
        uuid: 'xre.engine.AvatarControllerSystem',
        type: SystemUpdateType.FIXED,
        systemLoader: () => import('./avatar/AvatarControllerSystem')
      },
      {
        uuid: 'xre.engine.InteractiveSystem',
        type: SystemUpdateType.UPDATE_LATE,
        systemLoader: () => import('./interaction/systems/InteractiveSystem')
      },
      {
        uuid: 'xre.engine.MediaSystem',
        type: SystemUpdateType.PRE_RENDER,
        systemLoader: () => import('./audio/systems/MediaSystem')
      },
      {
        uuid: 'xre.engine.MountPointSystem',
        type: SystemUpdateType.PRE_RENDER,
        systemLoader: () => import('./interaction/systems/MountPointSystem')
      },
      {
        uuid: 'xre.engine.PositionalAudioSystem',
        type: SystemUpdateType.PRE_RENDER,
        systemLoader: () => import('./audio/systems/PositionalAudioSystem')
      },
      {
        uuid: 'xre.engine.MediaControlSystem',
        type: SystemUpdateType.PRE_RENDER,
        systemLoader: () => import('./interaction/systems/MediaControlSystem')
      },
      {
        uuid: 'xre.engine.AvatarLoadingSystem',
        type: SystemUpdateType.PRE_RENDER,
        systemLoader: () => import('./avatar/AvatarLoadingSystem')
      },
      {
        uuid: 'xre.engine.AnimationSystem',
        type: SystemUpdateType.PRE_RENDER,
        systemLoader: () => import('./avatar/AnimationSystem')
      },
      {
        uuid: 'xre.engine.ParticleSystem',
        type: SystemUpdateType.PRE_RENDER,
        systemLoader: () => import('./scene/systems/ParticleSystem')
      },
      {
        uuid: 'xre.engine.DebugHelpersSystem',
        type: SystemUpdateType.PRE_RENDER,
        systemLoader: () => import('./debug/systems/DebugHelpersSystem')
      },
      {
        uuid: 'xre.engine.DebugRenderer',
        type: SystemUpdateType.PRE_RENDER,
        systemLoader: () => import('./debug/systems/DebugRenderer')
      },
      {
        uuid: 'xre.engine.HighlightSystem',
        type: SystemUpdateType.PRE_RENDER,
        systemLoader: () => import('./renderer/HighlightSystem')
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
    uuid: 'xre.engine.WorldNetworkActionSystem',
    type: SystemUpdateType.FIXED_EARLY,
    systemLoader: () => import('./networking/systems/WorldNetworkActionSystem')
  })

  if (media) {
    systemsToLoad.push({
      uuid: 'xre.engine.MediaStreamSystem',
      type: SystemUpdateType.UPDATE,
      systemLoader: () => import('./networking/systems/MediaStreamSystem')
    })
  }

  if (pose) {
    systemsToLoad.push(
      {
        uuid: 'xre.engine.IncomingNetworkSystem',
        type: SystemUpdateType.FIXED_EARLY,
        systemLoader: () => import('./networking/systems/IncomingNetworkSystem')
      },
      {
        uuid: 'xre.engine.OutgoingNetworkSystem',
        type: SystemUpdateType.FIXED_LATE,
        systemLoader: () => import('./networking/systems/OutgoingNetworkSystem')
      }
    )
  }

  await initSystems(Engine.instance.currentWorld, systemsToLoad)
}
