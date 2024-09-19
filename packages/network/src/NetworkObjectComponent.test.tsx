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

import { createEntity, destroyEngine, getComponent, setComponent } from '@ir-engine/ecs'
import { createEngine } from '@ir-engine/ecs/src/Engine'
import { PeerID, UserID } from '@ir-engine/hyperflux'
import { assert, describe, it, beforeEach, afterEach } from 'vitest'
import { NetworkId } from './NetworkId'
import { NetworkObjectComponent } from './NetworkObjectComponent'

describe('NetworkObjectComponent', () => {
  beforeEach(async () => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Creates a NetworkObjectComponent', () => {
    const entity = createEntity()

    setComponent(entity, NetworkObjectComponent)
    const networkObjectComponent = getComponent(entity, NetworkObjectComponent)
    networkObjectComponent.networkId = 12 as NetworkId
    assert(NetworkObjectComponent.networkId[entity] === 12)
  })

  it('Sets a NetworkObjectComponent', () => {
    const entity = createEntity()

    setComponent(entity, NetworkObjectComponent, {
      ownerId: 'ownerID' as UserID,
      ownerPeer: 'ownerPeer' as PeerID,
      authorityPeerID: 'authPeerID' as PeerID,
      networkId: 32 as NetworkId
    })
    const networkObjectComponent = getComponent(entity, NetworkObjectComponent)
    assert(networkObjectComponent.ownerId === 'ownerID')
    assert(networkObjectComponent.ownerPeer === 'ownerPeer')
    assert(networkObjectComponent.authorityPeerID === 'authPeerID')
    assert(networkObjectComponent.networkId === 32)
    assert(NetworkObjectComponent.networkId[entity] === 32)

    const json = NetworkObjectComponent.toJSON(networkObjectComponent)

    assert(json.ownerId === 'ownerID')
    assert(json.ownerPeer === 'ownerPeer')
    assert(json.authorityPeerID === 'authPeerID')
    assert(json.networkId === 32)
  })
})
