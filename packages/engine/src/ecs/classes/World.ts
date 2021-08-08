import { 
  IWorld,
  createWorld
} from 'bitecs'

import { Entity } from './Entity'

export interface ECSWorld extends IWorld {
  removedComponents: Map<Entity, any>
  delta: number
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
    this.ecsWorld.removedComponents = new Map()
  }
}