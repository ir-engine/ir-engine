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

describe('Equippables Integration Tests', () => {
  it('Can equip and unequip', async () => {
    createEngine()
    const world = Engine.instance.currentWorld

    const hostUserId = 'server' as UserId
    world.hostId = hostUserId
    const hostIndex = 0
    world.clients.set(hostUserId, { userId: hostUserId, name: 'server', index: hostIndex })

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
      ownerId: world.hostId,
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
    //     (a) => matches(a).when(NetworkWorldAction.setEquippedObject.matches, setEquippedObjectReceptor)
    // )
    ActionFunctions.clearOutgoingActions(world.store)
    ActionFunctions.applyIncomingActions(world.store)

    equippableQueryEnter(equipperEntity)

    // validations for equip
    assert(hasComponent(equipperEntity, EquipperComponent))
    const equipperComponent = getComponent(equipperEntity, EquipperComponent)
    assert.equal(equippableEntity, equipperComponent.equippedEntity)
    // assert(hasComponent(equippableEntity, NetworkObjectAuthorityTag))
    assert(hasComponent(equippableEntity, EquippedComponent))
    let collider = getComponent(equippableEntity, ColliderComponent).body
    assert.deepEqual(collider._type, BodyType.KINEMATIC)

    // unequip stuff
    unequipEntity(equipperEntity)

    ActionFunctions.clearOutgoingActions(world.store)
    ActionFunctions.applyIncomingActions(world.store)

    equippableQueryExit(equipperEntity)

    // validations for unequip
    assert(!hasComponent(equipperEntity, EquipperComponent))
    // assert(!hasComponent(equippableEntity, NetworkObjectAuthorityTag))
    assert(!hasComponent(equippableEntity, EquippedComponent))
    collider = getComponent(equippableEntity, ColliderComponent).body
    assert.deepEqual(collider._type, BodyType.DYNAMIC)
  })
})
