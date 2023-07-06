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
import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'

import { getHandTarget } from '../../avatar/components/AvatarIKComponents'
import { spawnAvatarReceptor } from '../../avatar/functions/spawnAvatarReceptor'
import { AvatarNetworkAction } from '../../avatar/state/AvatarNetworkState'
import { destroyEngine, Engine } from '../../ecs/classes/Engine'
import {
  addComponent,
  ComponentType,
  getComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { createEngine } from '../../initializeEngine'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { WorldNetworkActionReceptor } from '../../networking/functions/WorldNetworkActionReceptor'
import { Physics } from '../../physics/classes/Physics'
import { setTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'
import { EquippedComponent } from '../components/EquippedComponent'
import { EquipperComponent } from '../components/EquipperComponent'

// @TODO this needs to be re-thought

describe.skip('EquippableSystem Integration Tests', () => {
  let equippableSystem
  beforeEach(async () => {
    createEngine()
    await Physics.load()
    Engine.instance.physicsWorld = Physics.createWorld()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('system test', async () => {
    const player = createEntity()
    const item = createEntity()

    addComponent(player, NetworkObjectComponent, {
      ownerId: Engine.instance.userId,
      authorityPeerID: 'peer id' as PeerID,
      networkId: 0 as NetworkId
    })
    const networkObject = getComponent(player, NetworkObjectComponent)

    const spawnAvatar = AvatarNetworkAction.spawn({
      $from: Engine.instance.userId,
      networkId: networkObject.networkId,
      position: new Vector3(-0.48624888685311896, 0, -0.12087574159728942),
      rotation: new Quaternion(),
      entityUUID: Engine.instance.userId as string as EntityUUID
    })

    WorldNetworkActionReceptor.receiveSpawnObject(spawnAvatar as any)

    spawnAvatarReceptor(Engine.instance.userId as string as EntityUUID)

    addComponent(item, EquippedComponent, {
      equipperEntity: player,
      attachmentPoint: 'none'
    })
    const equippedComponent = getComponent(player, EquippedComponent)
    addComponent(player, EquipperComponent, { equippedEntity: item })

    setTransformComponent(item)
    const equippableTransform = getComponent(item, TransformComponent)
    const attachmentPoint = equippedComponent.attachmentPoint
    const { position, rotation } = getHandTarget(item, attachmentPoint)!

    equippableSystem()

    assert(!hasComponent(item, EquipperComponent))

    strictEqual(equippableTransform.position.x, position.x)
    strictEqual(equippableTransform.position.y, position.y)
    strictEqual(equippableTransform.position.z, position.z)

    strictEqual(equippableTransform.rotation.x, rotation.x)
    strictEqual(equippableTransform.rotation.y, rotation.y)
    strictEqual(equippableTransform.rotation.z, rotation.z)
    strictEqual(equippableTransform.rotation.w, rotation.w)

    removeComponent(item, EquippedComponent)
    equippableSystem()
  })
})
