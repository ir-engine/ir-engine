import { createActionQueue, removeActionQueue } from '@xrengine/hyperflux'

import { World } from '../../ecs/classes/World'
import { MediaNetworkAction } from '../functions/MediaNetworkAction'

export default async function MediaStreamSystem(world: World) {
  const getConsumer = (consumerId: string) => world.mediaNetwork.consumers.find((c) => c.id === consumerId)
  const getProducer = (producerId: string) => world.mediaNetwork.producers.find((c) => c.id === producerId)

  const pauseConsumerQueue = createActionQueue(MediaNetworkAction.pauseConsumer.matches)
  const pauseProducerQueue = createActionQueue(MediaNetworkAction.pauseProducer.matches)

  const execute = () => {
    if (!world.mediaNetwork) return

    for (const action of pauseConsumerQueue()) {
      const consumer = getConsumer(action.consumerId)
      action.pause ? consumer.pause() : consumer.resume()
    }

    for (const action of pauseProducerQueue()) {
      const producer = getProducer(action.producerId)
      action.pause ? producer.pause() : producer.resume()
    }
  }

  const cleanup = async () => {
    removeActionQueue(pauseConsumerQueue)
    removeActionQueue(pauseProducerQueue)
  }

  return { execute, cleanup }
}
