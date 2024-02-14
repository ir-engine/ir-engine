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

import assert from 'assert'
import { Quaternion, Vector3 } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { applyIncomingActions, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { AvatarID, UserID } from '@etherealengine/common/src/schema.type.module'
import { SystemDefinitions } from '@etherealengine/ecs'
import { hasComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine, destroyEngine } from '@etherealengine/ecs/src/Engine'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { createEngine } from '@etherealengine/spatial/src/initializeEngine'
import { NetworkState } from '@etherealengine/spatial/src/networking/NetworkState'
import { NetworkWorldUserStateSystem } from '@etherealengine/spatial/src/networking/NetworkUserState'
import { Network } from '@etherealengine/spatial/src/networking/classes/Network'
import { NetworkPeerFunctions } from '@etherealengine/spatial/src/networking/functions/NetworkPeerFunctions'
import { Physics } from '@etherealengine/spatial/src/physics/classes/Physics'
import {
  RigidBodyComponent,
  RigidBodyKinematicPositionBasedTagComponent
} from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import { PhysicsState } from '@etherealengine/spatial/src/physics/state/PhysicsState'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { createMockNetwork } from '@etherealengine/spatial/tests/util/createMockNetwork'
import { render } from '@testing-library/react'
import React from 'react'
import { act } from 'react-dom/test-utils'
import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarNetworkAction } from '../state/AvatarNetworkActions'
import { spawnAvatarReceptor } from './spawnAvatarReceptor'

describe('spawnAvatarReceptor', () => {
  beforeEach(async () => {
    createEngine()
    await Physics.load()
    Engine.instance.store.defaultDispatchDelay = () => 0
    getMutableState(PhysicsState).physicsWorld.set(Physics.createWorld())
    Engine.instance.userID = 'user' as UserID
    loadEmptyScene()
    createMockNetwork()
  })

  afterEach(() => {
    return destroyEngine()
  })

  const NetworkWorldUserStateSystemReactor = SystemDefinitions.get(NetworkWorldUserStateSystem)!.reactor!
  const tag = <NetworkWorldUserStateSystemReactor />

  it('check the create avatar function', async () => {
    const network = NetworkState.worldNetwork as Network
    NetworkPeerFunctions.createPeer(network, Engine.instance.peerID, 0, Engine.instance.userID, 0, 'user name')

    const { rerender, unmount } = render(tag)
    await act(() => rerender(tag))

    // mock entity to apply incoming unreliable updates to
    dispatchAction(
      AvatarNetworkAction.spawn({
        $from: Engine.instance.userID,
        position: new Vector3(),
        rotation: new Quaternion(),
        entityUUID: Engine.instance.userID as string as EntityUUID,
        avatarID: '' as AvatarID
      })
    )

    applyIncomingActions()

    spawnAvatarReceptor(Engine.instance.userID as string as EntityUUID)

    const entity = AvatarComponent.getUserAvatarEntity(Engine.instance.userID)

    assert(hasComponent(entity, TransformComponent))
    assert(hasComponent(entity, AvatarComponent))
    assert(hasComponent(entity, NameComponent))
    assert(hasComponent(entity, AvatarAnimationComponent))
    assert(hasComponent(entity, AvatarControllerComponent))
    assert(hasComponent(entity, RigidBodyComponent))
    assert(hasComponent(entity, RigidBodyKinematicPositionBasedTagComponent))

    unmount()
  })
})
