import { EventQueue } from '@dimforge/rapier3d-compat'
import { State } from '@hookstate/core'
import * as bitecs from 'bitecs'
import {
  AxesHelper,
  BoxGeometry,
  Group,
  LinearToneMapping,
  Mesh,
  MeshNormalMaterial,
  MeshStandardMaterial,
  Object3D,
  PCFSoftShadowMap,
  Raycaster,
  Scene,
  Shader,
  ShadowMapType,
  SphereGeometry,
  ToneMapping,
  Vector2
} from 'three'

import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { ComponentJson, SceneJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import multiLogger from '@etherealengine/common/src/logger'
import { getState } from '@etherealengine/hyperflux'
import { createState, hookstate } from '@etherealengine/hyperflux/functions/StateFunctions'

import { DEFAULT_LOD_DISTANCES } from '../../assets/constants/LoaderConstants'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { CameraMode } from '../../camera/types/CameraMode'
import { ProjectionType } from '../../camera/types/ProjectionType'
import { SceneLoaderType } from '../../common/constants/PrefabFunctionType'
import { nowMilliseconds } from '../../common/functions/nowMilliseconds'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { ButtonInputStateType } from '../../input/InputState'
import { Network } from '../../networking/classes/Network'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { PhysicsWorld } from '../../physics/classes/Physics'
import { addObjectToGroup } from '../../scene/components/GroupComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { PortalComponent } from '../../scene/components/PortalComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { FogType } from '../../scene/constants/FogType'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { defaultPostProcessingSchema } from '../../scene/constants/PostProcessing'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import {
  setLocalTransformComponent,
  setTransformComponent,
  TransformComponent
} from '../../transform/components/TransformComponent'
import { Widget } from '../../xrui/Widgets'
import {
  addComponent,
  Component,
  ComponentType,
  defineQuery,
  EntityRemovedComponent,
  getComponent,
  getComponentState,
  hasComponent,
  Query,
  QueryComponents,
  setComponent
} from '../functions/ComponentFunctions'
import { createEntity, removeEntity } from '../functions/EntityFunctions'
import { EntityTreeComponent, initializeSceneEntity } from '../functions/EntityTree'
import { SystemInstance, unloadAllSystems } from '../functions/SystemFunctions'
import { SystemUpdateType } from '../functions/SystemUpdateType'
import { Engine } from './Engine'
import { EngineState } from './EngineState'
import { Entity, UndefinedEntity } from './Entity'

const TimerConfig = {
  MAX_DELTA_SECONDS: 1 / 10
}

const logger = multiLogger.child({ component: 'engine:ecs:World' })

export const CreateWorld = Symbol('CreateWorld')
export class World {
  private constructor() {
    bitecs.createWorld(this)
    Engine.instance.worlds.push(this)
    Engine.instance.currentWorld = this

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

    // @todo do this as the scene loads instead of world creation
    initializeSceneEntity(this)

    this.scene.matrixAutoUpdate = false
    this.scene.matrixWorldAutoUpdate = false

    this.scene.layers.set(ObjectLayers.Scene)
  }

  static [CreateWorld] = () => new World()

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
   * Map of object lists by layer
   * (automatically updated by the SceneObjectSystem)
   */
  objectLayerList = {} as { [layer: number]: Set<Object3D> }

  /**
   * Reference to the three.js scene object.
   */
  scene = new Scene()

  sceneJson = null! as SceneJson

  fogShaders = [] as Shader[]

  sceneMetadataRegistry = {} as Record<
    string,
    {
      state: State<any>
      default: any
    }
  >

  /**
   * The scene entity
   *  @todo support multiple scenes
   */
  sceneEntity: Entity = UndefinedEntity

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

  #entityQuery = bitecs.defineQuery([bitecs.Not(EntityRemovedComponent)])
  entityQuery = () => this.#entityQuery(this) as Entity[]

  #entityRemovedQuery = bitecs.defineQuery([EntityRemovedComponent])

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

  /** @todo: merge sceneComponentRegistry and sceneLoadingRegistry when scene loader IDs use XRE_ extension names*/

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
        return hasComponent(eid, component, this)
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

    for (const entity of this.#entityRemovedQuery(this)) removeEntity(entity as Entity, true, this)

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

export function createWorld() {
  return World[CreateWorld]()
}

export function destroyWorld(world: World) {
  unloadAllSystems(world)
  /** @todo this is broken - re-enable with next bitecs update */
  // bitecs.deleteWorld(world)
}
