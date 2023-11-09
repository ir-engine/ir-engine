import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { MediasoupDataProducerConsumerStateSystem } from './MediasoupDataProducerConsumerState'
import { MediasoupMediaProducerConsumerStateSystem } from './MediasoupMediaProducerConsumerState'
import { MediasoupTransportStateSystem } from './MediasoupTransportState'

export const MediasoupSystemGroup = defineSystem({
  uuid: 'ee.engine.network.MediasoupSystemGroup',
  subSystems: [
    MediasoupTransportStateSystem,
    MediasoupMediaProducerConsumerStateSystem,
    MediasoupDataProducerConsumerStateSystem
  ]
})
