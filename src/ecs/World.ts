import { Component, ComponentConstructor } from "./Component"
import { Entity } from "./Entity"
import { EntityPool } from "./EntityPool"
import { ObjectPool } from "./ObjectPool"
import { System, SystemConstructor } from "./System"
import { hasWindow, now, getName, queryKey } from "./Utils"
import { EventDispatcher } from "three"
import { SceneManager } from "../common"
import { CameraManager } from "../camera"
import { SystemStateComponent } from "./SystemStateComponent"
import Query from "./Query"

const ENTITY_CREATED = "EntityManager#ENTITY_CREATE"
const ENTITY_REMOVED = "EntityManager#ENTITY_REMOVED"
const COMPONENT_ADDED = "EntityManager#COMPONENT_ADDED"
const COMPONENT_REMOVE = "EntityManager#COMPONENT_REMOVE"

export interface WorldOptions {
  entityPoolSize?: number
  [propName: string]: any
}

const DEFAULT_OPTIONS = {
  entityPoolSize: 0,
  entityClass: Entity
}

export class World {
  static world: World = null
  static sceneManager: SceneManager = new SceneManager()
  static cameraManager: CameraManager = new CameraManager()
  static eventDispatcher = new EventDispatcher()

  static options: { entityPoolSize: number; entityClass: typeof Entity } & WorldOptions = DEFAULT_OPTIONS
  static enabled = true
  static deferredRemovalEnabled: boolean

  static systems: any[]
  static entities: any[]
  static entitiesByName: {}
  static queries: Query[]
  static components: any[]

  static lastTime: number

  static nextEntityId: number
  static nextComponentId: number

  static eventQueues: {}
  static entityPool: EntityPool = new EntityPool()
  static componentsMap: {}
  static componentPool: {}
  static numComponents: {}
  static entitiesWithComponentsToRemove: any[]
  static entitiesToRemove: any[]

  static executeSystems: any[]
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

export function registerComponent<C extends Component<any>>(
  Component: ComponentConstructor<C>,
  objectPool?: ObjectPool<C> | false
): void {
  if (World.components.indexOf(Component) !== -1) {
    console.warn(`Component type: '${getName(Component)}' already registered.`)
    return
  }

  const schema = Component.schema

  if (!schema) {
    throw new Error(`Component "${getName(Component)}" has no schema property.`)
  }

  for (const propName in schema) {
    const prop = schema[propName]

    if (!prop.type) {
      throw new Error(`Invalid schema for component "${getName(Component)}". Missing type for "${propName}" property.`)
    }
  }

  Component._typeId = World.nextComponentId++
  World.components.push(Component)
  World.componentsMap[Component._typeId] = Component
  World.numComponents[Component._typeId] = 0

  if (objectPool === undefined) {
    objectPool = new ObjectPool(Component)
  } else if (objectPool === false) {
    objectPool = undefined
  }

  World.componentPool[Component._typeId] = objectPool
}

export function registerSystem(SystemClass: SystemConstructor<any>, attributes?: object): void {
  if (!SystemClass.isSystem) {
    throw new Error(`System '${SystemClass.name}' does not extend 'System' class`)
  }

  if (getSystem(SystemClass) !== undefined) {
    console.warn(`System '${SystemClass.name}' already registered.`)
  }

  const system = new SystemClass(World.world, attributes)
  if (system.init) system.init(attributes)
  system.order = World.systems.length
  World.systems.push(system)
  if (system.execute) {
    World.executeSystems.push(system)
    sortSystems()
  }
}

export function hasRegisteredComponent<C extends Component<any>>(Component: ComponentConstructor<C>): boolean {
  return World.components.indexOf(Component) !== -1
}

export function unregisterSystem(SystemClass: SystemConstructor<any>): void {
  const system = getSystem(SystemClass)
  if (system === undefined) {
    console.warn(`Can unregister system '${SystemClass.name}'. It doesn't exist.`)
  }

  World.systems.splice(World.systems.indexOf(system), 1)

  if (system.execute) World.executeSystems.splice(World.executeSystems.indexOf(system), 1)
}

export function getSystem<S extends System>(SystemClass: SystemConstructor<S>): S {
  return World.systems.find(s => s instanceof SystemClass)
}

export function getSystems(): Array<System> {
  return World.systems
}

export function execute(delta?: number, time?: number): void {
  if (!delta) {
    time = now() / 1000
    delta = time - World.lastTime
    World.lastTime = time
  }

  if (World.enabled) {
    World.executeSystems.forEach(system => system.enabled && this.executeSystem(system, delta, time))
    processDeferredRemoval()
  }
}

export function stop(): void {
  World.enabled = false
  World.executeSystems.forEach(system => system.stop())
}

export function removeSystem(SystemClass) {
  const index = World.systems.indexOf(SystemClass)
  if (!~index) return

  World.systems.splice(index, 1)
}

export function executeSystem(system: System, delta: number, time: number): void {
  if (system.initialized) {
    if (system.canExecute()) {
      const startTime = now()
      system.execute(delta, time)
      system.executeTime = now() - startTime
      World.lastExecutedSystem = system
    }
  }
}

function sortSystems() {
  World.executeSystems.sort((a, b) => {
    return a.priority - b.priority || a.order - b.order
  })
}

export function createEntity(name?: string): Entity {
  const entity = World.entityPool.acquire()
  entity.alive = true
  entity.name = name || ""
  if (name) {
    if (World.entitiesByName[name]) {
      console.warn(`Entity name '${name}' already exist`)
    } else {
      World.entitiesByName[name] = entity
    }
  }

  World.entities.push(entity)
  World.eventDispatcher.dispatchEvent({ type: ENTITY_CREATED, attachment: entity })
  return entity
}

export function stats(): { entities: any; system: any } {
  const queryStats = {}
  for (const queryName in World.queries) {
    queryStats[queryName] = World.queries[queryName].stats()
  }

  const entityStatus = {
    numEntities: World.entities.length,
    numQueries: Object.keys(World.queries).length,
    queries: queryStats,
    numComponentPool: Object.keys(World.componentPool).length,
    componentPool: {},
    eventDispatcher: (World.eventDispatcher as any).stats
  }

  for (const componentId in World.componentPool) {
    const pool = World.componentPool[componentId]
    entityStatus.componentPool[pool.T.name] = {
      used: pool.totalUsed(),
      size: pool.count
    }
  }

  const systemStatus = {
    numSystems: this.systems.length,
    systems: {}
  }

  for (let i = 0; i < this.systems.length; i++) {
    const system = this.systems[i]
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

export function componentAddedToEntity(component: Component<any>): void {
  World.numComponents[component._typeId]++
}

export function componentRemovedFromEntity(component: Component<any>): void {
  World.numComponents[component._typeId]--
}

export function getPoolForComponent(component: Component<any>): void {
  World.componentPool[component._typeId]
}

export function getEntityByName(name) {
  return World.entitiesByName[name]
}

// COMPONENTS

/**
 * Add a component to an entity
 * @param {Entity} entity Entity where the component will be added
 * @param {Component} Component Component to be added to the entity
 * @param {Object} values Optional values to replace the default attributes
 */
export function entityAddComponent(entity, Component, values) {
  // @todo Probably define Component._typeId with a default value and avoid using typeof
  if (typeof Component._typeId === "undefined" && !World.componentsMap[Component._typeId]) {
    throw new Error(`Attempted to add unregistered component "${Component.name}"`)
  }

  if (~entity._ComponentTypes.indexOf(Component)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Component type already exists on entity.", entity, Component.name)
    }
    return
  }

  entity._ComponentTypes.push(Component)

  if (Component.__proto__ === SystemStateComponent) {
    entity.numStateComponents++
  }

  const componentPool = new ObjectPool(Component)

  const component = componentPool ? componentPool.acquire() : new Component(values)

  if (componentPool && values) {
    component.copy(values)
  }

  entity._components[Component._typeId] = component

  onEntityComponentAdded(entity, Component)
  componentAddedToEntity(Component)

  World.eventDispatcher.dispatchEvent(COMPONENT_ADDED, entity, Component)
}

/**
 * Remove a component from an entity
 * @param {Entity} entity Entity which will get removed the component
 * @param {*} component Component to remove from the entity
 * @param {Bool} immediately If you want to remove the component immediately instead of deferred (Default is false)
 */
export function removeComponentFromEntity(entity: Entity, component: Component<any>, immediately?: boolean): void {
  const index = entity.componentTypes.indexOf(component)
  if (!~index) return

  World.eventDispatcher.dispatchEvent(COMPONENT_REMOVE, entity, component)

  if (immediately) {
    removeComponentFromEntitySync(entity, component, index)
  } else {
    if (entity.componentTypesToRemove.length === 0) World.entitiesWithComponentsToRemove.push(entity)

    entity.componentTypes.splice(index, 1)
    entity.componentTypesToRemove.push(component)

    entity.componentsToRemove[component._typeId] = entity.components[component._typeId]
    delete entity.components[component._typeId]
  }
}

export function onEntityComponentRemoved(entity, component) {
  for (const queryName in this.queries) {
    const query = this.queries[queryName]

    if (!!~query.NotComponents.indexOf(component) && !~query.entities.indexOf(entity) && query.match(entity)) {
      query.addEntity(entity)
      continue
    }

    if (!!~query.Components.indexOf(component) && !!~query.entities.indexOf(entity) && !query.match(entity)) {
      query.removeEntity(entity)
      continue
    }
  }

  if (component instanceof SystemStateComponent) {
    entity.numStateComponents--

    // Check if the entity was a ghost waiting for the last system state component to be removed
    if (entity.numStateComponents === 0 && !entity.alive) {
      entity.remove()
    }
  }
}

export function onEntityRemoved(entity) {
  for (const queryName in this.queries) {
    const query = this.queries[queryName]
    if (entity.queries.indexOf(query) !== -1) {
      query.removeEntity(entity)
    }
  }
}

export function onEntityComponentAdded(entity, Component) {
  // Check each indexed query to see if we need to add this entity to the list
  for (const queryName in this.queries) {
    const query = this.queries[queryName]

    if (!!~query.NotComponents.indexOf(Component) && ~query.entities.indexOf(entity)) {
      query.removeEntity(entity)
      continue
    }

    // Add the entity only if:
    // Component is in the query
    // and Entity has ALL the components of the query
    // and Entity is not already in the query
    if (!~query.Components.indexOf(Component) || !query.match(entity) || ~query.entities.indexOf(entity)) continue

    query.addEntity(entity)
  }
}

export function getQuery(components: Entity[]): Query {
  const key = queryKey(components)
  let query = this.queries[key]
  if (!query) {
    this.queries[key] = query = new Query(key)
  }
  return query
}

export function removeComponentFromEntitySync(entity: Entity, component: Component<any>, index: number): void {
  // Remove T listing on entity and property ref, then free the component.
  entity.componentTypes.splice(index, 1)
  const c = entity.components[component._typeId]
  delete entity.components[component._typeId]
  c.dispose()
  componentRemovedFromEntity(c)
}

export function removeAllComponentsFromEntity(entity: Entity, immediately?: boolean): void {
  const Components = entity.componentTypes

  for (let j = Components.length - 1; j >= 0; j--) {
    if (Components[j].__proto__ !== SystemStateComponent) removeComponentFromEntity(entity, Components[j], immediately)
  }
}

export function removeEntity(entity: Entity, immediately?: boolean): void {
  const index = World.entities.indexOf(entity)

  if (!~index) throw new Error("Tried to remove entity not in list")

  entity.alive = false

  if (entity.numStateComponents === 0) {
    // Remove from entity list
    World.eventDispatcher.dispatchEvent(ENTITY_REMOVED, entity)
    onEntityRemoved(entity)
    if (immediately === true) {
      releaseEntity(entity, index)
    } else {
      World.entitiesToRemove.push(entity)
    }
  }

  removeAllComponentsFromEntity(entity, immediately)
}

export function removeAllEntities(): void {
  for (let i = World.entities.length - 1; i >= 0; i--) {
    removeEntity(World.entities[i])
  }
}

function releaseEntity(entity: Entity, index: number): void {
  World.entities.splice(index, 1)

  if (World.entitiesByName[entity.name]) {
    delete World.entitiesByName[entity.name]
  }
  World.entityPool.release(entity)
}

let entitiesToRemove
let entitiesWithComponentsToRemove

function processDeferredRemoval() {
  if (!World.deferredRemovalEnabled) {
    return
  }

  for (let i = 0; i < entitiesToRemove.length; i++) {
    const entity = entitiesToRemove[i]
    const index = World.entities.indexOf(entity)
    releaseEntity(entity, index)
  }
  entitiesToRemove.length = 0

  for (let i = 0; i < entitiesWithComponentsToRemove.length; i++) {
    const entity = entitiesWithComponentsToRemove[i]
    while (entity._ComponentTypesToRemove.length > 0) {
      const Component = entity._ComponentTypesToRemove.pop()

      const component = entity._componentsToRemove[Component._typeId]
      delete entity._componentsToRemove[Component._typeId]
      component.dispose()
      componentRemovedFromEntity(Component)
    }
  }

  World.entitiesWithComponentsToRemove.length = 0
}
