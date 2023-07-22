import { EventQueue, World as PhysicsWorld } from '@dimforge/rapier3d-compat'
import { defineState } from '@etherealengine/hyperflux'

export const PhysicsState = defineState({
  name: 'ee.engine.PhysicsState',
  initial: () => {
    return {
      physicsWorld: null! as PhysicsWorld,
      physicsCollisionEventQueue: null! as EventQueue
    }
  }
})
