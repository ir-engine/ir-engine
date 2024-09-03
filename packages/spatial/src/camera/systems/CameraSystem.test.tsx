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

import { act, render } from '@testing-library/react'
import assert from 'assert'
import React from 'react'

import {
  Engine,
  SystemDefinitions,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  destroyEngine,
  getComponent,
  hasComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { createEngine } from '@ir-engine/ecs/src/Engine'
import { PeerID, UserID, applyIncomingActions, dispatchAction } from '@ir-engine/hyperflux'
import {
  Network,
  NetworkPeerFunctions,
  NetworkState,
  NetworkTopics,
  NetworkWorldUserStateSystem
} from '@ir-engine/network'
import { NetworkId } from '@ir-engine/network/src/NetworkId'
import { createMockNetwork } from '../../../../network/tests/createMockNetwork'
import { CameraActions } from '../CameraState'
import { CameraComponent } from '../components/CameraComponent'

describe('CameraSystem', async () => {
  let viewerEntity = UndefinedEntity

  describe('CameraEntityState', async () => {
    beforeEach(async () => {
      createEngine()
      createMockNetwork()
      Engine.instance.store.defaultDispatchDelay = () => 0
      viewerEntity = createEntity()
      setComponent(viewerEntity, UUIDComponent, UUIDComponent.generateUUID())
    })

    afterEach(() => {
      removeEntity(viewerEntity)
      return destroyEngine()
    })

    it('should create a camera entity and apply a CameraComponent to that entity', async () => {
      const NetworkWorldUserStateSystemReactor = SystemDefinitions.get(NetworkWorldUserStateSystem)!.reactor!
      const tag = <NetworkWorldUserStateSystemReactor />

      const hostUserId = 'world' as UserID
      const userId = 'user id' as UserID
      const peerID = Engine.instance.store.peerID
      const peerID2 = 'peer id 2' as PeerID
      const CameraUUID = UUIDComponent.generateUUID()

      Engine.instance.store.userID = userId
      const network: Network = NetworkState.worldNetwork

      NetworkPeerFunctions.createPeer(network, peerID, 0, hostUserId, 0)
      NetworkPeerFunctions.createPeer(network, peerID2, 1, userId, 1)
      const objNetId = 3 as NetworkId

      const { rerender, unmount } = render(tag)
      await act(() => rerender(tag))

      dispatchAction(
        CameraActions.spawnCamera({
          parentUUID: getComponent(viewerEntity, UUIDComponent),
          entityUUID: CameraUUID,
          ownerID: network.hostUserID, // from  host
          networkId: objNetId,
          $topic: NetworkTopics.world,
          $peer: Engine.instance.store.peerID
        })
      )
      applyIncomingActions()

      const cameraEntity = UUIDComponent.getEntityByUUID(CameraUUID)
      assert.ok(cameraEntity, "The spawnCamera Action didn't create an entity.")
      assert.ok(
        hasComponent(cameraEntity, CameraComponent),
        "The spawnCamera Action didn't apply the CameraComponent to the entity"
      )

      unmount()
    })
  })
})
