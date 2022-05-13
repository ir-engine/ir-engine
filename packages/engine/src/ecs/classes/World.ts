import * as bitecs from 'bitecs'

import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { createHyperStore } from '@xrengine/hyperflux'

import { DEFAULT_LOD_DISTANCES } from '../../assets/constants/LoaderConstants'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { SceneLoaderType } from '../../common/constants/PrefabFunctionType'
import { isClient } from '../../common/functions/isClient'
import { nowMilliseconds } from '../../common/functions/nowMilliseconds'
import { Network } from '../../networking/classes/Network'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { NetworkClient } from '../../networking/interfaces/NetworkClient'
import { Physics } from '../../physics/classes/Physics'
import { NameComponent } from '../../scene/components/NameComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { PersistTagComponent } from '../../scene/components/PersistTagComponent'
import { PortalComponent } from '../../scene/components/PortalComponent'
import {
  addComponent,
  defineQuery,
  EntityRemovedComponent,
  getComponent,
  hasComponent
} from '../functions/ComponentFunctions'
import { createEntity } from '../functions/EntityFunctions'
import { initializeEntityTree } from '../functions/EntityTreeFunctions'
import { SystemInstanceType, SystemModuleType } from '../functions/SystemFunctions'
import { SystemUpdateType } from '../functions/SystemUpdateType'
import { Engine } from './Engine'
import { Entity } from './Entity'
import EntityTree from './EntityTree'

const TimerConfig = {
  MAX_DELTA: 1 / 10
}

export const CreateWorld = Symbol('CreateWorld')
export class World {
  private constructor() {
    bitecs.createWorld(this)
    Engine.instance.worlds.push(this)

    this.worldEntity = createEntity(this)
    this.localClientEntity = isClient ? (createEntity(this) as Entity) : (NaN as Entity)

    addComponent(this.worldEntity, PersistTagComponent, {}, this)
    if (this.localClientEntity) addComponent(this.localClientEntity, PersistTagComponent, {}, this)

    initializeEntityTree(this)

    // @TODO support multiple networks per world
    Network.instance = new Network()
  }

  static [CreateWorld] = () => new World()

  /**
   * The UserId of the host
   */
  hostId = 'server' as UserId

  /**
   * Check if this user is hosting the world.
   */
  get isHosting() {
    return Engine.instance.userId === this.hostId
  }

  sceneMetadata = undefined as string | undefined
  worldMetadata = {} as { [key: string]: string }

  /**
   * The current delta time in seconds
   */
  delta = 0
  /**
   * The current elapsed time in seconds
   */
  elapsedTime = 0
  /**
   * The current fixed delta in seconds (generally 1/60)
   */
  fixedDelta = 0
  /**
   * The current fixed time in seconds
   */
  fixedElapsedTime = 0
  /**
   * The current fixed tick (fixedElapsedTime / fixedDelta)
   */
  fixedTick = 0

  _pipeline = [] as SystemModuleType<any>[]

  store = createHyperStore({
    name: 'WORLD',
    getDispatchMode: () => (this.isHosting ? 'host' : 'peer'),
    getDispatchId: () => Engine.instance.userId,
    getDispatchTime: () => this.fixedTick,
    defaultDispatchDelay: 1
  })

  physics = new Physics()

  #entityQuery = bitecs.defineQuery([bitecs.Not(EntityRemovedComponent)])
  entityQuery = () => this.#entityQuery(this) as Entity[]

  #entityRemovedQuery = bitecs.defineQuery([EntityRemovedComponent])

  #portalQuery = bitecs.defineQuery([PortalComponent])
  portalQuery = () => this.#portalQuery(this) as Entity[]

  activePortal = null! as ReturnType<typeof PortalComponent.get>

  /** Connected clients */
  clients = new Map() as Map<UserId, NetworkClient>

  /** Map of numerical user index to user client IDs */
  userIndexToUserId = new Map<number, UserId>()

  /** Map of user client IDs to numerical user index */
  userIdToUserIndex = new Map<UserId, number>()

  userIndexCount = 0

  /**
   * The world entity
   */
  worldEntity: Entity

  /**
   * The local client entity
   */
  localClientEntity: Entity

  /**
   * Custom systems injected into this world
   */
  pipelines = {
    [SystemUpdateType.UPDATE]: [],
    [SystemUpdateType.FIXED_EARLY]: [],
    [SystemUpdateType.FIXED]: [],
    [SystemUpdateType.FIXED_LATE]: [],
    [SystemUpdateType.PRE_RENDER]: [],
    [SystemUpdateType.POST_RENDER]: []
  } as { [pipeline: string]: SystemInstanceType[] }

  #nameMap = new Map<string, Entity>()
  #nameQuery = defineQuery([NameComponent])

  /**
   * Entities mapped by name
   */
  get namedEntities() {
    const nameMap = this.#nameMap
    for (const entity of this.#nameQuery.enter()) {
      const { name } = getComponent(entity, NameComponent)
      if (nameMap.has(name)) console.warn(`An Entity with name "${name}" already exists.`)
      nameMap.set(name, entity)
      const obj3d = getComponent(entity, Object3DComponent)?.value
      if (obj3d) obj3d.name = name
    }
    for (const entity of this.#nameQuery.exit()) {
      const { name } = getComponent(entity, NameComponent, true)
      nameMap.delete(name)
    }
    return nameMap as ReadonlyMap<string, Entity>
  }

  /**
   * Network object query
   */
  networkObjectQuery = defineQuery([NetworkObjectComponent])

  /** Tree of entity holding parent child relation between entities. */
  entityTree: EntityTree

  /** Registry map of scene loader components  */
  sceneLoadingRegistry = new Map<string, SceneLoaderType>()

  /** Registry map of prefabs  */
  scenePrefabRegistry = new Map<string, ComponentJson[]>()

  /**
   * Get the network objects owned by a given user
   * @param ownerId
   */
  getOwnedNetworkObjects(ownerId: UserId) {
    return this.networkObjectQuery(this).filter((eid) => getComponent(eid, NetworkObjectComponent).ownerId === ownerId)
  }

  /**
   * Get a network object by owner and NetworkId
   * @returns
   */
  getNetworkObject(ownerId: UserId, networkId: NetworkId): Entity | undefined {
    return this.networkObjectQuery(this).find((eid) => {
      const networkObject = getComponent(eid, NetworkObjectComponent)
      return networkObject.networkId === networkId && networkObject.ownerId === ownerId
    })!
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

  /** ID of last network created. */
  #availableNetworkId = 0 as NetworkId

  /** Get next network id. */
  createNetworkId(): NetworkId {
    return ++this.#availableNetworkId as NetworkId
  }

  /**
   * @deprecated Use store.receptors
   */
  get receptors() {
    return this.store.receptors
  }

  LOD_DISTANCES = DEFAULT_LOD_DISTANCES

  /**
   * Execute systems on this world
   *
   * @param delta in seconds
   * @param elapsedTime in seconds
   */
  execute(delta: number) {
    const start = nowMilliseconds()
    const incomingActions = [...this.store.actions.incoming]
    const incomingBufferLength = Network.instance?.incomingMessageQueueUnreliable.getBufferLength()

    this.delta = Math.min(TimerConfig.MAX_DELTA, delta)
    this.elapsedTime += delta

    for (const system of this.pipelines[SystemUpdateType.UPDATE]) system.execute()
    for (const system of this.pipelines[SystemUpdateType.PRE_RENDER]) system.execute()
    for (const system of this.pipelines[SystemUpdateType.POST_RENDER]) system.execute()

    for (const entity of this.#entityRemovedQuery(this)) bitecs.removeEntity(this, entity)

    const end = nowMilliseconds()
    const duration = end - start
    if (duration > 50) {
      console.warn(
        `Long frame execution detected. Delta: ${delta} \n Duration: ${duration}. \n Incoming Buffer Length: ${incomingBufferLength} \n Incoming actions: `,
        incomingActions
      )
    }
  }
}

export function createWorld() {
  return World[CreateWorld]()
}
