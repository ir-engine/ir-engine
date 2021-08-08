import { 
  IWorld,
  createWorld
} from 'bitecs'

import { Entity } from './Entity'

export interface ECSWorld {
  _removedComponents: Map<Entity, any>
  delta: number
  time: number
}

let worldIds = 0
export class World {
  static worlds: Map<number, World> = new Map<number, World>()
  static defaultWorld: World
  ecsWorld: ECSWorld

  constructor() {
    if(!World.defaultWorld) World.defaultWorld = this
    World.worlds.set(worldIds++, this)
    this.ecsWorld = createWorld() as ECSWorld
    this.ecsWorld._removedComponents = new Map()
  }
}