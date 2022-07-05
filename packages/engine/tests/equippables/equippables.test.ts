import assert from 'assert'
import { Mesh, MeshNormalMaterial, Quaternion, SphereBufferGeometry, Vector3 } from 'three'

import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import ActionFunctions from '@xrengine/hyperflux/functions/ActionFunctions'

import { Engine } from '../../src/ecs/classes/Engine'
import { addComponent, getComponent, hasComponent } from '../../src/ecs/functions/ComponentFunctions'
import { createEntity } from '../../src/ecs/functions/EntityFunctions'
import { createEngine } from '../../src/initializeEngine'
import { EquippedComponent } from '../../src/interaction/components/EquippedComponent'
import { EquipperComponent } from '../../src/interaction/components/EquipperComponent'
import { equipEntity, unequipEntity } from '../../src/interaction/functions/equippableFunctions'
import { equippableQueryEnter, equippableQueryExit } from '../../src/interaction/systems/EquippableSystem'
import { NetworkObjectComponent } from '../../src/networking/components/NetworkObjectComponent'
import { ColliderComponent } from '../../src/physics/components/ColliderComponent'
import { CollisionComponent } from '../../src/physics/components/CollisionComponent'
import { createBody, getAllShapesFromObject3D, ShapeOptions } from '../../src/physics/functions/createCollider'
import { BodyType, ColliderTypes } from '../../src/physics/types/PhysicsTypes'
import { Object3DComponent } from '../../src/scene/components/Object3DComponent'
import { TransformComponent } from '../../src/transform/components/TransformComponent'
import { createMockNetwork } from '../util/createMockNetwork'

describe('Equippables Integration Tests', () => {
  beforeEach(() => {
    createEngine()
    createMockNetwork()
  })

  it('Can equip and unequip', async () => {
    const world = Engine.instance.currentWorld

    const hostUserId = 'world' as UserId
    world.worldNetwork.hostId = hostUserId
    const hostIndex = 0
    world.users.set(hostUserId, { userId: hostUserId, name: 'world' })
    world.worldNetwork.peers.set(hostUserId, { userId: hostUserId, index: hostIndex })

    await Engine.instance.currentWorld.physics.createScene({ verbose: true })

    const userId = 'user id' as UserId
    const userName = 'user name'
    const userIndex = 1
    Engine.instance.userId = userId

    const equippableEntity = createEntity()

    const transform = addComponent(equippableEntity, TransformComponent, {
      position: new Vector3(),
      rotation: new Quaternion(),
      scale: new Vector3()
    })

    // physics mock stuff
    const type = 'trimesh' as ColliderTypes
    const geom = new SphereBufferGeometry()

    const mesh = new Mesh(geom, new MeshNormalMaterial())
    const bodyOptions = {
      type,
      bodyType: BodyType.DYNAMIC
    } as ShapeOptions
    mesh.userData = bodyOptions

    const object3d = addComponent(equippableEntity, Object3DComponent, {
      value: mesh
    })

    const shapes = getAllShapesFromObject3D(equippableEntity, object3d.value as any, bodyOptions)
    const body = createBody(equippableEntity, bodyOptions, shapes)
    addComponent(equippableEntity, ColliderComponent, { body })
    addComponent(equippableEntity, CollisionComponent, { collisions: [] })

    // network mock stuff
    // initially the object is owned by server
    const networkObject = addComponent(equippableEntity, NetworkObjectComponent, {
      ownerId: world.worldNetwork.hostId,
      networkId: 0 as NetworkId,
      prefab: '',
      parameters: {}
    })

    // Equipper
    const equipperEntity = createEntity()
    addComponent(equipperEntity, TransformComponent, {
      position: new Vector3(2, 0, 0),
      rotation: new Quaternion(),
      scale: new Vector3()
    })

    equipEntity(equipperEntity, equippableEntity, undefined)

    // world.receptors.push(
    //     (a) => matches(a).when(WorldNetworkAction.setEquippedObject.matches, setEquippedObjectReceptor)
    // )
    ActionFunctions.clearOutgoingActions()
    ActionFunctions.applyIncomingActions()

    equippableQueryEnter(equipperEntity)

    // validations for equip
    assert(hasComponent(equipperEntity, EquipperComponent))
    const equipperComponent = getComponent(equipperEntity, EquipperComponent)
    assert.equal(equippableEntity, equipperComponent.equippedEntity)
    // assert(hasComponent(equippableEntity, NetworkObjectOwnedTag))
    assert(hasComponent(equippableEntity, EquippedComponent))
    let collider = getComponent(equippableEntity, ColliderComponent).body
    assert.deepEqual(collider._type, BodyType.KINEMATIC)

    // unequip stuff
    unequipEntity(equipperEntity)

    ActionFunctions.clearOutgoingActions()
    ActionFunctions.applyIncomingActions()

    equippableQueryExit(equipperEntity)

    // validations for unequip
    assert(!hasComponent(equipperEntity, EquipperComponent))
    // assert(!hasComponent(equippableEntity, NetworkObjectOwnedTag))
    assert(!hasComponent(equippableEntity, EquippedComponent))
    collider = getComponent(equippableEntity, ColliderComponent).body
    assert.deepEqual(collider._type, BodyType.DYNAMIC)
  })
})
