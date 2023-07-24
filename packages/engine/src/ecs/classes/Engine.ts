/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import type { UserId } from '@etherealengine/common/src/interfaces/UserId'
import * as Hyperflux from '@etherealengine/hyperflux'
import { createHyperStore, getMutableState, getState, ReactorRoot, State } from '@etherealengine/hyperflux'
import { HyperStore } from '@etherealengine/hyperflux/functions/StoreFunctions'

import { NetworkTopics } from '../../networking/classes/Network'

import '../../patchEngineNode'
import '../utils/threejsPatches'

import type { FeathersApplication } from '@feathersjs/feathers'
import { Not } from 'bitecs'
import { Group, Object3D, Raycaster, Scene, Vector2 } from 'three'

import type { ServiceTypes } from '@etherealengine/common/declarations'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'

import { GLTFLoader } from '../../assets/loaders/gltf/GLTFLoader'
import { Timer } from '../../common/functions/Timer'
import { NetworkState } from '../../networking/NetworkState'
import {
  defineQuery,
  EntityRemovedComponent,
  Query,
  QueryComponents,
  removeQuery
} from '../functions/ComponentFunctions'
import { removeEntity } from '../functions/EntityFunctions'
import { disableAllSystems, SystemUUID } from '../functions/SystemFunctions'
import { EngineState } from './EngineState'
import { Entity, UndefinedEntity } from './Entity'

export class Engine {
  static instance: Engine

  api: FeathersApplication<ServiceTypes>

  /** The uuid of the logged-in user */
  userId: UserId

  /** The peerID of the logged-in user */
  peerID: PeerID

  store = createHyperStore({
    forwardIncomingActions: (action) => {
      const isHost =
        action.$topic === this.store.defaultTopic
          ? false
          : (action.$topic === NetworkTopics.world ? this.worldNetwork : this.mediaNetwork)?.isHosting
      return isHost || action.$from === this.userId
    },
    getDispatchId: () => Engine.instance.userId,
    getPeerId: () => Engine.instance.peerID,
    getDispatchTime: () => getState(EngineState).simulationTime,
    defaultDispatchDelay: () => getState(EngineState).simulationTimestep,
    getCurrentReactorRoot: () => Engine.instance.activeSystemReactors.get(Engine.instance.currentSystemUUID)
  }) as HyperStore

  engineTimer = null! as ReturnType<typeof Timer>

  /**
   * get the default world network
   */
  get worldNetwork() {
    return getState(NetworkState).networks[getState(NetworkState).hostIds.world!]!
  }
  get worldNetworkState() {
    return getMutableState(NetworkState).networks[getState(NetworkState).hostIds.world!]!
  }

  /**
   * get the default media network
   */
  get mediaNetwork() {
    return getState(NetworkState).networks[getState(NetworkState).hostIds.media!]!
  }
  get mediaNetworkState() {
    return getMutableState(NetworkState).networks[getState(NetworkState).hostIds.media!]!
  }

  /** @todo parties */
  // get partyNetwork() {
  //   return this.networks.get(NetworkTopics.localMedia)?.get(this._mediaHostId)!
  // }

  gltfLoader: GLTFLoader = null!

  xrFrame: XRFrame | null = null

  /**
   * The seconds since the last world execution
   * @deprecated use getState(EngineState).deltaSeconds
   */
  get deltaSeconds() {
    return getState(EngineState).deltaSeconds
  }

  /**
   * The elapsed seconds since `performance.timeOrigin`
   * @deprecated use `getState(EngineState).elapsedSeconds`
   */
  get elapsedSeconds() {
    return getState(EngineState).elapsedSeconds
  }

  /**
   * The current fixed tick (simulationTime / simulationTimeStep)
   * @deprecated
   */
  get fixedTick() {
    const engineState = getState(EngineState)
    return engineState.simulationTime / engineState.simulationTimestep
  }

  /**
   * @deprecated use `getState(EngineState).simulationTimestep / 1000`
   */
  get fixedDeltaSeconds() {
    return getState(EngineState).simulationTimestep / 1000
  }

  /**
   * Reference to the three.js scene object.
   */
  scene = new Scene()

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
   *
   */
  priorityAvatarEntities: ReadonlySet<Entity> = new Set()

  /**
   * The local client entity
   */
  localClientEntity = UndefinedEntity

  pointerState = {
    position: new Vector2(),
    lastPosition: new Vector2(),
    movement: new Vector2(),
    scroll: new Vector2(),
    lastScroll: new Vector2()
  }

  reactiveQueryStates = new Set<{ query: Query; result: State<Entity[]>; components: QueryComponents }>()

  #entityQuery = defineQuery([Not(EntityRemovedComponent)])
  entityQuery = () => this.#entityQuery() as Entity[]

  // @todo move to EngineState
  activePortalEntity = UndefinedEntity

  systemGroups = {} as {
    input: SystemUUID
    simulation: SystemUUID
    presentation: SystemUUID
  }

  activeSystems = new Set<SystemUUID>()
  currentSystemUUID = '__null__' as SystemUUID
  activeSystemReactors = new Map<SystemUUID, ReactorRoot>()

  /** A screenspace raycaster for the pointer */
  pointerScreenRaycaster = new Raycaster()
}

globalThis.Engine = Engine
globalThis.Hyperflux = Hyperflux

export async function destroyEngine() {
  Engine.instance.engineTimer.clear()

  if (Engine.instance.api) {
    if ((Engine.instance.api as any).server) await Engine.instance.api.teardown()
    else if ((Engine.instance.api as any).get('sequelizeClient'))
      await (Engine.instance.api as any).get('sequelizeClient').close()
  }

  /** Remove all entities */
  const entities = Engine.instance.entityQuery()

  const entityPromises = [] as Promise<void>[]

  for (const entity of entities) if (entity) entityPromises.push(...removeEntity(entity, true))

  await Promise.all(entityPromises)

  for (const query of Engine.instance.reactiveQueryStates) {
    removeQuery(query.query)
  }

  /** Unload and clean up all systems */
  await disableAllSystems()

  const activeReactors = [] as Promise<void>[]

  for (const reactor of Engine.instance.store.activeReactors) {
    activeReactors.push(reactor.stop())
  }
  await Promise.all(activeReactors)

  /** @todo include in next bitecs update */
  // bitecs.deleteWorld(Engine.instance)
  Engine.instance = null!
}
