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

import { RigidBodyType, ShapeType } from '@dimforge/rapier3d-compat'
import assert from 'assert'
import { Matrix4, Mesh, MeshNormalMaterial, Quaternion, SphereGeometry, Vector3 } from 'three'

import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { applyIncomingActions, clearOutgoingActions } from '@etherealengine/hyperflux'

import { destroyEngine, Engine } from '../../src/ecs/classes/Engine'
import { addComponent, getComponent, hasComponent } from '../../src/ecs/functions/ComponentFunctions'
import { createEntity } from '../../src/ecs/functions/EntityFunctions'
import { createEngine } from '../../src/initializeEngine'
import { GrabbedComponent, GrabberComponent } from '../../src/interaction/components/GrabbableComponent'
import { equipEntity, unequipEntity } from '../../src/interaction/systems/GrabbableSystem'
import { Network } from '../../src/networking/classes/Network'
import { NetworkObjectComponent } from '../../src/networking/components/NetworkObjectComponent'
import { Physics } from '../../src/physics/classes/Physics'
import { addObjectToGroup } from '../../src/scene/components/GroupComponent'
import { setTransformComponent, TransformComponent } from '../../src/transform/components/TransformComponent'
import { createMockNetwork } from '../util/createMockNetwork'

describe.skip('Grabbables Integration Tests', () => {
  beforeEach(async () => {
    createEngine()
    createMockNetwork()
    await Physics.load()
    Engine.instance.physicsWorld = Physics.createWorld()
  })
  afterEach(() => {
    return destroyEngine()
  })

  it('Can equip and unequip', async () => {
    const hostUserId = 'world' as UserId & PeerID
    ;(Engine.instance.worldNetwork as Network).hostId = hostUserId
    const hostIndex = 0

    Engine.instance.worldNetwork.peers.set(hostUserId, {
      peerID: hostUserId,
      peerIndex: hostIndex,
      userId: hostUserId,
      userIndex: hostIndex
    })

    const userId = 'user id' as UserId
    const userName = 'user name'
    const userIndex = 1
    Engine.instance.userId = userId

    const grabbableEntity = createEntity()

    setTransformComponent(grabbableEntity)

    // physics mock stuff
    const type = ShapeType.Cuboid
    const geom = new SphereGeometry()

    const mesh = new Mesh(geom, new MeshNormalMaterial())
    const bodyOptions = {
      type,
      bodyType: RigidBodyType.Dynamic
    }
    mesh.userData = bodyOptions

    addObjectToGroup(grabbableEntity, mesh)
    Physics.createRigidBodyForGroup(grabbableEntity, Engine.instance.physicsWorld, bodyOptions)
    // network mock stuff
    // initially the object is owned by server
    addComponent(grabbableEntity, NetworkObjectComponent, {
      ownerId: Engine.instance.worldNetwork.hostId,
      authorityPeerID: Engine.instance.peerID,
      networkId: 0 as NetworkId
    })

    // Equipper
    const grabberEntity = createEntity()
    setTransformComponent(grabberEntity)

    equipEntity(grabberEntity, grabbableEntity, 'none')

    // world.receptors.push(
    //     (a) => matches(a).when(WorldNetworkAction.setEquippedObject.matches, setEquippedObjectReceptor)
    // )
    clearOutgoingActions(Engine.instance.worldNetwork.topic)
    applyIncomingActions()

    // equipperQueryEnter(grabberEntity)

    // validations for equip
    assert(hasComponent(grabberEntity, GrabberComponent))
    const grabberComponent = getComponent(grabberEntity, GrabberComponent)
    assert.equal(grabbableEntity, grabberComponent.grabbedEntity)
    // assert(hasComponent(grabbableEntity, NetworkObjectAuthorityTag))
    assert(hasComponent(grabbableEntity, GrabbedComponent))

    // unequip stuff
    unequipEntity(grabberEntity)

    clearOutgoingActions(Engine.instance.worldNetwork.topic)
    applyIncomingActions()

    // validations for unequip
    assert(!hasComponent(grabberEntity, GrabberComponent))
    // assert(!hasComponent(grabbableEntity, NetworkObjectAuthorityTag))
    assert(!hasComponent(grabbableEntity, GrabbedComponent))
  })
})
