import _ from 'lodash'
import { BufferGeometry, Mesh, PerspectiveCamera, Scene } from 'three'
import { acceleratedRaycast, disposeBoundsTree, computeBoundsTree } from 'three-mesh-bvh'
import { CameraSystem } from '@xrengine/engine/src/camera/systems/CameraSystem'
import { Timer } from '@xrengine/engine/src/common/functions/Timer'
import { DebugHelpersSystem } from '@xrengine/engine/src/debug/systems/DebugHelpersSystem'
import { Engine, AudioListener } from '@xrengine/engine/src/ecs/classes/Engine'
import { execute } from '@xrengine/engine/src/ecs/functions/EngineFunctions'
import { registerSystem } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { InteractiveSystem } from '@xrengine/engine/src/interaction/systems/InteractiveSystem'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { ClientNetworkSystem } from '@xrengine/engine/src/networking/systems/ClientNetworkSystem'
import { ParticleSystem } from '@xrengine/engine/src/particles/systems/ParticleSystem'
import { PhysicsSystem } from '@xrengine/engine/src/physics/systems/PhysicsSystem'
import { HighlightSystem } from '@xrengine/engine/src/renderer/HighlightSystem'
import { WebGLRendererSystem } from '@xrengine/engine/src/renderer/WebGLRendererSystem'
import { ServerSpawnSystem } from '@xrengine/engine/src/scene/systems/ServerSpawnSystem'
import { StateSystem } from '@xrengine/engine/src/state/systems/StateSystem'
import { CharacterInputSchema } from '@xrengine/engine/src/character/CharacterInputSchema'
import { DefaultNetworkSchema } from '@xrengine/engine/src/networking/templates/DefaultNetworkSchema'
import { TransformSystem } from '@xrengine/engine/src/transform/systems/TransformSystem'
import { MainProxy } from '@xrengine/engine/src/worker/MessageQueue'
import { ActionSystem } from '@xrengine/engine/src/input/systems/ActionSystem'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { proxyEngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { XRSystem } from '@xrengine/engine/src/xr/systems/XRSystem'
// import { PositionalAudioSystem } from './audio/systems/PositionalAudioSystem';
import { receiveWorker } from '@xrengine/engine/src/worker/MessageQueue'
import { AnimationManager } from '@xrengine/engine/src/character/AnimationManager'
import { CharacterControllerSystem } from '@xrengine/engine/src/character/CharacterControllerSystem'
import { UIPanelSystem } from '@xrengine/engine/src/ui-old/systems/UIPanelSystem'
//@ts-ignore
import { PhysXInstance } from 'three-physx'
import { ClientNetworkStateSystem } from '@xrengine/engine/src/networking/systems/ClientNetworkStateSystem'
import { now } from '@xrengine/engine/src/common/functions/now'
import { GameManagerSystem } from '@xrengine/engine/src/game/systems/GameManagerSystem'

Mesh.prototype.raycast = acceleratedRaycast
BufferGeometry.prototype['disposeBoundsTree'] = disposeBoundsTree
BufferGeometry.prototype['computeBoundsTree'] = computeBoundsTree

export const DefaultOffscreenInitializationOptions = {
  input: {
    schema: CharacterInputSchema
  },
  networking: {
    schema: DefaultNetworkSchema
  }
}

/**
 * @todo
 * add proxies for all singletons (engine, systems etc) in the same way engine events has
 */

/**
 *
 * @author Josh Field <github.com/HexaField>
 */
const initializeEngineOffscreen = async ({ canvas, userArgs }, proxy: MainProxy) => {
  const { initOptions, useOfflineMode, postProcessing, physicsWorldConfig } = userArgs
  const options = _.defaultsDeep({}, initOptions, DefaultOffscreenInitializationOptions)

  proxyEngineEvents(proxy)
  EngineEvents.instance.once(EngineEvents.EVENTS.JOINED_WORLD, () => {
    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.ENABLE_SCENE, renderer: true, physics: true })
  })

  Engine.lastTime = now() / 1000
  Engine.scene = new Scene()
  Engine.publicPath = location.origin

  Network.instance = new Network()
  Network.instance.schema = options.networking.schema
  // @ts-ignore
  Network.instance.transport = { isServer: false }

  /** @todo fix bundling */
  // if((window as any).safariWebBrowser) {
  const physicsWorker = new Worker('/scripts/loadPhysXClassic.js')
  // } else {
  //   //@ts-ignore
  //   const { default: PhysXWorker } = await import('./physics/functions/loadPhysX.ts?worker&inline');
  //   await PhysXInstance.instance.initPhysX(new PhysXWorker(), { });
  // }
  Engine.workers.push(physicsWorker)

  new AnimationManager()

  // promise in parallel to speed things up
  await Promise.all([AnimationManager.instance.getDefaultModel(), AnimationManager.instance.getAnimations()])

  // NETWORK
  registerSystem(ClientNetworkStateSystem, { priority: 1 })

  // FREE systems
  registerSystem(XRSystem, { priority: 1 }) // Free
  registerSystem(CameraSystem, { priority: 2 }) // Free
  registerSystem(WebGLRendererSystem, { priority: 3, canvas, postProcessing }) // Free

  // LOGIC - Input
  registerSystem(UIPanelSystem, { priority: 2 })
  registerSystem(ActionSystem, { priority: 3 })
  registerSystem(CharacterControllerSystem, { priority: 4 })

  // LOGIC - Scene
  registerSystem(InteractiveSystem, { priority: 5 })
  registerSystem(GameManagerSystem, { priority: 6 })
  registerSystem(TransformSystem, { priority: 7 }) // Free
  registerSystem(PhysicsSystem, { worker: physicsWorker, physicsWorldConfig, priority: 8 })

  // LOGIC - Miscellaneous
  registerSystem(HighlightSystem, { priority: 9 })
  registerSystem(ParticleSystem, { priority: 10 })
  registerSystem(DebugHelpersSystem, { priority: 11 })

  Engine.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000)
  Engine.scene.add(Engine.camera)
  Engine.viewportElement = Engine.renderer.domElement

  setInterval(() => {
    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.ENTITY_DEBUG_DATA })
  }, 1000)

  await Promise.all(
    Engine.systems.map((system) => {
      return new Promise<void>(async (resolve) => {
        await system.initialize()
        system.initialized = true
        resolve()
      })
    })
  )

  // only start the engine once we have all our entities loaded
  EngineEvents.instance.once(EngineEvents.EVENTS.SCENE_LOADED, () => {
    Engine.engineTimer = Timer(
      {
        networkUpdate: (delta: number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Network),
        fixedUpdate: (delta: number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Fixed),
        update: (delta, elapsedTime) => execute(delta, elapsedTime, SystemUpdateType.Free)
      },
      Engine.physicsFrameRate,
      Engine.networkFramerate
    )

    Engine.engineTimer.start()
  })

  EngineEvents.instance.once(ClientNetworkSystem.EVENTS.CONNECT, ({ id }) => {
    Network.instance.isInitialized = true
    Network.instance.userId = id
  })

  Engine.isInitialized = true
  EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.INITIALIZED_ENGINE })
}

receiveWorker(initializeEngineOffscreen)
