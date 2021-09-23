import { isClient } from '../../common/functions/isClient'
import { Action } from '../../networking/interfaces/Action'
import { defineQuery, getComponent, hasComponent, MappedComponent } from '../functions/ComponentFunctions'
import { createEntity } from '../functions/EntityFunctions'
import { InjectionPoint, SystemFactoryType, SystemInjectionType } from '../functions/SystemFunctions'
import { Entity } from './Entity'
import { System } from './System'
import { Engine } from './Engine'
import * as bitecs from 'bitecs'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { Physics } from '../../physics/classes/Physics'
import { HostUserId, UserId } from '@xrengine/common/src/interfaces/UserId'
import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'

type SystemInstanceType = { execute: System; systemLabel: string }

const CreateWorld = Symbol('CreateWorld')
export class World {
  private constructor() {
    bitecs.createWorld(this)
    Engine.worlds.push(this)
    this.worldEntity = createEntity(this)
    this.localClientEntity = isClient ? (createEntity(this) as Entity) : (NaN as Entity)
    if (!Engine.defaultWorld) Engine.defaultWorld = this
  }

  static [CreateWorld] = () => new World()

  sceneMetadata = undefined as string | undefined
  worldMetadata = {} as { [key: string]: string }

  delta = NaN
  elapsedTime = NaN
  fixedDelta = NaN
  fixedElapsedTime = NaN
  fixedTick = -1

  _removedComponents = new Map<Entity, Set<MappedComponent<any, any>>>()
  _freePipeline = [] as SystemFactoryType<any>[]
  _fixedPipeline = [] as SystemFactoryType<any>[]

  _injectedPipelines = {
    [InjectionPoint.UPDATE]: [] as SystemInjectionType<any>[],
    [InjectionPoint.FIXED_EARLY]: [] as SystemInjectionType<any>[],
    [InjectionPoint.FIXED]: [] as SystemInjectionType<any>[],
    [InjectionPoint.FIXED_LATE]: [] as SystemInjectionType<any>[],
    [InjectionPoint.PRE_RENDER]: [] as SystemInjectionType<any>[],
    [InjectionPoint.POST_RENDER]: [] as SystemInjectionType<any>[]
  }

  physics = new Physics()
  entities = [] as Entity[]
  portalEntities = [] as Entity[]
  isInPortal = false

  /** Incoming actions */
  incomingActions = new Set<Required<Action>>()

  /** Outgoing actions */
  outgoingActions = new Set<Action>()

  /**
   * Check if this user is hosting the world.
   */
  get isHosting() {
    return Engine.userId === this.hostId
  }

  /**
   * The UserId of the host
   */
  hostId = 'server' as HostUserId

  /**
   * The world entity (always exists, and always has eid 0)
   */
  worldEntity: Entity

  /**
   * The local client entity
   */
  localClientEntity = undefined! as Entity

  /**
   * Systems that run only once every frame.
   * Ideal for cosmetic updates (e.g., particles), animation, rendering, etc.
   */
  freeSystems = [] as SystemInstanceType[]

  /**
   * Systems that run once for every fixed time interval (in simulation time).
   * Ideal for game logic, ai logic, simulation logic, etc.
   */
  fixedSystems = [] as SystemInstanceType[]

  /**
   * Custom systems injected into this world
   */
  injectedSystems = {
    [InjectionPoint.UPDATE]: [],
    [InjectionPoint.FIXED_EARLY]: [],
    [InjectionPoint.FIXED]: [],
    [InjectionPoint.FIXED_LATE]: [],
    [InjectionPoint.PRE_RENDER]: [],
    [InjectionPoint.POST_RENDER]: []
  } as { [pipeline: string]: SystemInstanceType[] }

  /**
   * Entities mapped by name
   */
  namedEntities = new Map<string, Entity>()

  /**
   * Network object query
   */
  networkObjectQuery = defineQuery([NetworkObjectComponent])

  /**
   * Get the network objects owned by a given user
   * @param userId
   */
  getOwnedNetworkObjects(userId: UserId) {
    return this.networkObjectQuery().filter((eid) => getComponent(eid, NetworkObjectComponent).userId === userId)
  }

  /**
   * Get a network object by NetworkId
   * @returns
   */
  getNetworkObject(networkId: NetworkId) {
    return this.networkObjectQuery().find((eid) => getComponent(eid, NetworkObjectComponent).networkId === networkId)!
  }

  /**
   * Get the user avatar entity (the network object w/ an Avatar component)
   * @param userId
   * @returns
   */
  getUserAvatarEntity(userId: UserId) {
    return this.getOwnedNetworkObjects(userId).find((eid) => {
      return hasComponent(eid, AvatarComponent, this)
    })!
  }

  /**
   * Action receptors
   */
  receptors = new Set<(action: Action) => void>()

  /**
   * Execute systems on this world
   *
   * @param delta
   * @param elapsedTime
   */
  execute(delta: number, elapsedTime: number) {
    this.delta = delta
    this.elapsedTime = elapsedTime
    for (const system of this.freeSystems) system.execute()
    for (const [entity, components] of this._removedComponents) {
      for (const c of components) c.delete(entity)
    }
    this._removedComponents.clear()
  }

  async initSystems() {
    const loadSystem = (pipelineTypeLabel: string, pipeline: SystemFactoryType<any>[] | SystemInjectionType<any>[]) => {
      return pipeline.map(async (s) => {
        const systemFactory = (await s.system).default
        const execute = await systemFactory(this, s.args)
        return { execute, systemLabel: `${pipelineTypeLabel} ${systemFactory.name}` } as SystemInstanceType
      })
    }

    const _freeSystems = Promise.all(loadSystem('FREE', this._freePipeline))
    const _fixedSystems = Promise.all(loadSystem('FIXED', this._fixedPipeline))
    const _injectedSystems = Promise.all(
      Object.entries(this._injectedPipelines).map(async ([pipelineType, pipeline]) => {
        return [pipelineType, await Promise.all(loadSystem('Injected' + pipelineType, pipeline))]
      })
    ) as Promise<[keyof typeof this.injectedSystems, SystemInstanceType][]>

    console.log('Awaiting system intializations...')
    const [fixedSystems, freeSystems, injectedSystems] = await Promise.all([
      _fixedSystems,
      _freeSystems,
      _injectedSystems
    ])
    this.fixedSystems = fixedSystems
    this.freeSystems = freeSystems
    this.injectedSystems = Object.fromEntries(injectedSystems) as any
    for (const s of fixedSystems) console.log(s.systemLabel)
    for (const s of freeSystems) console.log(s.systemLabel)
    for (const pipeline in this.injectedSystems)
      for (const s of this.injectedSystems[pipeline]) {
        console.log(s.systemLabel)
      }
    console.log('all systems initialized!')
  }
}

export function createWorld() {
  console.log('Creating world')
  return World[CreateWorld]()
}
