import { EventQueue } from '@dimforge/rapier3d-compat'
import * as bitecs from 'bitecs'
import { Object3D, OrthographicCamera, PerspectiveCamera, Raycaster, Scene, Vector3 } from 'three'

import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { ComponentJson, EntityJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import multiLogger from '@xrengine/common/src/logger'
import { getState } from '@xrengine/hyperflux'

import { DEFAULT_LOD_DISTANCES } from '../../assets/constants/LoaderConstants'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { SceneLoaderType } from '../../common/constants/PrefabFunctionType'
import { isMobile } from '../../common/functions/isMobile'
import { nowMilliseconds } from '../../common/functions/nowMilliseconds'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { InputValue } from '../../input/interfaces/InputValue'
import { Network } from '../../networking/classes/Network'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { PhysicsWorld } from '../../physics/classes/Physics'
import { NameComponent } from '../../scene/components/NameComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { PersistTagComponent } from '../../scene/components/PersistTagComponent'
import { PortalComponent } from '../../scene/components/PortalComponent'
import { SimpleMaterialTagComponent } from '../../scene/components/SimpleMaterialTagComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setTransformComponent } from '../../transform/components/TransformComponent'
import { Widget } from '../../xrui/Widgets'
import {
  addComponent,
  defineQuery,
  EntityRemovedComponent,
  getComponent,
  hasComponent,
  MappedComponent
} from '../functions/ComponentFunctions'
import { createEntity } from '../functions/EntityFunctions'
import { initializeEntityTree } from '../functions/EntityTreeFunctions'
import { SystemInstanceType } from '../functions/SystemFunctions'
import { SystemUpdateType } from '../functions/SystemUpdateType'
import { Engine } from './Engine'
import { EngineState } from './EngineState'
import { Entity } from './Entity'
import EntityTree from './EntityTree'

const TimerConfig = {
  MAX_DELTA_SECONDS: 1 / 10
}

const logger = multiLogger.child({ component: 'engine:ecs:World' })

export const CreateWorld = Symbol('CreateWorld')
export class World {
  private constructor() {
    bitecs.createWorld(this, 1000)
    Engine.instance.worlds.push(this)
    Engine.instance.currentWorld = this

    // this.scene.autoUpdate = false
    this.sceneEntity = createEntity()
    addComponent(this.sceneEntity, NameComponent, { name: 'scene' })
    addComponent(this.sceneEntity, PersistTagComponent, true)
    addComponent(this.sceneEntity, VisibleComponent, true)
    setTransformComponent(this.sceneEntity)
    if (isMobile) addComponent(this.sceneEntity, SimpleMaterialTagComponent, true)

    this.localOriginEntity = createEntity()
    addComponent(this.localOriginEntity, NameComponent, { name: 'local-origin' })
    addComponent(this.localOriginEntity, PersistTagComponent, true)
    setTransformComponent(this.localOriginEntity)

    this.cameraEntity = createEntity()
    addComponent(this.cameraEntity, NameComponent, { name: 'camera' })
    addComponent(this.cameraEntity, PersistTagComponent, true)
    addComponent(this.cameraEntity, VisibleComponent, true)
    addComponent(this.cameraEntity, Object3DComponent, { value: this.camera })
    setTransformComponent(this.cameraEntity)

    initializeEntityTree(this)
    this.scene.layers.set(ObjectLayers.Scene)
  }

  static [CreateWorld] = () => new World()

  /**
   * get the default world network
   */
  get worldNetwork() {
    return this.networks.get(this._worldHostId)!
  }

  /**
   * get the default media network
   */
  get mediaNetwork() {
    return this.networks.get(this._mediaHostId)
  }

  /** @todo parties */
  // get partyNetwork() {
  //   return this.networks.get(NetworkTopics.localMedia)?.get(this._mediaHostId)!
  // }

  _worldHostId = null! as UserId
  _mediaHostId = null! as UserId

  networks = new Map<string, Network>()

  sceneMetadata = undefined as string | undefined
  worldMetadata = {} as { [key: string]: string }

  widgets = new Map<string, Widget>()

  /**
   * The time origin for this world, relative to performance.timeOrigin
   */
  startTime = nowMilliseconds()

  /**
   * The seconds since the last world execution
   */
  get deltaSeconds() {
    return getState(EngineState).deltaSeconds.value
  }

  /**
   * The elapsed seconds since `startTime`
   */
  get elapsedSeconds() {
    return getState(EngineState).elapsedSeconds.value
  }

  /**
   * The elapsed seconds since `startTime`, in fixed time steps.
   */
  get fixedElapsedSeconds() {
    return getState(EngineState).fixedElapsedSeconds.value
  }

  /**
   * The current fixed tick (fixedElapsedSeconds / fixedDeltaSeconds)
   */
  get fixedTick() {
    return getState(EngineState).fixedTick.value
  }

  physicsWorld: PhysicsWorld
  physicsCollisionEventQueue: EventQueue

  /**
   * Map of object lists by layer
   * (automatically updated by the SceneObjectSystem)
   */
  objectLayerList = {} as { [layer: number]: Set<Object3D> }

  /**
   * Reference to the three.js scene object.
   */
  scene = new Scene()

  /**
   * A set of promises for assets that are being fetched for scene loading
   */
  sceneLoadingPendingAssets = new Set<Promise<void>>()

  sceneDynamicallyUnloadedEntities = new Map<
    string,
    {
      json: EntityJson
      position: Vector3
      distance: number
    }
  >()

  sceneDynamicallyLoadedEntities = new Map<
    Entity,
    {
      json: EntityJson
      position: Vector3
      distance: number
      uuid: string
    }
  >()

  /**
   * Reference to the three.js perspective camera object.
   */
  camera: PerspectiveCamera | OrthographicCamera = new PerspectiveCamera(60, 1, 0.1, 10000)

  /**
   * The scene entity
   */
  sceneEntity: Entity = NaN as Entity

  /**
   * The reference space in which the local avatar, camera, and spatial inputs are positioned
   */
  localOriginEntity: Entity = NaN as Entity

  /**
   * The camera entity
   */
  cameraEntity: Entity = NaN as Entity

  /**
   * The local client entity
   */
  get localClientEntity() {
    return this.getOwnedNetworkObjectWithComponent(Engine.instance.userId, LocalInputTagComponent) || (NaN as Entity)
  }

  dirtyTransforms = new Set<Entity>()

  inputState = new Map<any, InputValue>()
  prevInputState = new Map<any, InputValue>()

  #entityQuery = bitecs.defineQuery([bitecs.Not(EntityRemovedComponent)])
  entityQuery = () => this.#entityQuery(this) as Entity[]

  #entityRemovedQuery = bitecs.defineQuery([EntityRemovedComponent])

  #portalQuery = bitecs.defineQuery([PortalComponent])
  portalQuery = () => this.#portalQuery(this) as Entity[]

  activePortal = null as ReturnType<typeof PortalComponent.get> | null

  /**
   * Custom systems injected into this world
   */
  pipelines = {
    [SystemUpdateType.UPDATE_EARLY]: [],
    [SystemUpdateType.UPDATE]: [],
    [SystemUpdateType.UPDATE_LATE]: [],
    [SystemUpdateType.FIXED_EARLY]: [],
    [SystemUpdateType.FIXED]: [],
    [SystemUpdateType.FIXED_LATE]: [],
    [SystemUpdateType.PRE_RENDER]: [],
    [SystemUpdateType.RENDER]: [],
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
      if (nameMap.has(name)) {
        logger.warn(`An Entity with name "${name}" already exists.`)
      }
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

  /** A screenspace raycaster for the pointer */
  pointerScreenRaycaster = new Raycaster()

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
  getNetworkObject(ownerId: UserId, networkId: NetworkId): Entity {
    return (
      this.networkObjectQuery(this).find((eid) => {
        const networkObject = getComponent(eid, NetworkObjectComponent)
        return networkObject.networkId === networkId && networkObject.ownerId === ownerId
      }) || (NaN as Entity)
    )
  }

  /**
   * Get the user avatar entity (the network object w/ an Avatar component)
   * @param userId
   * @returns
   */
  getUserAvatarEntity(userId: UserId) {
    return this.getOwnedNetworkObjectWithComponent(userId, AvatarComponent)
  }

  /**
   * Get the user entity that has a specific component
   * @param userId
   * @param component
   * @returns
   */
  getOwnedNetworkObjectWithComponent<T, S extends bitecs.ISchema>(userId: UserId, component: MappedComponent<T, S>) {
    return (
      this.getOwnedNetworkObjects(userId).find((eid) => {
        return hasComponent(eid, component, this)
      }) || (NaN as Entity)
    )
  }

  /** ID of last network created. */
  #availableNetworkId = 0 as NetworkId

  /** Get next network id. */
  createNetworkId(): NetworkId {
    return ++this.#availableNetworkId as NetworkId
  }

  LOD_DISTANCES = DEFAULT_LOD_DISTANCES

  /**
   * Execute systems on this world
   *
   * @param frameTime the current frame time in milliseconds (DOMHighResTimeStamp) relative to performance.timeOrigin
   */
  execute(frameTime: number) {
    const start = nowMilliseconds()
    const incomingActions = [...Engine.instance.store.actions.incoming]

    const worldElapsedSeconds = (frameTime - this.startTime) / 1000
    const engineState = getState(EngineState)
    engineState.deltaSeconds.set(
      Math.max(0.001, Math.min(TimerConfig.MAX_DELTA_SECONDS, worldElapsedSeconds - this.elapsedSeconds))
    )
    engineState.elapsedSeconds.set(worldElapsedSeconds)

    for (const system of this.pipelines[SystemUpdateType.UPDATE_EARLY]) system.enabled && system.execute()
    for (const system of this.pipelines[SystemUpdateType.UPDATE]) system.enabled && system.execute()
    for (const system of this.pipelines[SystemUpdateType.UPDATE_LATE]) system.enabled && system.execute()
    for (const system of this.pipelines[SystemUpdateType.PRE_RENDER]) system.enabled && system.execute()
    for (const system of this.pipelines[SystemUpdateType.RENDER]) system.enabled && system.execute()
    for (const system of this.pipelines[SystemUpdateType.POST_RENDER]) system.enabled && system.execute()

    for (const entity of this.#entityRemovedQuery(this)) bitecs.removeEntity(this, entity)

    const end = nowMilliseconds()
    const duration = end - start
    if (duration > 150) {
      logger.warn(`Long frame execution detected. Duration: ${duration}. \n Incoming actions: %o`, incomingActions)
    }
  }
}

export function createWorld() {
  return World[CreateWorld]()
}

export function destroyWorld(world: World) {
  bitecs.resetWorld(world)
  bitecs.deleteWorld(world)
}
