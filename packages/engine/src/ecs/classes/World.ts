import { isClient } from '../../common/functions/isClient'
import { Action } from '../../networking/interfaces/Action'
import { addComponent, defineQuery, getComponent, hasComponent, MappedComponent } from '../functions/ComponentFunctions'
import { createEntity } from '../functions/EntityFunctions'
import { SystemFactoryType, SystemModuleType } from '../functions/SystemFunctions'
import { Entity } from './Entity'
import { System } from './System'
import { Engine } from './Engine'
import * as bitecs from 'bitecs'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { Physics } from '../../physics/classes/Physics'
import { HostUserId, UserId } from '@xrengine/common/src/interfaces/UserId'
import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { NetworkClient } from '../../networking/interfaces/NetworkClient'
import { SystemUpdateType } from '../functions/SystemUpdateType'
import { WorldStateInterface } from '../../networking/schema/networkSchema'
import { PersistTagComponent } from '../../scene/components/PersistTagComponent'

type SystemInstanceType = { name: string; type: SystemUpdateType; execute: System }

type RemoveIndex<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K]
}

export const CreateWorld = Symbol('CreateWorld')
export class World {
  private constructor() {
    bitecs.createWorld(this)
    Engine.worlds.push(this)
    this.worldEntity = createEntity(this)
    this.localClientEntity = isClient ? (createEntity(this) as Entity) : (NaN as Entity)
    if (!Engine.defaultWorld) Engine.defaultWorld = this
    addComponent(this.worldEntity, PersistTagComponent, {}, this)
  }

  static [CreateWorld] = () => new World()

  sceneMetadata = undefined as string | undefined
  worldMetadata = {} as { [key: string]: string }

  delta = NaN
  elapsedTime = NaN
  fixedDelta = NaN
  fixedElapsedTime = 0
  fixedTick = -1

  _pipeline = [] as SystemModuleType<any>[]

  physics = new Physics()
  entities = [] as Entity[]
  portalEntities = [] as Entity[]
  isInPortal = false

  /** Connected clients */
  clients = new Map() as Map<UserId, NetworkClient>

  /** Incoming actions */
  incomingActions = new Set<Required<Action>>()

  /** Delayed actions */
  delayedActions = new Set<Required<Action>>()

  /** Outgoing actions */
  outgoingActions = new Set<Action>()

  outgoingNetworkState: WorldStateInterface
  previousNetworkState: WorldStateInterface

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
  localClientEntity: Entity

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
    [SystemUpdateType.UPDATE]: [],
    [SystemUpdateType.FIXED_EARLY]: [],
    [SystemUpdateType.FIXED]: [],
    [SystemUpdateType.FIXED_LATE]: [],
    [SystemUpdateType.PRE_RENDER]: [],
    [SystemUpdateType.POST_RENDER]: []
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
    return this.networkObjectQuery(this).filter((eid) => getComponent(eid, NetworkObjectComponent).userId === userId)
  }

  /**
   * Get a network object by NetworkId
   * @returns
   */
  getNetworkObject(networkId: NetworkId) {
    return this.networkObjectQuery(this).find(
      (eid) => getComponent(eid, NetworkObjectComponent).networkId === networkId
    )!
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
  receptors = new Array<(action: Action) => void>()

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
  }

  async initSystems() {
    const loadSystem = async (s: SystemFactoryType<any>) => {
      const system = await s.systemModule.default(this, s.args)
      return {
        name: s.systemModule.default.name,
        type: s.type,
        execute: () => {
          try {
            system()
          } catch (e) {
            console.error(e)
          }
        }
      } as SystemInstanceType
    }
    const systemModule = await Promise.all(
      this._pipeline.map(async (s) => {
        return {
          args: s.args,
          type: s.type,
          systemModule: await s.systemModulePromise
        }
      })
    )
    const systems = await Promise.all(systemModule.map(loadSystem))
    systems.forEach((s) => console.log(`${s.type} ${s.name}`))
    this.freeSystems = systems.filter((s) => {
      return !s.type.includes('FIXED')
    })
    this.fixedSystems = systems.filter((s) => {
      return s.type.includes('FIXED')
    })
    console.log('[World]: All systems initialized!')
  }
}

export function createWorld() {
  console.log('Creating world')
  return World[CreateWorld]()
}
