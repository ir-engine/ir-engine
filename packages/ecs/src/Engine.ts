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
  disposeStore,
  getState,
  HyperFlux,
  HyperStore,
  NO_PROXY_STEALTH,
  ReactorReconciler
} from '@ir-engine/hyperflux'

import { ECSState } from './ECSState'
import { Entity } from './Entity'
import { removeEntity } from './EntityFunctions'
import { removeQuery } from './QueryFunctions'
import { SystemState } from './SystemState'

export class Engine {
  static instance: Engine

  /**
   * @deprecated use "getState(EngineState).userID" instead
   * The uuid of the logged-in user
   */
  get userID() {
    return Engine.instance.store.stateMap['EngineState']?.get(NO_PROXY_STEALTH).userID
  }

  store: HyperStore

  /**
   * Represents the reference space of the xr session local floor.
   * @deprecated use "getState(EngineState).localFloorEntity" instead
   */
  get localFloorEntity() {
    return Engine.instance.store.stateMap['EngineState'].get(NO_PROXY_STEALTH).localFloorEntity as Entity
  }

  /**
   * Represents the reference space for the absolute origin of the rendering context.
   * @deprecated use "getState(EngineState).originEntity" instead
   */
  get originEntity() {
    return Engine.instance.store.stateMap['EngineState'].get(NO_PROXY_STEALTH).originEntity as Entity
  }

  /**
   * Represents the reference space for the viewer.
   * @deprecated use "getState(EngineState).viewerEntity" instead
   */
  get viewerEntity() {
    return Engine.instance.store.stateMap['EngineState'].get(NO_PROXY_STEALTH).viewerEntity as Entity
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
  Engine.instance.store = bitECS.createWorld(hyperstore) as HyperStore
  const UndefinedEntity = bitECS.addEntity(hyperstore)
}

export function destroyEngine() {
  getState(ECSState).timer?.clear()

  /** Remove all entities */
  const entities = getAllEntities(HyperFlux.store) as Entity[]

  ReactorReconciler.flushSync(() => {
    for (const entity of entities) removeEntity(entity)
  })

  for (const query of getState(SystemState).reactiveQueryStates) {
    removeQuery(query.query)
  }

  disposeStore()

  bitECS.deleteWorld(HyperFlux.store)
  Engine.instance = null!
}
