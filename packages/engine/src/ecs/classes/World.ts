import { createWorld } from 'bitecs'
import { createEntity } from '../functions/EntityFunctions'
import { Entity } from './Entity'

export type PipelineType = (world: ECSWorld) => ECSWorld

export interface ECSWorld {
  _removedComponents: Map<Entity, any>
  delta: number
  fixedDelta: number
  elapsedTime: number
  world: World
}

let worldIds = 0
export class World {
  static worlds: Map<number, World> = new Map<number, World>()
  static defaultWorld: World
  static sceneMetadata: string
  static worldMetadata: { [key: string]: string } = {}
  ecsWorld: ECSWorld
  entities: Entity[]
  portalEntities: Entity[]
  isInPortal = false
  framePipeline: PipelineType
  logicPipeline: PipelineType
  namedEntities: Map<string, Entity>

  constructor() {
    if (typeof World.defaultWorld === 'undefined') {
      World.defaultWorld = this
    }
    World.worlds.set(worldIds++, this)
    this.ecsWorld = createWorld() as ECSWorld
    this.ecsWorld._removedComponents = new Map()
    this.ecsWorld.world = this
    this.portalEntities = []
    this.namedEntities = new Map()
    this.entities = []
    createEntity(this.ecsWorld) // make sure we have no eid 0; also, world entity?
  }

  execute(delta, elapsedTime) {
    this.ecsWorld.delta = delta
    this.ecsWorld.elapsedTime = elapsedTime
    this.framePipeline(this.ecsWorld)
    this.ecsWorld._removedComponents.clear()
  }
}
