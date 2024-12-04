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

import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'

import { Engine, UUIDComponent, destroyEngine, getComponent, hasComponent } from '@ir-engine/ecs'
import { createEngine } from '@ir-engine/ecs/src/Engine'
import { UserID, applyIncomingActions, dispatchAction, getState } from '@ir-engine/hyperflux'
import { Network, NetworkState, NetworkTopics } from '@ir-engine/network'
import { createMockNetwork } from '@ir-engine/network/tests/createMockNetwork'
import { EngineState } from '../../EngineState'
import { initializeSpatialViewer } from '../../initializeEngine'
import { CameraActions } from '../CameraState'
import { CameraComponent } from '../components/CameraComponent'
import './CameraSystem'

describe('CameraSystem', async () => {
  describe('CameraEntityState', async () => {
    beforeEach(async () => {
      createEngine()
      Engine.instance.store.defaultDispatchDelay = () => 0
      initializeSpatialViewer()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should create a camera entity and apply a CameraComponent to that entity', async () => {
      const hostUserID = 'host user' as UserID
      const hostPeerID = Engine.instance.store.peerID

      createMockNetwork(NetworkTopics.world, hostPeerID, hostUserID)

      Engine.instance.store.userID = hostUserID
      const cameraUUID = UUIDComponent.generateUUID()

      const network: Network = NetworkState.worldNetwork

      dispatchAction(
        CameraActions.spawnCamera({
          parentUUID: getComponent(getState(EngineState).viewerEntity, UUIDComponent),
          entityUUID: cameraUUID,
          ownerID: network.hostUserID!,
          $topic: NetworkTopics.world,
          $peer: Engine.instance.store.peerID
        })
      )
      applyIncomingActions()

      const cameraEntity = UUIDComponent.getEntityByUUID(cameraUUID)
      assert.ok(cameraEntity, "The spawnCamera Action didn't create an entity.")
      assert.ok(
        hasComponent(cameraEntity, CameraComponent),
        "The spawnCamera Action didn't apply the CameraComponent to the entity"
      )
    })
  })
})
