/** Functions to provide engine level functionalities. */
import * as bitecs from 'bitecs'
import { Color } from 'three'
import { PhysXInstance } from '../../physics/physx'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { disposeDracoLoaderWorkers } from '../../assets/functions/LoadGLTF'
import { isClient } from '../../common/functions/isClient'
import { Network } from '../../networking/classes/Network'
import { Vault } from '../../networking/classes/Vault'
import disposeScene from '../../renderer/functions/disposeScene'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { PersistTagComponent } from '../../scene/components/PersistTagComponent'
import { WorldScene } from '../../scene/functions/SceneLoading'
import { Engine } from '../classes/Engine'
import { Entity } from '../classes/Entity'
import { hasComponent, MappedComponent, removeAllComponents } from './ComponentFunctions'
import { InjectionPoint, SystemInitializeType } from './SystemFunctions'
import { removeEntity, createEntity } from './EntityFunctions'
import { ActionType } from '../../networking/interfaces/NetworkTransport'

/** Reset the engine and remove everything from memory. */
export async function reset(): Promise<void> {
  console.log('RESETTING ENGINE')
  // Stop all running workers
  Engine.workers.forEach((w) => w.terminate())
  Engine.workers.length = 0

  disposeDracoLoaderWorkers()

  // clear all entities components
  // await new Promise<void>((resolve) => {
  //   Engine.defaultWorld.entities.forEach((entity) => {
  //     removeAllComponents(entity)
  //   })
  //   setTimeout(() => {
  //     executeSystemBeforeReset() // for systems to handle components deletion
  //     resolve()
  //   }, 500)
  // })

  // await new Promise<void>((resolve) => {
  //   // delete all entities
  //   removeAllEntities()
  //   setTimeout(() => {
  //     executeSystemBeforeReset() // for systems to handle components deletion
  //     resolve()
  //   }, 500)
  // })

  // if (Engine.defaultWorld.entities.length) {
  //   console.log('Engine.defaultWorld.entities.length', Engine.defaultWorld.entities.length)
  //   throw new Error('Engine.defaultWorld.entities cleanup not complete')
  // }

  Engine.tick = 0

  Engine.defaultWorld.entities.length = 0

  // delete all what is left on scene
  if (Engine.scene) {
    disposeScene(Engine.scene)
    Engine.scene = null
  }
  Engine.sceneLoaded = false
  WorldScene.isLoading = false

  Engine.camera = null

  if (Engine.renderer) {
    Engine.renderer.clear(true, true, true)
    Engine.renderer.dispose()
    Engine.renderer = null
  }

  Network.instance.dispose()

  Vault.instance.clear()
  AssetLoader.Cache.clear()

  Engine.isInitialized = false
  Engine.inputState.clear()
  Engine.prevInputState.clear()
}

export const processLocationChange = async (): Promise<void> => {
  const entitiesToRemove = []
  const removedEntities = []
  const sceneObjectsToRemove = []

  Engine.defaultWorld.entities.forEach((entity) => {
    if (!hasComponent(entity, PersistTagComponent)) {
      removeAllComponents(entity)
      entitiesToRemove.push(entity)
      removedEntities.push(entity)
    }
  })

  Engine.defaultWorld.execute(1 / 60)

  Engine.scene.background = new Color('black')
  Engine.scene.environment = null

  Engine.scene.traverse((o: any) => {
    if (!o.entity) return
    if (!removedEntities.includes(o.entity)) return

    sceneObjectsToRemove.push(o)
  })

  sceneObjectsToRemove.forEach((o) => Engine.scene.remove(o))

  entitiesToRemove.forEach((entity) => {
    removeEntity(entity)
  })

  isClient && EngineRenderer.instance.resetPostProcessing()

  Engine.defaultWorld.execute(1 / 60)

  await resetPhysics()
}

export const resetPhysics = async (): Promise<void> => {
  Engine.physxWorker.terminate()
  Engine.workers.splice(Engine.workers.indexOf(Engine.physxWorker), 1)
  PhysXInstance.instance.dispose()
  PhysXInstance.instance = new PhysXInstance()
}

type SystemGroupInterface = (() => void)[]

export function createWorld() {
  console.log('Creating world')

  const worldShape = {
    sceneMetadata: undefined as string | undefined,
    worldMetadata: {} as { [key: string]: string },

    delta: -1,
    elapsedTime: -1,
    fixedDelta: -1,
    fixedElapsedTime: -1,

    entities: [] as Entity[],
    portalEntities: [] as Entity[],
    isInPortal: false,
    _removedComponents: new Map<Entity, Set<MappedComponent<any, any>>>(),
    _freePipeline: [] as SystemInitializeType<any>[],
    _fixedPipeline: [] as SystemInitializeType<any>[],
    _injectedPipelines: {
      [InjectionPoint.UPDATE]: [] as SystemInitializeType<any>[],
      [InjectionPoint.FIXED_EARLY]: [] as SystemInitializeType<any>[],
      [InjectionPoint.FIXED]: [] as SystemInitializeType<any>[],
      [InjectionPoint.FIXED_LATE]: [] as SystemInitializeType<any>[],
      [InjectionPoint.PRE_RENDER]: [] as SystemInitializeType<any>[],
      [InjectionPoint.POST_RENDER]: [] as SystemInitializeType<any>[]
    },

    /**
     * Systems that run only once every frame.
     * Ideal for cosmetic updates (e.g., particles), animation, rendering, etc.
     */
    freeSystems: [] as SystemGroupInterface,

    /**
     * Systems that run once for every fixed time interval (in simulation time).
     * Ideal for game logic, ai logic, simulation logic, etc.
     */
    fixedSystems: [] as SystemGroupInterface,

    injectedSystems: {
      [InjectionPoint.UPDATE]: [] as SystemGroupInterface,
      [InjectionPoint.FIXED_EARLY]: [] as SystemGroupInterface,
      [InjectionPoint.FIXED]: [] as SystemGroupInterface,
      [InjectionPoint.FIXED_LATE]: [] as SystemGroupInterface,
      [InjectionPoint.PRE_RENDER]: [] as SystemGroupInterface,
      [InjectionPoint.POST_RENDER]: [] as SystemGroupInterface
    },

    /**
     * Entities mapped by name
     */
    namedEntities: new Map<string, Entity>(),

    /**
     * Action receptors
     */
    receptors: new Set<(action: ActionType) => void>(),

    /**
     * Execute systems on this world
     *
     * @param delta
     * @param elapsedTime
     */
    execute(delta: number, elapsedTime?: number) {
      world.delta = delta
      world.elapsedTime = elapsedTime
      for (const system of world.freeSystems) system()
      for (const [entity, components] of world._removedComponents) {
        for (const c of components) c.delete(entity)
      }
      world._removedComponents.clear()
    },

    async initSystems() {
      const loadSystem = (pipeline: SystemInitializeType<any>[]) => {
        return pipeline.map(async (s) => {
          return (await s.system).default(world, s.args)
        })
      }

      const _fixedSystems = Promise.all(loadSystem(world._fixedPipeline))
      const _freeSystems = Promise.all(loadSystem(world._freePipeline))
      const _injectedSystems = Promise.all(
        Object.entries(world._injectedPipelines).map(async ([pipelineType, pipeline]) => {
          return [pipelineType, await Promise.all(loadSystem(pipeline))]
        })
      )

      const [fixedSystems, freeSystems, injectedSystems] = await Promise.all([
        _fixedSystems,
        _freeSystems,
        _injectedSystems
      ])
      world.fixedSystems = fixedSystems
      world.freeSystems = freeSystems
      world.injectedSystems = Object.fromEntries(injectedSystems)
    }
  }

  const world = Object.assign(bitecs.createWorld(), worldShape) as typeof worldShape

  ;(Engine.worlds as any).push(world) // TS complains about circular type definition without casting Engine.worlds to any
  if (!Engine.defaultWorld) Engine.defaultWorld = world

  createEntity(world) // make sure we have no eid 0 so that if (!entity) works; also, world entity = 0?

  return world
}
