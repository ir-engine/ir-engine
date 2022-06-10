import { ColliderDesc, RigidBodyDesc, RigidBodyType } from '@dimforge/rapier3d-compat'
import assert from 'assert'

import { Engine } from '../../ecs/classes/Engine'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { createEngine } from '../../initializeEngine'
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

    Physics.removeRigidBody(physicsWorld, rigidBody)
    assert.deepEqual(physicsWorld.bodies.len(), 0)
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

    Physics.changeRigidbodyType(rigidBody, RigidBodyType.Fixed)
    assert.deepEqual(rigidBody.bodyType(), RigidBodyType.Fixed)
  })
})
