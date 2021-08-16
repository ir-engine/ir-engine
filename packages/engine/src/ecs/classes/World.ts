import { createWorld } from '../../ecs/bitecs'
import { Entity } from './Entity'

export interface ECSWorld {
  _removedComponents: Map<Entity, any>
  delta: number
  time: number
  world: World
}

let worldIds = 0
export class World {
  static worlds: Map<number, World> = new Map<number, World>()
  static defaultWorld: World = new World()
  ecsWorld: ECSWorld
  entities: Entity[]

  constructor() {
    World.worlds.set(worldIds++, this)
    this.ecsWorld = createWorld() as ECSWorld
    this.ecsWorld._removedComponents = new Map()
    this.entities = []
    this.ecsWorld.world = this
  }
}
