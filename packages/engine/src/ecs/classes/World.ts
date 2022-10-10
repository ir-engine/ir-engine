import { EventQueue } from '@dimforge/rapier3d-compat'
import { subscribable } from '@hookstate/subscribable'
import * as bitecs from 'bitecs'
import {
  AxesHelper,
  Color,
  Group,
  LinearToneMapping,
  Object3D,
  PCFSoftShadowMap,
  Raycaster,
  Scene,
  Shader,
  ShadowMapType,
  ToneMapping
} from 'three'

import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { ComponentJson, SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import multiLogger from '@xrengine/common/src/logger'
import { defineState, getState } from '@xrengine/hyperflux'
import { hookstate } from '@xrengine/hyperflux/functions/StateFunctions'

import { DEFAULT_LOD_DISTANCES } from '../../assets/constants/LoaderConstants'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { SceneLoaderType } from '../../common/constants/PrefabFunctionType'
import { nowMilliseconds } from '../../common/functions/nowMilliseconds'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { InputValue } from '../../input/interfaces/InputValue'
import { InputAlias } from '../../input/types/InputAlias'
import { Network } from '../../networking/classes/Network'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { PhysicsWorld } from '../../physics/classes/Physics'
import { addObjectToGroup } from '../../scene/components/GroupComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { PortalComponent } from '../../scene/components/PortalComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { FogType } from '../../scene/constants/FogType'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { defaultPostProcessingSchema } from '../../scene/constants/PostProcessing'
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
  hasComponent,
  setComponent
} from '../functions/ComponentFunctions'
import { createEntity } from '../functions/EntityFunctions'
import { EntityTree, initializeEntityTree } from '../functions/EntityTree'
import { SystemInstance } from '../functions/SystemFunctions'
import { SystemUpdateType } from '../functions/SystemUpdateType'
import { Engine } from './Engine'
import { EngineState } from './EngineState'
import { Entity } from './Entity'

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

    initializeEntityTree(this)

    this.originEntity = createEntity()
    addComponent(this.originEntity, NameComponent, { name: 'origin' })
    setTransformComponent(this.originEntity)
    setComponent(this.originEntity, VisibleComponent, true)
    addObjectToGroup(this.originEntity, this.origin)

    this.cameraEntity = createEntity()
    addComponent(this.cameraEntity, NameComponent, { name: 'camera' })
    addComponent(this.cameraEntity, VisibleComponent, true)
    setTransformComponent(this.cameraEntity)
    setLocalTransformComponent(this.cameraEntity, this.originEntity)
    addObjectToGroup(this.cameraEntity, addComponent(this.cameraEntity, CameraComponent, null).camera)

    /** @todo */
    // this.scene.matrixAutoUpdate = false
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
    return this.networks.get(this._mediaHostId)!
  }

  /** @todo parties */
  // get partyNetwork() {
  //   return this.networks.get(NetworkTopics.localMedia)?.get(this._mediaHostId)!
  // }

  _worldHostId = null! as UserId
  _mediaHostId = null! as UserId

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

  /** stores a hookstate copy of scene metadata */
  sceneMetadata = hookstate(
    {
      postprocessing: {
        enabled: false,
        effects: defaultPostProcessingSchema
      },
      mediaSettings: {
        immersiveMedia: false,
        refDistance: 20,
        rolloffFactor: 1,
        maxDistance: 10000,
        distanceModel: 'linear' as DistanceModelType,
        coneInnerAngle: 360,
        coneOuterAngle: 0,
        coneOuterGain: 0
      },
      renderSettings: {
        LODs: DEFAULT_LOD_DISTANCES,
        csm: true,
        toneMapping: LinearToneMapping as ToneMapping,
        toneMappingExposure: 0.8,
        shadowMapType: PCFSoftShadowMap as ShadowMapType
      },
      fog: {
        type: FogType.Linear as FogType,
        color: '#FFFFFF',
        density: 0.005,
        near: 1,
        far: 1000,
        timeScale: 1,
        height: 0.05
      }
    },
    subscribable()
  )

  /**
   * The scene entity
   */
  sceneEntity: Entity = NaN as Entity

  /**
   * The xr origin reference space entity
   */
  originEntity: Entity = NaN as Entity

  /**
   * The xr origin group
   */
  origin = new Group()

  /**
   * The camera entity
   */
  cameraEntity: Entity = NaN as Entity

  /**
   * Reference to the three.js camera object.
   */
  get camera() {
    return getComponent(this.cameraEntity, CameraComponent).camera
  }

  /**
   * The local client entity
   */
  get localClientEntity() {
    return this.getOwnedNetworkObjectWithComponent(Engine.instance.userId, LocalInputTagComponent) || (NaN as Entity)
  }

  dirtyTransforms = new Set<Entity>()

  inputState = new Map<InputAlias, InputValue>()
  prevInputState = new Map<InputAlias, InputValue>()

  inputSources: XRInputSource[] = []

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
    [SystemUpdateType.UPDATE_LATE]: [],
    [SystemUpdateType.FIXED_EARLY]: [],
    [SystemUpdateType.FIXED]: [],
    [SystemUpdateType.FIXED_LATE]: [],
    [SystemUpdateType.PRE_RENDER]: [],
    [SystemUpdateType.RENDER]: [],
    [SystemUpdateType.POST_RENDER]: []
  } as { [pipeline: string]: SystemInstance[] }

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
  getOwnedNetworkObjectWithComponent<T, S extends bitecs.ISchema>(userId: UserId, component: Component<T, S>) {
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
  /** @todo this is broken - re-enable with next bitecs update */
  // bitecs.deleteWorld(world)
}
