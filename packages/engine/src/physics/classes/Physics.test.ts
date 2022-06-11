import { ColliderDesc, RigidBodyDesc, RigidBodyType } from '@dimforge/rapier3d-compat'
import assert from 'assert'

import { Engine } from '../../ecs/classes/Engine'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { createEngine } from '../../initializeEngine'
import { RigidBodyComponent } from '../components/RigidBodyComponent'
import { RigidBodyDynamicComponent } from '../components/RigidBodyDynamicComponent'
import { RigidBodyFixedComponent } from '../components/RigidBodyFixedComponent'
import { getComponentTypeForRigidBody } from '../functions/getComponentTypeForRigidBody'
import { Physics } from './PhysicsRapier'

describe('Physics', () => {
  before(async () => {
    await Physics.load()
  })

  it('should create rapier world', async () => {
    const world = Physics.createWorld()
    assert(world)
  })

  it('should create & remove rigidBody', async () => {
    createEngine()
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)

    const physicsWorld = Physics.createWorld()

    const rigidBodyDesc = RigidBodyDesc.dynamic()
    const colliderDesc = ColliderDesc.ball(1)

    const rigidBody = Physics.createRigidBody(entity, physicsWorld, rigidBodyDesc, colliderDesc)

    assert.deepEqual(physicsWorld.bodies.len(), 1)
    assert.deepEqual(physicsWorld.colliders.len(), 1)
    assert.deepEqual(hasComponent(entity, RigidBodyComponent), true)
    assert.deepEqual(getComponent(entity, RigidBodyComponent).rigidBody, rigidBody)
    assert.deepEqual(hasComponent(entity, RigidBodyDynamicComponent), true)

    Physics.removeRigidBody(entity, physicsWorld)
    assert.deepEqual(physicsWorld.bodies.len(), 0)
    assert.deepEqual(hasComponent(entity, RigidBodyComponent), false)
    assert.deepEqual(hasComponent(entity, RigidBodyDynamicComponent), false)
  })

  it('component type should match rigid body type', async () => {
    createEngine()
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)

    const physicsWorld = Physics.createWorld()

    const rigidBodyDesc = RigidBodyDesc.fixed()
    const colliderDesc = ColliderDesc.ball(1)

    const rigidBody = Physics.createRigidBody(entity, physicsWorld, rigidBodyDesc, colliderDesc)
    const rigidBodyComponent = getComponentTypeForRigidBody(rigidBody)

    assert.deepEqual(rigidBodyComponent, RigidBodyFixedComponent)
  })

  it('should change rigidBody type', async () => {
    createEngine()
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)

    const physicsWorld = Physics.createWorld()

    const rigidBodyDesc = RigidBodyDesc.dynamic()
    const colliderDesc = ColliderDesc.ball(1)

    const rigidBody = Physics.createRigidBody(entity, physicsWorld, rigidBodyDesc, colliderDesc)

    assert.deepEqual(physicsWorld.bodies.len(), 1)
    assert.deepEqual(rigidBody.bodyType(), RigidBodyType.Dynamic)
    assert.deepEqual(hasComponent(entity, RigidBodyDynamicComponent), true)

    Physics.changeRigidbodyType(entity, RigidBodyType.Fixed)
    assert.deepEqual(rigidBody.bodyType(), RigidBodyType.Fixed)
    assert.deepEqual(hasComponent(entity, RigidBodyDynamicComponent), false)
    assert.deepEqual(hasComponent(entity, RigidBodyFixedComponent), true)
  })
})
