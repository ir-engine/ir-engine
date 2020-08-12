import { Component, ComponentConstructor } from "./Component"
import { ComponentManager } from "./ComponentManager"
import { Entity } from "./Entity"
import { EntityManager } from "./EntityManager"
import { ObjectPool } from "./ObjectPool"
import { System, SystemConstructor } from "./System"
//
//
//
//
//   play(): void
//   stop(): void
//
//
import { SystemManager } from "./SystemManager"
import { hasWindow, now } from "./Utils"

export interface WorldOptions {
  entityPoolSize?: number
  [propName: string]: any
}

const DEFAULT_OPTIONS = {
  entityPoolSize: 0,
  entityClass: Entity
}

export class World {
  enabled: boolean
  componentsManager: ComponentManager
  entityManager: EntityManager
  systemManager: SystemManager
  options: { entityPoolSize: number; entityClass: typeof Entity } & WorldOptions
  eventQueues: {}
  lastTime: number
  constructor(options?: WorldOptions) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, options)

    this.componentsManager = new ComponentManager()
    this.entityManager = new EntityManager(this)
    this.systemManager = new SystemManager(this)

    this.enabled = true

    this.eventQueues = {}

    if (hasWindow && typeof CustomEvent !== "undefined") {
      const event = new CustomEvent("ecsy-world-created", {
        detail: { world: this }
      })
      window.dispatchEvent(event)
    }

    this.lastTime = now() / 1000
  }

  registerComponent<C extends Component<any>>(
    Component: ComponentConstructor<C>,
    objectPool?: ObjectPool<C> | false
  ): this {
    this.componentsManager.registerComponent(Component, objectPool)
    return this
  }

  registerSystem(System: SystemConstructor<any>, attributes?: object): this {
    this.systemManager.registerSystem(System, attributes)
    return this
  }

  hasRegisteredComponent<C extends Component<any>>(Component: ComponentConstructor<C>): boolean {
    return this.componentsManager.hasComponent(Component)
  }

  unregisterSystem(System: SystemConstructor<any>): this {
    this.systemManager.unregisterSystem(System)
    return this
  }

  getSystem<S extends System>(System: SystemConstructor<S>): S {
    return this.systemManager.getSystem(System)
  }

  getSystems(): Array<System> {
    return this.systemManager.getSystems()
  }

  execute(delta?: number, time?: number): void {
    if (!delta) {
      time = now() / 1000
      delta = time - this.lastTime
      this.lastTime = time
    }

    if (this.enabled) {
      this.systemManager.execute(delta, time)
      this.entityManager.processDeferredRemoval()
    }
  }

  stop(): void {
    this.enabled = false
  }

  play(): void {
    this.enabled = true
  }

  createEntity(name?: string): Entity {
    return this.entityManager.createEntity(name)
  }

  stats(): { entities: any; system: any } {
    const stats = {
      entities: this.entityManager.stats(),
      system: this.systemManager.stats()
    }

    return stats
  }
}
