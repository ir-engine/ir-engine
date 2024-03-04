import { defineAction } from '@etherealengine/hyperflux'
import { matchesQuaternion, matchesVector3 } from '../common/functions/MatchesUtils'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'

export const SpawnObjectActions = {
  spawnObject: defineAction(
    WorldNetworkAction.spawnEntity.extend({
      type: 'ee.engine.world.SPAWN_OBJECT',
      position: matchesVector3.optional(),
      rotation: matchesQuaternion.optional()
    })
  )
}
