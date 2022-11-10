import { defineAction } from '@xrengine/hyperflux'

import { matches } from '../../common/functions/MatchesUtils'
import { NetworkTopics } from '../classes/Network'

export class MediaNetworkAction {
  static pauseConsumer = defineAction({
    type: 'xre.networking.media.PAUSE_CONSUMER',
    consumerId: matches.string,
    pause: matches.boolean,
    $cache: { removePrevious: true },
    $topic: NetworkTopics.media
  })

  static pauseProducer = defineAction({
    type: 'xre.networking.media.PAUSE_PRODUCER',
    producerId: matches.string,
    globalMute: matches.boolean.optional(),
    pause: matches.boolean,
    $cache: { removePrevious: true },
    $topic: NetworkTopics.media
  })
}
