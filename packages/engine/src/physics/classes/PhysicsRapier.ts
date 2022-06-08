// This file will be renamed to Physics.ts when we are ready to take out physx completely.
import { RigidBodyDesc, World } from '@dimforge/rapier3d-compat'

import { loadRapier } from '../rapier/loadRapier'

export class Physics {
  world: World

  gravity = { x: 0.0, y: -9.81, z: 0.0 }

  async createWorld() {
    await loadRapier()
    this.world = new World(this.gravity)
    return this.world
  }

  addBody(rigidBodyDesc: RigidBodyDesc) {
    let rigidBody = this.world.createRigidBody(rigidBodyDesc)
  }
}
