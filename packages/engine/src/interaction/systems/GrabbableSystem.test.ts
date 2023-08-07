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
import assert, { strictEqual } from 'assert'
import { Mesh, MeshNormalMaterial, Quaternion, SphereGeometry, Vector3 } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import {
  applyIncomingActions,
  clearOutgoingActions,
  dispatchAction,
  getMutableState,
  getState,
  receiveActions
} from '@etherealengine/hyperflux'

import { getHandTarget } from '../../avatar/components/AvatarIKComponents'
import { spawnAvatarReceptor } from '../../avatar/functions/spawnAvatarReceptor'
import { AvatarNetworkAction } from '../../avatar/state/AvatarNetworkState'
import { destroyEngine, Engine } from '../../ecs/classes/Engine'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { createEngine } from '../../initializeEngine'
import { Network } from '../../networking/classes/Network'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { EntityNetworkState } from '../../networking/state/EntityNetworkState'
import { Physics } from '../../physics/classes/Physics'
import { PhysicsState } from '../../physics/state/PhysicsState'
import { addObjectToGroup } from '../../scene/components/GroupComponent'
import { setTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'
import { GrabbedComponent, GrabberComponent } from '../components/GrabbableComponent'
import { dropEntity, grabEntity } from './GrabbableSystem'

// @TODO this needs to be re-thought

describe.skip('EquippableSystem Integration Tests', () => {
  let equippableSystem
  beforeEach(async () => {
    createEngine()
    await Physics.load()
    Engine.instance.store.defaultDispatchDelay = () => 0
    getMutableState(PhysicsState).physicsWorld.set(Physics.createWorld())
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

    dispatchAction(
      AvatarNetworkAction.spawn({
        $from: Engine.instance.userId,
        networkId: networkObject.networkId,
        position: new Vector3(-0.48624888685311896, 0, -0.12087574159728942),
        rotation: new Quaternion(),
        entityUUID: Engine.instance.userId as string as EntityUUID
      })
    )
    applyIncomingActions()
    receiveActions(EntityNetworkState)

    spawnAvatarReceptor(Engine.instance.userId as string as EntityUUID)

    addComponent(item, GrabbedComponent, {
      grabberEntity: player,
      attachmentPoint: 'none'
    })
    const grabbedComponent = getComponent(player, GrabbedComponent)
    addComponent(player, GrabberComponent, { grabbedEntity: item })

    setTransformComponent(item)
    const equippableTransform = getComponent(item, TransformComponent)
    const attachmentPoint = grabbedComponent.attachmentPoint
    const { position, rotation } = getHandTarget(item, attachmentPoint)!

    equippableSystem()

    assert(!hasComponent(item, GrabberComponent))

    strictEqual(equippableTransform.position.x, position.x)
    strictEqual(equippableTransform.position.y, position.y)
    strictEqual(equippableTransform.position.z, position.z)

    strictEqual(equippableTransform.rotation.x, rotation.x)
    strictEqual(equippableTransform.rotation.y, rotation.y)
    strictEqual(equippableTransform.rotation.z, rotation.z)
    strictEqual(equippableTransform.rotation.w, rotation.w)

    removeComponent(item, GrabbedComponent)
    equippableSystem()
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
    Physics.createRigidBodyForGroup(grabbableEntity, getState(PhysicsState).physicsWorld, bodyOptions)
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

    grabEntity(grabberEntity, grabbableEntity, 'none')

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
    dropEntity(grabberEntity)

    clearOutgoingActions(Engine.instance.worldNetwork.topic)
    applyIncomingActions()

    // validations for unequip
    assert(!hasComponent(grabberEntity, GrabberComponent))
    // assert(!hasComponent(grabbableEntity, NetworkObjectAuthorityTag))
    assert(!hasComponent(grabbableEntity, GrabbedComponent))
  })
})
