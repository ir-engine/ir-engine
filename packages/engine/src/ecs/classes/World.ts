import { createWorld } from '../../ecs/bitecs'
import { Entity } from './Entity'

export type PipelineType = (world: ECSWorld) => ECSWorld
export interface EnginePipelines {
  fixedPipeline: PipelineType
  freePipeline: PipelineType
  networkPipeline: PipelineType
  [x: string]: PipelineType
}

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
  portalEntities: Entity[]
  pipelines: EnginePipelines

  constructor() {
    World.worlds.set(worldIds++, this)
    this.ecsWorld = createWorld() as ECSWorld
    this.ecsWorld._removedComponents = new Map()
    this.entities = []
    this.ecsWorld.world = this
    this.portalEntities = []
  }
}
