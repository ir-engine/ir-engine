/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { useEffect } from 'react'

import { ChannelID } from '@etherealengine/common/src/dbmodels/Channel'
import { DataChannelType } from '@etherealengine/common/src/interfaces/DataChannelType'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import {
  defineAction,
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  none,
  receiveActions,
  useHookstate
} from '@etherealengine/hyperflux'
import { Validator, matches, matchesPeerID } from '../../common/functions/MatchesUtils'
import { isClient } from '../../common/functions/getEnvironment'
import { Engine } from '../../ecs/classes/Engine'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { UserID } from '../../schemas/user/user.schema'
import { MediaStreamAppData, NetworkState } from '../NetworkState'

export class MediaProducerActions {
  static requestProducer = defineAction({
    type: 'ee.engine.network.MEDIA_CREATE_PRODUCER',
    requestID: matches.string,
    transportId: matches.string,
    kind: matches.literals('audio', 'video').optional(),
    rtpParameters: matches.object,
    paused: matches.boolean,
    appData: matches.object as Validator<unknown, MediaStreamAppData>
  })

  static requestProducerError = defineAction({
    type: 'ee.engine.network.MEDIA_CREATE_PRODUCER_ERROR',
    requestID: matches.string,
    error: matches.string
  })

  static producerCreated = defineAction({
    type: 'ee.engine.network.MEDIA_PRODUCER_CREATED',
    requestID: matches.string,
    producerID: matches.string,
    peerID: matchesPeerID,
    mediaTag: matches.string as Validator<unknown, DataChannelType>,
    channelID: matches.string as Validator<unknown, ChannelID>,
    $cache: true
  })

  static closeProducer = defineAction({
    type: 'ee.engine.network.MEDIA_CLOSED_PRODUCER',
    producerID: matches.string,
    $cache: true
  })

  static producerPaused = defineAction({
    type: 'ee.engine.network.MEDIA_PRODUCER_PAUSED',
    producerID: matches.string,
    paused: matches.boolean,
    globalMute: matches.boolean,
    $cache: {
      removePrevious: ['producerID']
    }
  })
}

export class MediaConsumerActions {
  static requestConsumer = defineAction({
    type: 'ee.engine.network.MEDIA_REQUEST_CONSUMER',
    peerID: matchesPeerID,
    mediaTag: matches.string as Validator<unknown, DataChannelType>,
    rtpCapabilities: matches.object,
    channelID: matches.string as Validator<unknown, ChannelID>
  })

  static consumerCreated = defineAction({
    type: 'ee.engine.network.MEDIA_CREATED_CONSUMER',
    consumerID: matches.string,
    peerID: matchesPeerID,
    mediaTag: matches.string as Validator<unknown, DataChannelType>,
    channelID: matches.string as Validator<unknown, ChannelID>,
    producerID: matches.string,
    kind: matches.literals('audio', 'video').optional(),
    rtpParameters: matches.object,
    consumerType: matches.string,
    paused: matches.boolean
  })

  static closeConsumer = defineAction({
    type: 'ee.engine.network.MEDIA_CLOSED_CONSUMER',
    consumerID: matches.string
  })

  static consumerPaused = defineAction({
    type: 'ee.engine.network.MEDIA_CONSUMER_PAUSED',
    consumerID: matches.string,
    paused: matches.boolean
  })
}

export const MediaProducerConsumerState = defineState({
  name: 'ee.engine.network.MediaProducerConsumerState',

  initial: {} as Record<
    UserID, // NetworkID
    {
      producers: {
        [producerID: string]: {
          peerID: PeerID
          mediaTag: DataChannelType
          channelID: ChannelID
          paused?: boolean
          globalMute?: boolean
        }
      }
      consumers: {
        [consumerID: string]: {
          peerID: PeerID
          mediaTag: DataChannelType
          channelID: ChannelID
          producerID: string
          paused?: boolean
          kind?: 'audio' | 'video'
          rtpParameters: any
          type: string
        }
      }
    }
  >,

  // TODO: support multiple networks
  receptors: [
    [
      MediaProducerActions.producerCreated,
      (state, action: typeof MediaProducerActions.producerCreated.matches._TYPE) => {
        const hostId = Engine.instance.mediaNetwork.hostId
        if (!state.value[hostId]) {
          state.merge({ [hostId]: { producers: {}, consumers: {} } })
        }
        state[hostId].producers.merge({
          [action.producerID]: {
            peerID: action.peerID,
            mediaTag: action.mediaTag,
            channelID: action.channelID
          }
        })
      }
    ],
    [
      MediaProducerActions.closeProducer,
      (state, action: typeof MediaProducerActions.closeProducer.matches._TYPE) => {
        const hostId = Engine.instance.mediaNetwork.hostId
        if (!state.value[hostId]) return

        state[hostId].producers[action.producerID].set(none)

        if (!Object.keys(state[hostId].producers).length && !Object.keys(state[hostId].consumers).length) {
          state[hostId].set(none)
        }
      }
    ],
    [
      MediaProducerActions.producerPaused,
      (state, action: typeof MediaProducerActions.producerPaused.matches._TYPE) => {
        const hostId = Engine.instance.mediaNetwork.hostId
        if (!state.value[hostId]?.producers[action.producerID]) return

        state[hostId].producers[action.producerID].merge({
          paused: action.paused,
          globalMute: action.globalMute
        })

        const peerID = state[hostId].producers[action.producerID].peerID.value

        const { producerID: producerId, globalMute, paused } = action
        const network = getState(NetworkState).networks[hostId]
        const producer = network.producers.find((p) => p.id === producerId)
        if (producer) {
          const media = network.peers.get(peerID)?.media
          if (media && media[producer.appData.mediaTag]) {
            media[producer.appData.mediaTag].paused = paused
            media[producer.appData.mediaTag].globalMute = globalMute
          }
        }
      }
    ],
    [
      MediaConsumerActions.consumerCreated,
      (state, action: typeof MediaConsumerActions.consumerCreated.matches._TYPE) => {
        const hostId = Engine.instance.mediaNetwork.hostId
        if (!state.value[hostId]) {
          state.merge({ [hostId]: { producers: {}, consumers: {} } })
        }
        state[hostId].consumers.merge({
          [action.consumerID]: {
            peerID: action.peerID,
            mediaTag: action.mediaTag,
            channelID: action.channelID,
            producerID: action.producerID,
            kind: action.kind!,
            paused: action.paused,
            rtpParameters: action.rtpParameters,
            type: action.consumerType
          }
        })
      }
    ],
    [
      MediaConsumerActions.closeConsumer,
      (state, action: typeof MediaConsumerActions.closeConsumer.matches._TYPE) => {
        const hostId = Engine.instance.mediaNetwork.hostId
        if (!state.value[hostId]) return

        state[hostId].consumers[action.consumerID].set(none)

        if (!Object.keys(state[hostId].consumers).length && !Object.keys(state[hostId].consumers).length) {
          state[hostId].set(none)
        }
      }
    ],
    [
      MediaConsumerActions.consumerPaused,
      (state, action: typeof MediaConsumerActions.consumerPaused.matches._TYPE) => {
        const hostId = Engine.instance.mediaNetwork.hostId
        if (!state.value[hostId]?.consumers[action.consumerID]) return

        state[hostId].consumers[action.consumerID].merge({
          paused: action.paused
        })
      }
    ]
  ]
})

const execute = () => {
  receiveActions(MediaProducerConsumerState)
}

export const NetworkProducer = (props: { networkID: UserID; producerID: string }) => {
  const { networkID, producerID } = props
  const producerState = useHookstate(getMutableState(MediaProducerConsumerState)[networkID].producers[producerID])
  const networkState = useHookstate(getMutableState(NetworkState).networks[networkID])
  const networkProducerState = networkState.producers.find((p) => p.value.id === producerID)

  useEffect(() => {
    const peerID = producerState.peerID.value
    const mediaTag = producerState.mediaTag.value
    const channelID = producerState.channelID.value
    const network = getState(NetworkState).networks[networkID]

    // todo, replace this with a better check
    if (isClient) {
      dispatchAction(
        MediaConsumerActions.requestConsumer({
          mediaTag,
          peerID,
          rtpCapabilities: (network as any).mediasoupDevice.rtpCapabilities,
          channelID,
          $topic: network.topic,
          $to: network.hostId
        })
      )
    }

    return () => {
      const network = getState(NetworkState).networks[networkID]
      const producer = network.producers.find((p) => p.id === producerID)
      if (!producer || producer.closed || producer._closed) return

      producer.close()

      // remove from the network state
      networkState.producers.set((p) => {
        const index = p.findIndex((c) => c.id === producer.id)
        if (index > -1) {
          p.splice(index, 1)
        }
        return p
      })

      // remove from the peer state
      const media = network.peers.get(peerID)?.media
      if (media && media[producer.appData.mediaTag]) {
        delete media[producer.appData.mediaTag]
      }

      // close the consumer
      const consumer = network.consumers.find((c) => c.appData.peerID === peerID && c.appData.mediaTag === mediaTag)
      // todo, replace this with a better check
      if (consumer && isClient) {
        dispatchAction(
          MediaConsumerActions.closeConsumer({
            consumerID: consumer.id,
            $topic: network.topic
          })
        )
      }
    }
  }, [])

  useEffect(() => {
    const network = getState(NetworkState).networks[networkID]
    const producer = network.producers.find((p) => p.id === producerID)
    if (!producer) return

    if (producer.closed || producer._closed) return

    if (producerState.paused.value && producer.pause) producer.pause()
    if (!producerState.paused.value && producer.resume) producer.resume()
  }, [producerState.paused, networkProducerState])

  return <></>
}

export const NetworkConsumer = (props: { networkID: UserID; consumerID: string }) => {
  const { networkID, consumerID } = props
  const consumerState = useHookstate(getMutableState(MediaProducerConsumerState)[networkID].consumers[consumerID])
  const networkState = useHookstate(getMutableState(NetworkState).networks[networkID])
  const networkConsumerState = networkState.consumers.find((p) => p.value.id === consumerID)

  useEffect(() => {
    return () => {
      const network = getState(NetworkState).networks[networkID]
      const consumer = network.consumers.find((p) => p.id === consumerID)
      if (!consumer || consumer.closed || consumer._closed) return

      // remove from the network state
      networkState.consumers.set((p) => {
        const index = p.findIndex((c) => c.id === consumer.id)
        if (index > -1) {
          p.splice(index, 1)
        }
        return p
      })

      consumer.close()

      // remove from the peer state
      delete network.peers.get(consumer.appData.peerID)?.consumerLayers?.[consumer.id]
    }
  }, [])

  useEffect(() => {
    const network = getState(NetworkState).networks[networkID]
    const consumer = network.consumers.find((p) => p.id === consumerID)
    if (!consumer) return

    if (consumer.closed || consumer._closed) return

    if (consumerState.paused.value && consumer.pause) consumer.pause()
    if (!consumerState.paused.value && consumer.resume) consumer.resume()
  }, [consumerState.paused, networkConsumerState, networkState.consumers.length])

  return <></>
}

const NetworkProducers = (props: { networkID: UserID }) => {
  const { networkID } = props
  const producers = useHookstate(getMutableState(MediaProducerConsumerState)[networkID].producers)

  return (
    <>
      {Object.keys(producers.value).map((producerID: string) => (
        <NetworkProducer key={producerID} producerID={producerID} networkID={networkID} />
      ))}
    </>
  )
}

const NetworkConsumers = (props: { networkID: UserID }) => {
  const { networkID } = props
  const consumers = useHookstate(getMutableState(MediaProducerConsumerState)[networkID].consumers)

  return (
    <>
      {Object.keys(consumers.value).map((consumerID: string) => (
        <NetworkConsumer key={consumerID} consumerID={consumerID} networkID={networkID} />
      ))}
    </>
  )
}

const reactor = () => {
  const networkIDs = useHookstate(getMutableState(MediaProducerConsumerState))
  return (
    <>
      {Object.keys(networkIDs.value).map((hostId: UserID) => (
        <NetworkProducers key={hostId + 'producer'} networkID={hostId} />
      ))}
      {Object.keys(networkIDs.value).map((hostId: UserID) => (
        <NetworkConsumers key={hostId + 'consumer'} networkID={hostId} />
      ))}
    </>
  )
}

export const MediaProducerConsumerStateSystem = defineSystem({
  uuid: 'ee.engine.MediaProducerConsumerStateSystem',
  execute,
  reactor
})
