import { defineAction } from '@etherealengine/hyperflux'
import matches from 'ts-matches'
import { matchesEntityUUID } from '../../common/functions/MatchesUtils'
import { NetworkTopics } from '../../networking/classes/Network'

export class MountPointActions {
  static mountInteraction = defineAction({
    type: 'ee.engine.interactions.MOUNT' as const,
    mounted: matches.boolean,
    target: matchesEntityUUID,
    $topic: NetworkTopics.world
  })
}
