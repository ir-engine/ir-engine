/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import * as bitECS from 'bitecs'
import { getAllEntities } from 'bitecs'

import * as Hyperflux from '@ir-engine/hyperflux'
import {
  createHyperStore,
  getState,
  HyperFlux,
  HyperStore,
  NO_PROXY_STEALTH,
  stopAllReactors
} from '@ir-engine/hyperflux'

import { $RemovedComponent, removeEntity } from './ComponentFunctions'
import { ECSState } from './ECSState'
import { EngineState } from './EngineState'
import { Entity } from './Entity'
import { queries, removeQuery } from './QueryFunctions'
import { SystemState } from './SystemState'

export class Engine {
  static instance: Engine

  /**
   * @deprecated use "getState(EngineState).userID" instead
   * The uuid of the logged-in user
   */
  get userID() {
    return getState(EngineState).userID
  }

  store: HyperStore

  /**
   * Represents the reference space of the xr session local floor.
   * @deprecated use "getState(ReferenceSpaceState).localFloorEntity" instead
   */
  get localFloorEntity() {
    return Engine.instance.store.stateMap['ReferenceSpaceState'].get(NO_PROXY_STEALTH).localFloorEntity as Entity
  }

  /**
   * Represents the reference space for the absolute origin of the rendering context.
   * @deprecated use "getState(ReferenceSpaceState).originEntity" instead
   */
  get originEntity() {
    return Engine.instance.store.stateMap['ReferenceSpaceState'].get(NO_PROXY_STEALTH).originEntity as Entity
  }

  /**
   * Represents the reference space for the viewer.
   * @deprecated use "getState(ReferenceSpaceState).viewerEntity" instead
   */
  get viewerEntity() {
    return Engine.instance.store.stateMap['ReferenceSpaceState'].get(NO_PROXY_STEALTH).viewerEntity as Entity
  }

  /** @deprecated use viewerEntity instead */
  get cameraEntity() {
    return this.viewerEntity
  }
}

globalThis.Engine = Engine
globalThis.Hyperflux = Hyperflux

export function createEngine(hyperstore = createHyperStore()) {
  if (Engine.instance) throw new Error('Store already exists')
  Engine.instance = new Engine()
  hyperstore.getCurrentReactorRoot = () =>
    getState(SystemState).activeSystemReactors.get(getState(SystemState).currentSystemUUID)
  hyperstore.getDispatchTime = () => getState(ECSState).simulationTime
  hyperstore.getAgentID = () => getState(EngineState).userID
  Engine.instance.store = bitECS.createWorld(hyperstore) as HyperStore
  const UndefinedEntity = bitECS.addEntity(hyperstore)
}

export function destroyEngine() {
  /** Clear timer */
  getState(ECSState).timer?.clear()

  try {
    /** Remove all entities */
    const entities = getAllEntities(HyperFlux.store) as Entity[]
    for (const entity of entities) removeEntity(entity)
  } catch (e) {
    //some errors are thrown because we have side effects in component onRemove - we need to move that logic to reactors
  }

  $RemovedComponent.exists.fill(0)

  /** Remove all queries */
  for (const query of queries) {
    removeQuery(query)
  }

  /** Stop all reactors */
  stopAllReactors()

  /** Remove world */
  bitECS.deleteWorld(HyperFlux.store)

  /** Dereference store */
  HyperFlux.store = null!

  /** Dereference engine */
  Engine.instance = null!
}
