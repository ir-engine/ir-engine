import { RigidBodyDesc } from '@dimforge/rapier3d-compat'
import assert from 'assert'

import { Physics } from './PhysicsRapier'

describe('Physics', () => {
  it('should create rapier world', async () => {
    let physics = new Physics()
    const world = physics.createWorld()
    assert(world)
  })

  it('should create rigidBody', async () => {
    let physics = new Physics()
    const world = await physics.createWorld()

    let rigidBodyDesc = RigidBodyDesc.dynamic()
    physics.addBody(rigidBodyDesc)

    assert.deepEqual(world.bodies.len(), 1)
  })
})
