import { Entity } from "./Entity"
import { processDeferredEntityRemoval } from "../functions/EntityFunctions"
import { EntityPool } from "./EntityPool"
import EventDispatcher from "./EventDispatcher"
import Query from "./Query"
import { WebGLRenderer, Camera } from "three"
import { SceneManager } from "../../common/classes/SceneManager"
import { hasWindow, now } from "../functions/Utils"
import { System } from "./System"
import { executeSystem } from "../functions/SystemFunctions"

export interface WorldOptions {
  entityPoolSize?: number
  [propName: string]: any
}

const DEFAULT_OPTIONS = {
  entityPoolSize: 0,
  entityClass: Entity
}

export class World {
  static renderer: WebGLRenderer = null
  static world: World = null
  static sceneManager: SceneManager = new SceneManager()
  static camera: Camera = null
  static eventDispatcher = new EventDispatcher()

  static options: { entityPoolSize: number; entityClass: typeof Entity } & WorldOptions = DEFAULT_OPTIONS
  static enabled = true
  static deferredRemovalEnabled = true

  static systems: any[] = []
  static entities: any[] = []
  static entitiesByName: {} = {}
  static queries: Query[] = []
  static components: any[] = []

  static lastTime: number

  static nextEntityId = 0
  static nextComponentId = 0

  static eventQueues: {} = {}
  static entityPool: EntityPool = new EntityPool()
  static componentsMap: {} = {}
  static componentPool: {} = {}
  static numComponents: {} = {}
  static entitiesWithComponentsToRemove: any[] = []
  static entitiesToRemove: any[] = []

  static executeSystems: any[] = []
  static lastExecutedSystem: any

  static initialize(options?: WorldOptions) {
    initializeWorld(options)
  }
}

export function initializeWorld(options?: WorldOptions) {
  World.options = { ...World.options, ...options }
  if (hasWindow && typeof CustomEvent !== "undefined") {
    const event = new CustomEvent("world-created")
    window.dispatchEvent(event)
  }

  World.lastTime = now() / 1000
}

export function execute(delta?: number, time?: number): void {
  if (!delta) {
    time = now() / 1000
    delta = time - World.lastTime
    World.lastTime = time
  }

  if (World.enabled) {
    World.executeSystems.forEach(system => system.enabled && executeSystem(system, delta, time))
    processDeferredEntityRemoval()
  }
}

export function stop(): void {
  World.enabled = false
  World.executeSystems.forEach(system => system.stop())
}

export function stats(): { entities: any; system: any } {
  const queryStats = {}
  for (const queryName in World.queries) {
    queryStats[queryName] = World.queries[queryName].stats()
  }

  const entityStatus = {
    numEntities: World.entities.length,
    numQueries: Object.keys(System.queries).length,
    queries: queryStats,
    numComponentPool: Object.keys(World.componentPool).length,
    componentPool: {},
    eventDispatcher: (World.eventDispatcher as any).stats
  }

  for (const componentId in World.componentPool) {
    const pool = World.componentPool[componentId]
    entityStatus.componentPool[pool.type.name] = {
      used: pool.totalUsed(),
      size: pool.count
    }
  }

  const systemStatus = {
    numSystems: World.systems.length,
    systems: {}
  }

  for (let i = 0; i < World.systems.length; i++) {
    const system = World.systems[i]
    const systemStats = (systemStatus.systems[system.name] = {
      queries: {},
      executeTime: system.executeTime
    })
    for (const name in system.ctx) {
      systemStats.queries[name] = system.ctx[name].stats()
    }
  }

  return {
    entities: entityStatus,
    system: systemStatus
  }
}
