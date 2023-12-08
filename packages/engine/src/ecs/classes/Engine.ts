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

import type { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import * as Hyperflux from '@etherealengine/hyperflux'
import { createHyperStore, getState } from '@etherealengine/hyperflux'
import { HyperFlux, HyperStore } from '@etherealengine/hyperflux/functions/StoreFunctions'

import '../../patchEngineNode'
import '../utils/threejsPatches'

import type { FeathersApplication } from '@feathersjs/feathers'
import { Object3D } from 'three'

import type { ServiceTypes } from '@etherealengine/common/declarations'

import { getAllEntities } from 'bitecs'
import { Timer } from '../../common/functions/Timer'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { removeEntity } from '../functions/EntityFunctions'
import { removeQuery } from '../functions/QueryFunctions'
import { EngineState } from './EngineState'
import { Entity } from './Entity'

export class Engine {
  static instance: Engine

  api: FeathersApplication<ServiceTypes>

  /** The uuid of the logged-in user */
  userID: UserID

  /**
   * The peerID of the logged-in user
   * @deprecated - use Engine.instance.store.peerID instead
   */
  get peerID() {
    return Engine.instance.store.peerID
  }

  store = createHyperStore({
    getDispatchId: () => Engine.instance.userID,
    getDispatchTime: () => getState(EngineState).simulationTime,
    defaultDispatchDelay: () => getState(EngineState).simulationTimestep
  }) as HyperStore

  engineTimer = null! as ReturnType<typeof Timer>

  /**
   * Reference to the three.js scene object.
   * @deprecated use getState(EngineState).scene instead
   */
  get scene() {
    return getState(EngineState).scene
  }

  /**
   * Map of object lists by layer
   * (automatically updated by the SceneObjectSystem)
   */
  objectLayerList = {} as { [layer: number]: Set<Object3D> }

  /**
   * The xr origin reference space entity
   * @deprecated use getState(EngineState).originEntity instead
   */
  get originEntity() {
    return getState(EngineState).originEntity
  }

  /**
   * The xr origin group
   * @deprecated use getState(EngineState).origin instead
   */
  get origin() {
    return getState(EngineState).origin
  }

  /**
   * The camera entity
   * @deprecated use getState(EngineState).cameraEntity instead
   */
  get cameraEntity() {
    return getState(EngineState).cameraEntity
  }

  /**
   * The local client entity
   */
  get localClientEntity() {
    return NetworkObjectComponent.getUserAvatarEntity(Engine.instance.userID)
  }

  entityQuery = () => getAllEntities(Engine.instance) as Entity[]
}

globalThis.Engine = Engine
globalThis.Hyperflux = Hyperflux

export async function destroyEngine() {
  Engine.instance.engineTimer.clear()

  if (Engine.instance.api) {
    if ((Engine.instance.api as any).server) await Engine.instance.api.teardown()

    const knex = (Engine.instance.api as any).get?.('knexClient')
    if (knex) await knex.destroy()
  }

  /** Remove all entities */
  const entities = Engine.instance.entityQuery()

  const entityPromises = [] as Promise<void>[]

  for (const entity of entities) if (entity) entityPromises.push(...removeEntity(entity))

  await Promise.all(entityPromises)

  for (const query of HyperFlux.store.reactiveQueryStates) {
    removeQuery(query.query)
  }

  const activeReactors = [] as Promise<void>[]

  for (const reactor of Engine.instance.store.activeReactors) {
    activeReactors.push(reactor.stop())
  }
  await Promise.all(activeReactors)

  /** @todo include in next bitecs update */
  // bitecs.deleteWorld(Engine.instance)
  Engine.instance = null!
}
