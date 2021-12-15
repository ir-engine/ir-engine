import assert from 'assert'
import { Engine } from '../../src/ecs/classes/Engine'
import { Network } from '../../src/networking/classes/Network'
import { TestNetwork } from '../networking/TestNetwork'
import { createWorld } from '../../src/ecs/classes/World'
import { createEntity } from '../../src/ecs/functions/EntityFunctions'
import { addComponent, getComponent, hasComponent } from '../../src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../src/transform/components/TransformComponent'
import { Mesh, MeshNormalMaterial, Quaternion, SphereBufferGeometry, Vector3 } from 'three'
import { BodyType } from '../../src/physics/types/PhysicsTypes'
import { BodyOptions, createBody, getAllShapesFromObject3D } from '../../src/physics/functions/createCollider'
import { Object3DComponent } from '../../src/scene/components/Object3DComponent'
import { ColliderComponent } from '../../src/physics/components/ColliderComponent'
import { CollisionComponent } from '../../src/physics/components/CollisionComponent'
import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { NetworkObjectComponent } from '../../src/networking/components/NetworkObjectComponent'
import { NetworkObjectOwnedTag } from '../../src/networking/components/NetworkObjectOwnedTag'
import  IncomingNetworkSystem  from '../../src/networking/systems/IncomingNetworkSystem'
import  EquippabbleSystem  from '../../src/interaction/systems/EquippableSystem'
import { equipEntity, unequipEntity } from '../../src/interaction/functions/equippableFunctions'
import { EquippedComponent } from '../../src/interaction/components/EquippedComponent'
import { Action } from '../../src/networking/interfaces/Action'
import { EquipperComponent } from '../../src/interaction/components/EquipperComponent'

describe('Equippables Integration Tests', () => {

  it('Can equip and unequip', async () => {
      
    Network.instance = new TestNetwork()
    let world = createWorld()
    Engine.currentWorld = world
    Engine.hasJoinedWorld = true
    await Engine.currentWorld.physics.createScene({ verbose: true })

    Engine.userId = 'client' as UserId

    const equippableEntity = createEntity()

    const transform = addComponent(equippableEntity, TransformComponent, {
        position: new Vector3(),
        rotation: new Quaternion(),
        scale: new Vector3(),
    })

    // physics mock stuff
    const type = 'trimesh'
    let geom = new SphereBufferGeometry()

    const mesh = new Mesh(geom, new MeshNormalMaterial())
    const bodyOptions = {
    type,
    bodyType: BodyType.DYNAMIC
    } as BodyOptions
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
        ownerId: world.hostId,
        networkId: 0 as NetworkId,
        prefab: '',
        parameters: {},
    })

    // Equipper
    const equipperEntity = createEntity()
    addComponent(equipperEntity, TransformComponent, {
        position: new Vector3(2,0,0),
        rotation: new Quaternion(),
        scale: new Vector3(),
    })
    
    equipEntity(equipperEntity, equippableEntity)
    
    const incomingNetworkSystem = await IncomingNetworkSystem(world)
    const equippabbleSystem = await EquippabbleSystem(world)

    // simulate client behavior now
    world.fixedTick = 1
    for (let action of world.outgoingActions) {
        action.$from = Engine.userId
        world.incomingActions.add(action as Required<Action>)
    }
    incomingNetworkSystem()
    equippabbleSystem()
    
    // validations for equip
    assert(hasComponent(equipperEntity, EquipperComponent))
    const equipperComponent = getComponent(equipperEntity, EquipperComponent)
    assert.equal(equippableEntity, equipperComponent.equippedEntity)
    assert(hasComponent(equippableEntity, NetworkObjectOwnedTag))
    assert(hasComponent(equippableEntity, EquippedComponent))
    let collider = getComponent(equippableEntity, ColliderComponent).body
    assert.deepEqual(collider._type, BodyType.KINEMATIC)

    // unequip stuff
    unequipEntity(equipperEntity)

    // simulate client behavior for next valid tick
    world.fixedTick = 4
    for (let action of world.outgoingActions) {
        action.$from = Engine.userId
        world.incomingActions.add(action as Required<Action>)
    }
    incomingNetworkSystem()
    equippabbleSystem()

    // validations for unequip
    assert(!hasComponent(equipperEntity, EquipperComponent))
    assert(!hasComponent(equippableEntity, NetworkObjectOwnedTag))
    assert(!hasComponent(equippableEntity, EquippedComponent))
    collider = getComponent(equippableEntity, ColliderComponent).body
    assert.deepEqual(collider._type, BodyType.DYNAMIC)
  })

})
