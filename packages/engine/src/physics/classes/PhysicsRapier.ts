// This file will be renamed to Physics.ts when we are ready to take out physx completely.
import { World } from '@dimforge/rapier3d-compat'

import { loadRapier } from '../rapier/loadRapier'

export class Physics {
  gravity = { x: 0.0, y: -9.81, z: 0.0 }

  async createWorld() {
    await loadRapier()
    const world = new World(this.gravity)
    return world
  }
}
