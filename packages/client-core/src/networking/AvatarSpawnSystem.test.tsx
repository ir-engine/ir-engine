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

import { afterEach, assert, beforeEach, describe, it } from 'vitest'

import { API } from '@ir-engine/common'
import { avatarPath, staticResourcePath, userAvatarPath } from '@ir-engine/common/src/schema.type.module'
import {
  Engine,
  Entity,
  SystemDefinitions,
  UUIDComponent,
  createEntity,
  destroyEngine,
  setComponent
} from '@ir-engine/ecs'
import { createEngine } from '@ir-engine/ecs/src/Engine'
import { AvatarNetworkAction } from '@ir-engine/engine/src/avatar/state/AvatarNetworkActions'
import { GLTFAssetState } from '@ir-engine/engine/src/gltf/GLTFState'
import { SceneSettingsComponent } from '@ir-engine/engine/src/scene/components/SceneSettingsComponent'
import {
  EventDispatcher,
  UserID,
  applyIncomingActions,
  dispatchAction,
  getMutableState,
  getState,
  startReactor
} from '@ir-engine/hyperflux'
import { NetworkActions, NetworkState, NetworkTopics } from '@ir-engine/network'
import { createMockNetwork } from '@ir-engine/network/tests/createMockNetwork'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { SpectateActions } from '@ir-engine/spatial/src/camera/systems/SpectateSystem'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { act, render } from '@testing-library/react'
import React from 'react'
import { Cache } from 'three'
import { v4 } from 'uuid'
import { SearchParamState } from '../common/services/RouterService'
import { LocationState } from '../social/services/LocationService'
import { AvatarSpawnSystem } from './AvatarSpawnSystem'

const system = SystemDefinitions.get(AvatarSpawnSystem)!

const emptyGltf = {
  asset: {
    version: '2.0'
  },
  scenes: [{ nodes: [] }],
  scene: 0,
  nodes: []
}

let eventDispatcher: EventDispatcher
let db: Record<string, Record<string, any>>
const userID = 'user id' as UserID

const sceneID = 'scene id'
const sceneURL = '/empty.gltf'

describe('AvatarSpawnSystem', async () => {
  let sceneEntity: Entity
  beforeEach(async () => {
    createEngine()

    Cache.add(sceneURL, emptyGltf)

    db = {
      [staticResourcePath]: [
        {
          id: sceneID,
          url: sceneURL
        }
      ],
      [userAvatarPath]: [
        {
          id: v4(),
          userId: userID,
          avatarId: v4(),
          avatar: {
            modelResource: {
              url: '/avatar.gltf'
            }
          }
        }
      ],
      [avatarPath]: []
    }
    eventDispatcher = new EventDispatcher()
    ;(API.instance as any) = {
      service: (path: string) => {
        return {
          find: () => {
            return new Promise((resolve) => {
              resolve(
                JSON.parse(
                  JSON.stringify({
                    data: db[path],
                    limit: 10,
                    skip: 0,
                    total: db[path].length
                  })
                )
              )
            })
          },
          get: (id) => {
            return new Promise((resolve) => {
              const data = db[path].find((entry) => entry.id === id)
              resolve(data ? JSON.parse(JSON.stringify(data)) : null)
            })
          },
          on: (serviceName, cb) => {
            eventDispatcher.addEventListener(serviceName, cb)
          },
          off: (serviceName, cb) => {
            eventDispatcher.removeEventListener(serviceName, cb)
          }
        }
      }
    }

    getMutableState(LocationState).currentLocation.location.sceneURL.set(sceneURL)
    GLTFAssetState.loadScene(sceneURL, sceneID)

    sceneEntity = getState(GLTFAssetState)[sceneURL]

    createMockNetwork(NetworkTopics.world)

    const peerID = Engine.instance.store.peerID
    getMutableState(EngineState).userID.set(userID)

    const network = NetworkState.worldNetwork

    dispatchAction(
      NetworkActions.peerJoined({
        $network: network.id,
        peerID: peerID,
        peerIndex: 1,
        userID: userID
      })
    )

    applyIncomingActions()
  })

  afterEach(() => {
    // clear search
    const url = new URL(location.href)
    url.search = ''
    history.replaceState(history.state, null!, url.href)

    return destroyEngine()
  })

  it('should spawn an avatar when there is no spectate data', async () => {
    // ensure no spectate data
    getMutableState(SearchParamState).set({})

    const reactor = startReactor(system.reactor!)

    const { rerender, unmount } = render(<></>)
    await act(async () => rerender(<></>))

    applyIncomingActions()

    // should have spawn action
    const spawnAction = Engine.instance.store.actions.history.findLast((action) =>
      AvatarNetworkAction.spawn.matches.test(action)
    ) as typeof AvatarNetworkAction.spawn.matches._TYPE
    assert.ok(spawnAction)
    assert.deepEqual(spawnAction.type as string, AvatarNetworkAction.spawn.type)
    assert.ok(spawnAction.position)
    assert.ok(spawnAction.rotation)
    assert.ok(spawnAction.parentUUID)
    assert.equal(spawnAction.avatarURL, '/avatar.gltf')
    assert.equal(spawnAction.entityUUID, userID + '_avatar')

    const avatarURLAction = Engine.instance.store.actions.history.findLast((action) =>
      AvatarNetworkAction.setAvatarURL.matches.test(action)
    ) as typeof AvatarNetworkAction.spawn.matches._TYPE
    assert.ok(avatarURLAction)
    assert.deepEqual(avatarURLAction.type as string, AvatarNetworkAction.setAvatarURL.type)
    assert.equal(avatarURLAction.avatarURL, '/avatar.gltf')
    assert.equal(avatarURLAction.entityUUID, userID + '_avatar')

    unmount()
  })

  it('should enter spectate mode with freecam when empty spectate is in search state', async () => {
    // ensure spectate data
    getMutableState(SearchParamState).set({ spectate: '' })

    // add spectate to search
    const url = new URL(location.href)
    url.searchParams.set('spectate', '')
    history.replaceState(history.state, null!, url.href)

    const reactor = startReactor(system.reactor!)

    const { rerender, unmount } = render(<></>)
    await act(async () => rerender(<></>))

    applyIncomingActions()

    // should have spectate action
    const spectateAction = Engine.instance.store.actions.history.findLast((action) =>
      SpectateActions.spectateEntity.matches.test(action)
    ) as typeof SpectateActions.spectateEntity.matches._TYPE
    assert.ok(spectateAction)
    assert.equal(spectateAction.spectatorUserID, Engine.instance.userID)
    assert.equal(spectateAction.spectatingEntity, '')

    unmount()
  })

  it('should enter spectate mode when spectate specified user is in search state', async () => {
    const otherUserID = UUIDComponent.generateUUID()

    // ensure spectate data
    getMutableState(SearchParamState).set({ spectate: otherUserID })

    // add spectate to search
    const url = new URL(location.href)
    url.searchParams.set('spectate', otherUserID)
    history.replaceState(history.state, null!, url.href)

    const reactor = startReactor(system.reactor!)

    const { rerender, unmount } = render(<></>)
    await act(async () => rerender(<></>))

    applyIncomingActions()

    // should have spectate action
    const spectateAction = Engine.instance.store.actions.history.findLast((action) =>
      SpectateActions.spectateEntity.matches.test(action)
    ) as typeof SpectateActions.spectateEntity.matches._TYPE
    assert.ok(spectateAction)
    assert.equal(spectateAction.spectatorUserID, Engine.instance.userID)
    assert.equal(spectateAction.spectatingEntity, otherUserID)

    unmount()
  })

  it('should spectate entity specified in scene settings', async () => {
    const spectateUUID = UUIDComponent.generateUUID()
    const entity = createEntity()
    setComponent(entity, EntityTreeComponent, { parentEntity: sceneEntity })
    setComponent(entity, SceneSettingsComponent, { spectateEntity: spectateUUID })

    const reactor = startReactor(system.reactor!)

    const { rerender, unmount } = render(<></>)
    await act(async () => rerender(<></>))

    applyIncomingActions()

    // should have spectate action
    const spectateAction = Engine.instance.store.actions.history.findLast((action) =>
      SpectateActions.spectateEntity.matches.test(action)
    ) as typeof SpectateActions.spectateEntity.matches._TYPE
    assert.ok(spectateAction)
    assert.equal(spectateAction.spectatorUserID, Engine.instance.userID)
    assert.equal(spectateAction.spectatingEntity, spectateUUID)

    unmount()
  })
})
