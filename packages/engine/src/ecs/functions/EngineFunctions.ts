/** Functions to provide engine level functionalities. */
import * as bitecs from 'bitecs'
import { Color } from 'three'
import { PhysXInstance } from 'three-physx'
import { ActionType, IncomingActionType } from '../..'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { disposeDracoLoaderWorkers } from '../../assets/functions/LoadGLTF'
import { isClient } from '../../common/functions/isClient'
import { Network } from '../../networking/classes/Network'
import { Vault } from '../../networking/classes/Vault'
import { createPhysXWorker } from '../../physics/functions/createPhysXWorker'
import disposeScene from '../../renderer/functions/disposeScene'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { PersistTagComponent } from '../../scene/components/PersistTagComponent'
import { WorldScene } from '../../scene/functions/SceneLoading'
import { Engine } from '../classes/Engine'
import { Entity } from '../classes/Entity'
import { World } from '../classes/World'
import {
  ComponentType,
  createEntity,
  hasComponent,
  MappedComponent,
  removeAllComponents,
  removeEntity
} from './EntityFunctions'
import { SystemInitializeType } from './SystemFunctions'
import { useWorld } from './SystemHooks'

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

    /**
     * Systems that run only once every frame.
     * Ideal for cosmetic updates (e.g., particles), animation, rendering, etc.
     */
    freeSystems: [] as ((world: bitecs.IWorld) => void)[],

    /**
     * Systems that run once for every fixed time interval (in simulation time).
     * Ideal for game logic, ai logic, simulation logic, etc.
     */
    fixedSystems: [] as ((world: bitecs.IWorld) => void)[],

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
      for (const system of world.freeSystems) system(world)
      for (const [entity, components] of world._removedComponents) {
        for (const c of components) c.delete(entity)
      }
      world._removedComponents.clear()
    },

    async initSystems() {
      const fixedSystems = await Promise.all(
        world._fixedPipeline.map((s) => {
          console.log(`Initializing fixed system: ${s.system.name}`)
          return s.system(world, s.args)
        })
      )
      const freeSystems = await Promise.all(
        world._freePipeline.map((s) => {
          console.log(`Initializing free system: ${s.system.name}`)
          return s.system(world, s.args)
        })
      )
      world.fixedSystems = fixedSystems
      world.freeSystems = freeSystems
    }
  }

  const world = Object.assign(bitecs.createWorld(), worldShape) as typeof worldShape

  ;(Engine.worlds as any).push(world) // TS complains about circular type definition without casting Engine.worlds to any
  if (!Engine.defaultWorld) Engine.defaultWorld = world

  createEntity(world) // make sure we have no eid 0 so that if (!entity) works; also, world entity = 0?

  return world
}
