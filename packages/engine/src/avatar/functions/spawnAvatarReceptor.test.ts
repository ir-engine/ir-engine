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

import assert, { strictEqual } from 'assert'
import { Quaternion, Vector3 } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { applyIncomingActions, dispatchAction, receiveActions } from '@etherealengine/hyperflux'

import { destroyEngine, Engine } from '../../ecs/classes/Engine'
import { hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEngine } from '../../initializeEngine'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { EntityNetworkState } from '../../networking/state/EntityNetworkState'
import { Physics } from '../../physics/classes/Physics'
import {
  RigidBodyComponent,
  RigidBodyKinematicPositionBasedTagComponent
} from '../../physics/components/RigidBodyComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarNetworkAction } from '../state/AvatarNetworkState'
import { spawnAvatarReceptor } from './spawnAvatarReceptor'

describe('spawnAvatarReceptor', () => {
  beforeEach(async () => {
    createEngine()
    await Physics.load()
    Engine.instance.store.defaultDispatchDelay = () => 0
    Engine.instance.physicsWorld = Physics.createWorld()
    Engine.instance.userId = 'user' as UserId
    Engine.instance.peerID = 'peerID' as PeerID
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('check the create avatar function', () => {
    // mock entity to apply incoming unreliable updates to
    dispatchAction(
      AvatarNetworkAction.spawn({
        $from: Engine.instance.userId,
        position: new Vector3(),
        rotation: new Quaternion(),
        entityUUID: Engine.instance.userId as string as EntityUUID
      })
    )

    applyIncomingActions()
    receiveActions(EntityNetworkState)

    spawnAvatarReceptor(Engine.instance.userId as string as EntityUUID)

    const entity = Engine.instance.getUserAvatarEntity(Engine.instance.userId)

    assert(hasComponent(entity, TransformComponent))
    assert(hasComponent(entity, AvatarComponent))
    assert(hasComponent(entity, NameComponent))
    assert(hasComponent(entity, AvatarAnimationComponent))
    assert(hasComponent(entity, AvatarControllerComponent))
    assert(hasComponent(entity, LocalInputTagComponent))
    assert(hasComponent(entity, RigidBodyComponent))
    assert(hasComponent(entity, RigidBodyKinematicPositionBasedTagComponent))
    strictEqual(Engine.instance.physicsWorld.colliders.len(), 1)
  })
})
