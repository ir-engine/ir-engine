import { ColliderDesc, RigidBodyDesc, RigidBodyType } from '@dimforge/rapier3d-compat'
import assert from 'assert'

import { Engine } from '../../ecs/classes/Engine'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { createEngine } from '../../initializeEngine'
import { RigidBodyComponent } from '../components/RigidBodyComponent'
import { RigidBodyDynamicTagComponent } from '../components/RigidBodyDynamicTagComponent'
import { RigidBodyFixedTagComponent } from '../components/RigidBodyFixedTagComponent'
import { getTagComponentForRigidBody } from '../functions/getTagComponentForRigidBody'
import { Physics } from './PhysicsRapier'

describe('Physics', () => {
  before(async () => {
    createEngine()
    await Physics.load()
  })

  it('should create rapier world', async () => {
    const world = Physics.createWorld()
    assert(world)
  })

  it('should create & remove rigidBody', async () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)

    const physicsWorld = Physics.createWorld()

    const rigidBodyDesc = RigidBodyDesc.dynamic()
    const colliderDesc = ColliderDesc.ball(1)

    const rigidBody = Physics.createRigidBody(entity, physicsWorld, rigidBodyDesc, [colliderDesc])

    assert.deepEqual(physicsWorld.bodies.len(), 1)
    assert.deepEqual(physicsWorld.colliders.len(), 1)
    assert.deepEqual(hasComponent(entity, RigidBodyComponent), true)
    assert.deepEqual(getComponent(entity, RigidBodyComponent), rigidBody)
    assert.deepEqual(hasComponent(entity, RigidBodyDynamicTagComponent), true)

    Physics.removeRigidBody(entity, physicsWorld)
    assert.deepEqual(physicsWorld.bodies.len(), 0)
    assert.deepEqual(hasComponent(entity, RigidBodyComponent), false)
    assert.deepEqual(hasComponent(entity, RigidBodyDynamicTagComponent), false)
  })

  it('component type should match rigid body type', async () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)

    const physicsWorld = Physics.createWorld()

    const rigidBodyDesc = RigidBodyDesc.fixed()
    const colliderDesc = ColliderDesc.ball(1)

    const rigidBody = Physics.createRigidBody(entity, physicsWorld, rigidBodyDesc, [colliderDesc])
    const rigidBodyComponent = getTagComponentForRigidBody(rigidBody)

    assert.deepEqual(rigidBodyComponent, RigidBodyFixedTagComponent)
  })

  it('should change rigidBody type', async () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)

    const physicsWorld = Physics.createWorld()

    const rigidBodyDesc = RigidBodyDesc.dynamic()
    const colliderDesc = ColliderDesc.ball(1)

    const rigidBody = Physics.createRigidBody(entity, physicsWorld, rigidBodyDesc, [colliderDesc])

    assert.deepEqual(physicsWorld.bodies.len(), 1)
    assert.deepEqual(rigidBody.bodyType(), RigidBodyType.Dynamic)
    assert.deepEqual(hasComponent(entity, RigidBodyDynamicTagComponent), true)

    Physics.changeRigidbodyType(entity, RigidBodyType.Fixed)
    assert.deepEqual(rigidBody.bodyType(), RigidBodyType.Fixed)
    assert.deepEqual(hasComponent(entity, RigidBodyDynamicTagComponent), false)
    assert.deepEqual(hasComponent(entity, RigidBodyFixedTagComponent), true)
  })
})
