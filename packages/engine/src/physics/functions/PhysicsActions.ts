import { matches } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction } from '@xrengine/hyperflux'

export class PhysicsAction {
  static collisionStarted = defineAction({
    store: 'ENGINE',
    type: 'physics.COLLISION_STARTED',
    colliderAHandle: matches.number,
    colliderBHandle: matches.number
  })
  static collisionEnded = defineAction({
    store: 'ENGINE',
    type: 'physics.COLLISION_ENDED',
    colliderAHandle: matches.number,
    colliderBHandle: matches.number
  })
  static triggerStarted = defineAction({
    store: 'ENGINE',
    type: 'physics.TRIGGER_STARTED',
    colliderAHandle: matches.number,
    colliderBHandle: matches.number
  })
  static triggerEnded = defineAction({
    store: 'ENGINE',
    type: 'physics.TRIGGER_ENDED',
    colliderAHandle: matches.number,
    colliderBHandle: matches.number
  })
}
