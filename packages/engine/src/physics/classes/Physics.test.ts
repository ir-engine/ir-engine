import assert from 'assert'

import { Physics } from './PhysicsRapier'

describe('Physics', () => {
  it('should create rapier world', async () => {
    let physics = new Physics()
    const world = physics.createWorld()
    assert(world)
  })
})
