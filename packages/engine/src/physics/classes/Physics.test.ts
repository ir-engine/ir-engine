import { ColliderDesc, RigidBodyDesc, RigidBodyType } from '@dimforge/rapier3d-compat'
import assert from 'assert'

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
    const world = Physics.createWorld()

    const rigidBodyDesc = RigidBodyDesc.dynamic()
    const rigidBody = Physics.createRigidBody(world, rigidBodyDesc)

    assert.deepEqual(world.bodies.len(), 1)

    Physics.removeRigidBody(world, rigidBody)
    assert.deepEqual(world.bodies.len(), 0)
  })

  it('should change rigidBody type', async () => {
    const world = Physics.createWorld()

    const rigidBodyDesc = RigidBodyDesc.dynamic()
    const rigidBody = Physics.createRigidBody(world, rigidBodyDesc)

    assert.deepEqual(world.bodies.len(), 1)
    assert.deepEqual(rigidBody.bodyType(), RigidBodyType.Dynamic)

    Physics.changeRigidbodyType(rigidBody, RigidBodyType.Fixed)
    assert.deepEqual(rigidBody.bodyType(), RigidBodyType.Fixed)
  })

  it('should create collider', async () => {
    const world = Physics.createWorld()

    const rigidBodyDesc = RigidBodyDesc.dynamic()
    const rigidBody = Physics.createRigidBody(world, rigidBodyDesc)

    const colliderDesc = ColliderDesc.ball(1)
    Physics.createCollider(world, rigidBody, colliderDesc)

    assert.deepEqual(world.bodies.len(), 1)
    assert.deepEqual(world.colliders.len(), 1)
  })
})
