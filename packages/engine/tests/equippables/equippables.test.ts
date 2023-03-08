import { RigidBodyType, ShapeType } from '@dimforge/rapier3d-compat'
import assert from 'assert'
import { Matrix4, Mesh, MeshNormalMaterial, Quaternion, SphereGeometry, Vector3 } from 'three'

import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { applyIncomingActions, clearOutgoingActions } from '@etherealengine/hyperflux'

import { Engine } from '../../src/ecs/classes/Engine'
import { addComponent, getComponent, hasComponent } from '../../src/ecs/functions/ComponentFunctions'
import { createEntity } from '../../src/ecs/functions/EntityFunctions'
import { createEngine } from '../../src/initializeEngine'
import { EquippedComponent } from '../../src/interaction/components/EquippedComponent'
import { EquipperComponent } from '../../src/interaction/components/EquipperComponent'
import { equipEntity, unequipEntity } from '../../src/interaction/functions/equippableFunctions'
import { equipperQueryExit } from '../../src/interaction/systems/EquippableSystem'
import { Network } from '../../src/networking/classes/Network'
import { NetworkObjectComponent } from '../../src/networking/components/NetworkObjectComponent'
import { Physics } from '../../src/physics/classes/Physics'
import { addObjectToGroup } from '../../src/scene/components/GroupComponent'
import { setTransformComponent, TransformComponent } from '../../src/transform/components/TransformComponent'
import { createMockNetwork } from '../util/createMockNetwork'

describe.skip('Equippables Integration Tests', () => {
  beforeEach(async () => {
    createEngine()
    createMockNetwork()
    await Physics.load()
    Engine.instance.physicsWorld = Physics.createWorld()
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

    const equippableEntity = createEntity()

    setTransformComponent(equippableEntity)

    // physics mock stuff
    const type = ShapeType.Cuboid
    const geom = new SphereGeometry()

    const mesh = new Mesh(geom, new MeshNormalMaterial())
    const bodyOptions = {
      type,
      bodyType: RigidBodyType.Dynamic
    }
    mesh.userData = bodyOptions

    addObjectToGroup(equippableEntity, mesh)
    Physics.createRigidBodyForGroup(equippableEntity, Engine.instance.physicsWorld, bodyOptions)
    // network mock stuff
    // initially the object is owned by server
    addComponent(equippableEntity, NetworkObjectComponent, {
      ownerId: Engine.instance.worldNetwork.hostId,
      authorityPeerID: Engine.instance.worldNetwork.peerID,
      networkId: 0 as NetworkId
    })

    // Equipper
    const equipperEntity = createEntity()
    setTransformComponent(equipperEntity)

    equipEntity(equipperEntity, equippableEntity, 'none')

    // world.receptors.push(
    //     (a) => matches(a).when(WorldNetworkAction.setEquippedObject.matches, setEquippedObjectReceptor)
    // )
    clearOutgoingActions(Engine.instance.worldNetwork.topic)
    applyIncomingActions()

    // equipperQueryEnter(equipperEntity)

    // validations for equip
    assert(hasComponent(equipperEntity, EquipperComponent))
    const equipperComponent = getComponent(equipperEntity, EquipperComponent)
    assert.equal(equippableEntity, equipperComponent.equippedEntity)
    // assert(hasComponent(equippableEntity, NetworkObjectAuthorityTag))
    assert(hasComponent(equippableEntity, EquippedComponent))

    // unequip stuff
    unequipEntity(equipperEntity)

    clearOutgoingActions(Engine.instance.worldNetwork.topic)
    applyIncomingActions()

    equipperQueryExit(equipperEntity)

    // validations for unequip
    assert(!hasComponent(equipperEntity, EquipperComponent))
    // assert(!hasComponent(equippableEntity, NetworkObjectAuthorityTag))
    assert(!hasComponent(equippableEntity, EquippedComponent))
  })
})
