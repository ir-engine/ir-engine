import * as bitecs from 'bitecs'

import type { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { createHyperStore, getState, hookstate, State } from '@etherealengine/hyperflux'
import * as Hyperflux from '@etherealengine/hyperflux'
import { HyperStore } from '@etherealengine/hyperflux/functions/StoreFunctions'

import { Network, NetworkTopics } from '../../networking/classes/Network'
import { createScene, destroyScene, Scene } from '../classes/Scene'

import '../utils/threejsPatches'

import { EventQueue } from '@dimforge/rapier3d-compat'
import { Not } from 'bitecs'
import {
  BoxGeometry,
  Group,
  Mesh,
  MeshNormalMaterial,
  Object3D,
  Raycaster,
  Shader,
  Scene as THREEScene,
  Vector2
} from 'three'

import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { ComponentJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import multiLogger from '@etherealengine/common/src/logger'

import { GLTFLoader } from '../../assets/loaders/gltf/GLTFLoader'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { SceneLoaderType } from '../../common/constants/PrefabFunctionType'
import { nowMilliseconds } from '../../common/functions/nowMilliseconds'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { ButtonInputStateType } from '../../input/InputState'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { SerializationSchema } from '../../networking/serialization/Utils'
import { PhysicsWorld } from '../../physics/classes/Physics'
import { addObjectToGroup } from '../../scene/components/GroupComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { PortalComponent } from '../../scene/components/PortalComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { setTransformComponent } from '../../transform/components/TransformComponent'
import { Widget } from '../../xrui/Widgets'
import {
  Component,
  ComponentType,
  defineQuery,
  EntityRemovedComponent,
  getComponent,
  hasComponent,
  Query,
  QueryComponents,
  setComponent
} from '../functions/ComponentFunctions'
import { createEntity, removeEntity } from '../functions/EntityFunctions'
import { EntityTreeComponent } from '../functions/EntityTree'
import { SystemInstance, unloadAllSystems } from '../functions/SystemFunctions'
import { SystemUpdateType } from '../functions/SystemUpdateType'
import { EngineState } from './EngineState'
import { Entity, UndefinedEntity } from './Entity'

const TimerConfig = {
  MAX_DELTA_SECONDS: 1 / 10
}

const logger = multiLogger.child({ component: 'engine:Engine' })

export class Engine {
  static instance: Engine

  constructor() {
    Engine.instance = this
    bitecs.createWorld(this)

    this.scene.matrixAutoUpdate = false
    this.scene.matrixWorldAutoUpdate = false
    this.scene.layers.set(ObjectLayers.Scene)

    this.originEntity = createEntity()
    setComponent(this.originEntity, NameComponent, 'origin')
    setComponent(this.originEntity, EntityTreeComponent, { parentEntity: null })
    setTransformComponent(this.originEntity)
    setComponent(this.originEntity, VisibleComponent, true)
    addObjectToGroup(this.originEntity, this.origin)
    this.origin.name = 'world-origin'
    const originHelperMesh = new Mesh(new BoxGeometry(0.1, 0.1, 0.1), new MeshNormalMaterial())
    setObjectLayers(originHelperMesh, ObjectLayers.Gizmos)
    originHelperMesh.frustumCulled = false
    this.origin.add(originHelperMesh)

    this.cameraEntity = createEntity()
    setComponent(this.cameraEntity, NameComponent, 'camera')
    setComponent(this.cameraEntity, CameraComponent)
    setComponent(this.cameraEntity, VisibleComponent, true)

    this.camera.matrixAutoUpdate = false
    this.camera.matrixWorldAutoUpdate = false

    this.currentScene = createScene()
  }

  tickRate = 60

  /** The uuid of the logged-in user */
  userId: UserId

  store = createHyperStore({
    forwardIncomingActions: (action) => {
      const isHost =
        action.$topic === this.store.defaultTopic
          ? false
          : (action.$topic === NetworkTopics.world ? this.worldNetwork : this.mediaNetwork)?.isHosting
      return isHost || action.$from === this.userId
    },
    getDispatchId: () => Engine.instance.userId,
    getDispatchTime: () => Date.now(),
    defaultDispatchDelay: 1 / this.tickRate
  }) as HyperStore

  audioContext: AudioContext
  cameraGainNode: GainNode

  gainNodeMixBuses = {
    mediaStreams: null! as GainNode,
    notifications: null! as GainNode,
    music: null! as GainNode,
    soundEffects: null! as GainNode
  }

  /**
   * Current frame timestamp, relative to performance.timeOrigin
   */
  get frameTime() {
    return getState(EngineState).frameTime.value
  }

  engineTimer: { start: Function; stop: Function; clear: Function } = null!

  /**
   * The current world
   */
  currentScene: Scene = null!

  /**
   * get the default world network
   */
  get worldNetwork() {
    return this.networks.get(this.hostIds.world.value!)!
  }

  /**
   * get the default media network
   */
  get mediaNetwork() {
    return this.networks.get(this.hostIds.media.value!)!
  }

  /** @todo parties */
  // get partyNetwork() {
  //   return this.networks.get(NetworkTopics.localMedia)?.get(this._mediaHostId)!
  // }

  /** temporary until Network.ts is refactored to be function & hookstate */
  hostIds = hookstate({
    media: null as UserId | null,
    world: null as UserId | null
  })

  // _worldHostId = null! as UserId
  // _mediaHostId = null! as UserId

  networks = new Map<string, Network>()

  /** a map of component names to a read/write function pairfor network component serialization */
  networkSchema: {
    [key: string]: SerializationSchema
  } = {}

  publicPath = ''
  gltfLoader: GLTFLoader = null!

  xrFrame: XRFrame | null = null

  // @todo move to EngineState
  isEditor = false

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

  get fixedDeltaSeconds() {
    return getState(EngineState).fixedDeltaSeconds.value
  }

  physicsWorld: PhysicsWorld
  physicsCollisionEventQueue: EventQueue

  /**
   * Reference to the three.js scene object.
   */
  scene = new THREEScene()

  /**
   * Map of object lists by layer
   * (automatically updated by the SceneObjectSystem)
   */
  objectLayerList = {} as { [layer: number]: Set<Object3D> }

  /**
   * The xr origin reference space entity
   */
  originEntity: Entity = UndefinedEntity

  /**
   * The xr origin group
   */
  origin = new Group()

  /**
   * The camera entity
   */
  cameraEntity: Entity = UndefinedEntity

  /**
   * Reference to the three.js camera object.
   */
  get camera() {
    return getComponent(this.cameraEntity, CameraComponent)
  }

  /**
   *
   */
  priorityAvatarEntities: ReadonlySet<Entity> = new Set()

  /**
   * The local client entity
   */
  get localClientEntity() {
    return this.getOwnedNetworkObjectWithComponent(Engine.instance.userId, LocalInputTagComponent) || UndefinedEntity
  }

  readonly dirtyTransforms = {} as Record<Entity, boolean>

  inputSources: Readonly<XRInputSourceArray> = []

  pointerState = {
    position: new Vector2(),
    lastPosition: new Vector2(),
    movement: new Vector2(),
    scroll: new Vector2(),
    lastScroll: new Vector2()
  }

  buttons = {} as Readonly<ButtonInputStateType>

  reactiveQueryStates = new Set<{ query: Query; result: State<Entity[]>; components: QueryComponents }>()

  #entityQuery = defineQuery([Not(EntityRemovedComponent)])
  entityQuery = () => this.#entityQuery() as Entity[]

  #entityRemovedQuery = defineQuery([EntityRemovedComponent])

  // @todo move to EngineState
  activePortal = null as ComponentType<typeof PortalComponent> | null

  /**
   * Custom systems injected into this world
   */
  pipelines = {
    [SystemUpdateType.UPDATE_EARLY]: [],
    [SystemUpdateType.UPDATE]: [],
    [SystemUpdateType.FIXED_EARLY]: [],
    [SystemUpdateType.FIXED]: [],
    [SystemUpdateType.FIXED_LATE]: [],
    [SystemUpdateType.UPDATE_LATE]: [],
    [SystemUpdateType.PRE_RENDER]: [],
    [SystemUpdateType.RENDER]: [],
    [SystemUpdateType.POST_RENDER]: []
  } as { [pipeline: string]: SystemInstance[] }

  systemsByUUID = {} as Record<string, SystemInstance>

  /**
   * Network object query
   */
  networkObjectQuery = defineQuery([NetworkObjectComponent])

  /** @todo: merge sceneComponentRegistry and sceneLoadingRegistry when scene loader IDs use EE_ extension names*/

  /** Registry map of scene loader components  */
  sceneLoadingRegistry = new Map<string, SceneLoaderType>()

  /** Scene component of scene loader components  */
  sceneComponentRegistry = new Map<string, string>()

  /** Registry map of prefabs  */
  scenePrefabRegistry = new Map<string, ComponentJson[]>()

  /** A screenspace raycaster for the pointer */
  pointerScreenRaycaster = new Raycaster()

  /**
   * Get the network objects owned by a given user
   * @param ownerId
   */
  getOwnedNetworkObjects(ownerId: UserId) {
    return this.networkObjectQuery().filter((eid) => getComponent(eid, NetworkObjectComponent).ownerId === ownerId)
  }

  /**
   * Get a network object by owner and NetworkId
   * @returns
   */
  getNetworkObject(ownerId: UserId, networkId: NetworkId): Entity {
    return (
      this.networkObjectQuery().find((eid) => {
        const networkObject = getComponent(eid, NetworkObjectComponent)
        return networkObject.networkId === networkId && networkObject.ownerId === ownerId
      }) || UndefinedEntity
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
  getOwnedNetworkObjectWithComponent<T, S extends bitecs.ISchema>(userId: UserId, component: Component<T, S>) {
    return (
      this.getOwnedNetworkObjects(userId).find((eid) => {
        return hasComponent(eid, component)
      }) || UndefinedEntity
    )
  }

  /** ID of last network created. */
  #availableNetworkId = 0 as NetworkId

  /** Get next network id. */
  createNetworkId(): NetworkId {
    return ++this.#availableNetworkId as NetworkId
  }

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

    for (const entity of this.#entityRemovedQuery()) removeEntity(entity as Entity, true)

    for (const { query, result } of this.reactiveQueryStates) {
      const entitiesAdded = query.enter().length
      const entitiesRemoved = query.exit().length
      if (entitiesAdded || entitiesRemoved) {
        result.set(query())
      }
    }

    const end = nowMilliseconds()
    const duration = end - start
    if (duration > 150) {
      logger.warn(`Long frame execution detected. Duration: ${duration}. \n Incoming actions: %o`, incomingActions)
    }
  }
}

globalThis.Engine = Engine
globalThis.Hyperflux = Hyperflux

export function destroyEngine() {
  if (Engine.instance?.currentScene) {
    destroyScene(Engine.instance.currentScene)
  }
  unloadAllSystems()
  /** @todo include in next bitecs update */
  // bitecs.deleteWorld(Engine.instance)
}
