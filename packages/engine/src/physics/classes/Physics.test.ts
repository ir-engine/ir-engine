import { ColliderDesc, RigidBodyDesc } from '@dimforge/rapier3d-compat'
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

  it('should create rigidBody', async () => {
    const world = Physics.createWorld()

    const rigidBodyDesc = RigidBodyDesc.dynamic()
    Physics.addBody(world, rigidBodyDesc)

    assert.deepEqual(world.bodies.len(), 1)
  })

  it('should create collider', async () => {
    const world = Physics.createWorld()

    const rigidBodyDesc = RigidBodyDesc.dynamic()
    const rigidBody = Physics.addBody(world, rigidBodyDesc)

    const colliderDesc = ColliderDesc.ball(1)
    Physics.createCollider(world, rigidBody, colliderDesc)

    assert.deepEqual(world.bodies.len(), 1)
    assert.deepEqual(world.colliders.len(), 1)
  })
})
