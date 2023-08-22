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
import { MediaStreamAppData, MediaTagType, NetworkState } from '../NetworkState'

export class MediaProducerActions {
  static requestProducer = defineAction({
    type: 'ee.engine.network.mediasoup.MEDIA_CREATE_PRODUCER',
    requestID: matches.string,
    transportID: matches.string,
    kind: matches.literals('audio', 'video').optional(),
    rtpParameters: matches.object,
    paused: matches.boolean,
    appData: matches.object as Validator<unknown, MediaStreamAppData>
  })

  static requestProducerError = defineAction({
    type: 'ee.engine.network.mediasoup.MEDIA_CREATE_PRODUCER_ERROR',
    requestID: matches.string,
    error: matches.string
  })

  static producerCreated = defineAction({
    type: 'ee.engine.network.mediasoup.MEDIA_PRODUCER_CREATED',
    requestID: matches.string,
    producerID: matches.string,
    peerID: matchesPeerID,
    mediaTag: matches.string as Validator<unknown, DataChannelType>,
    channelID: matches.string as Validator<unknown, ChannelID>,
    $cache: true
  })

  static producerClosed = defineAction({
    type: 'ee.engine.network.mediasoup.MEDIA_CLOSED_PRODUCER',
    producerID: matches.string,
    $cache: true
  })

  static producerPaused = defineAction({
    type: 'ee.engine.network.mediasoup.MEDIA_PRODUCER_PAUSED',
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
    type: 'ee.engine.network.mediasoup.MEDIA_REQUEST_CONSUMER',
    peerID: matchesPeerID,
    mediaTag: matches.string as Validator<unknown, DataChannelType>,
    rtpCapabilities: matches.object,
    channelID: matches.string as Validator<unknown, ChannelID>
  })

  static consumerCreated = defineAction({
    type: 'ee.engine.network.mediasoup.MEDIA_CREATED_CONSUMER',
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

  static consumerLayers = defineAction({
    type: 'ee.engine.network.mediasoup.MEDIA_CONSUMER_LAYERS',
    consumerID: matches.string,
    layer: matches.number
  })

  static consumerClosed = defineAction({
    type: 'ee.engine.network.mediasoup.MEDIA_CLOSED_CONSUMER',
    consumerID: matches.string
  })

  static consumerPaused = defineAction({
    type: 'ee.engine.network.mediasoup.MEDIA_CONSUMER_PAUSED',
    consumerID: matches.string,
    paused: matches.boolean
  })
}

export const MediasoupMediaProducerConsumerState = defineState({
  name: 'ee.engine.network.mediasoup.MediasoupMediaProducerConsumerState',

  initial: {} as Record<
    string, // NetworkID
    {
      producers: {
        [producerID: string]: {
          producerID: string
          producer?: unknown
          peerID: PeerID
          mediaTag: DataChannelType
          channelID: ChannelID
          paused?: boolean
          globalMute?: boolean
        }
      }
      consumers: {
        [consumerID: string]: {
          consumerID: string
          consumer?: unknown
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

  getProducerByPeerIdAndMediaTag: (networkID: string, peerID: string, mediaTag: MediaTagType) => {
    const state = getState(MediasoupMediaProducerConsumerState)[networkID]
    if (!state) return

    const producer = Object.values(state.producers).find((p) => p.peerID === peerID && p.mediaTag === mediaTag)
    if (!producer) return

    return producer.producer
  },

  getConsumerByPeerIdAndMediaTag: (networkID: string, peerID: string, tag: MediaTagType) => {
    const state = getState(MediasoupMediaProducerConsumerState)[networkID]
    if (!state) return

    const consumer = Object.values(state.consumers).find((p) => p.peerID === peerID && p.mediaTag === tag)
    if (!consumer) return

    return consumer.consumer
  },

  receptors: [
    [
      MediaProducerActions.producerCreated,
      (state, action: typeof MediaProducerActions.producerCreated.matches._TYPE) => {
        const networkID = action.$network
        if (!state.value[networkID]) {
          state.merge({ [networkID]: { producers: {}, consumers: {} } })
        }
        // TODO - this is to allow server side consumers to not be overridden
        if (state[networkID].producers.value[action.producerID]) return
        state[networkID].producers.merge({
          [action.producerID]: {
            producerID: action.producerID,
            peerID: action.peerID,
            mediaTag: action.mediaTag,
            channelID: action.channelID
          }
        })
      }
    ],
    [
      MediaProducerActions.producerClosed,
      (state, action: typeof MediaProducerActions.producerClosed.matches._TYPE) => {
        // removed create/close cached actions for this producer
        const cachedActions = Engine.instance.store.actions.cached
        const peerCachedActions = cachedActions.filter(
          (cachedAction) =>
            (MediaProducerActions.producerCreated.matches.test(cachedAction) ||
              MediaProducerActions.producerPaused.matches.test(cachedAction) ||
              MediaProducerActions.producerClosed.matches.test(cachedAction)) &&
            cachedAction.producerID === action.producerID
        )
        for (const cachedAction of peerCachedActions) {
          cachedActions.splice(cachedActions.indexOf(cachedAction), 1)
        }

        const networkID = action.$network
        if (!state.value[networkID]) return

        state[networkID].producers[action.producerID].set(none)

        if (!Object.keys(state[networkID].producers).length && !Object.keys(state[networkID].consumers).length) {
          state[networkID].set(none)
        }
      }
    ],
    [
      MediaProducerActions.producerPaused,
      (state, action: typeof MediaProducerActions.producerPaused.matches._TYPE) => {
        const networkID = action.$network
        if (!state.value[networkID]?.producers[action.producerID]) return

        const producerState = state[networkID].producers[action.producerID]

        producerState.merge({
          paused: action.paused,
          globalMute: action.globalMute
        })

        const peerID = producerState.peerID.value
        const mediatag = producerState.mediaTag.value

        const { globalMute, paused } = action
        const network = getState(NetworkState).networks[networkID]
        const media = network.peers.get(peerID)?.media
        if (media && media[mediatag]) {
          media[mediatag].paused = paused
          media[mediatag].globalMute = globalMute
        }
      }
    ],
    [
      MediaConsumerActions.consumerCreated,
      (state, action: typeof MediaConsumerActions.consumerCreated.matches._TYPE) => {
        const networkID = action.$network
        if (!state.value[networkID]) {
          state.merge({ [networkID]: { producers: {}, consumers: {} } })
        }
        // TODO - this is to allow server side consumers to not be overridden
        if (state[networkID].consumers.value[action.consumerID]) return
        state[networkID].consumers.merge({
          [action.consumerID]: {
            consumerID: action.consumerID,
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
      MediaConsumerActions.consumerClosed,
      (state, action: typeof MediaConsumerActions.consumerClosed.matches._TYPE) => {
        const networkID = action.$network
        if (!state.value[networkID]) return

        state[networkID].consumers[action.consumerID].set(none)

        if (!Object.keys(state[networkID].consumers).length && !Object.keys(state[networkID].consumers).length) {
          state[networkID].set(none)
        }
      }
    ],
    [
      MediaConsumerActions.consumerPaused,
      (state, action: typeof MediaConsumerActions.consumerPaused.matches._TYPE) => {
        const networkID = action.$network
        if (!state.value[networkID]?.consumers[action.consumerID]) return

        state[networkID].consumers[action.consumerID].merge({
          paused: action.paused
        })
      }
    ]
  ]
})

const execute = () => {
  receiveActions(MediasoupMediaProducerConsumerState)
}

export const NetworkProducer = (props: { networkID: UserID; producerID: string }) => {
  const { networkID, producerID } = props
  const producerState = useHookstate(
    getMutableState(MediasoupMediaProducerConsumerState)[networkID].producers[producerID]
  )
  const networkState = useHookstate(getMutableState(NetworkState).networks[networkID])

  useEffect(() => {
    const peerID = producerState.peerID.value
    const mediaTag = producerState.mediaTag.value
    const channelID = producerState.channelID.value
    const network = getState(NetworkState).networks[networkID]
    const producer = producerState.producer.value as any

    console.log(producer)

    if (!producer) return

    // todo, replace this with a better check
    if (isClient) {
      dispatchAction(
        MediaConsumerActions.requestConsumer({
          mediaTag,
          peerID,
          rtpCapabilities: (network as any).mediasoupDevice.rtpCapabilities,
          channelID,
          $topic: network.topic,
          $to: network.hostPeerID
        })
      )
    }

    return () => {
      const network = getState(NetworkState).networks[networkID]
      if (!producer || producer.closed || producer._closed) return

      producer.close()

      // remove from the peer state
      const media = network.peers.get(peerID)?.media
      if (media && media[producer.appData.mediaTag]) {
        delete media[producer.appData.mediaTag]
      }

      // close the consumer
      const consumer = MediasoupMediaProducerConsumerState.getConsumerByPeerIdAndMediaTag(
        networkID,
        peerID,
        mediaTag
      ) as any

      // todo, replace this with a better check
      if (consumer && isClient) {
        dispatchAction(
          MediaConsumerActions.consumerClosed({
            consumerID: consumer.id,
            $topic: network.topic
          })
        )
      }
    }
  }, [producerState.producer])

  useEffect(() => {
    const producer = producerState.producer.value as any
    if (!producer) return

    if (producer.closed || producer._closed) return

    if (producerState.paused.value && producer.pause) producer.pause()
    if (!producerState.paused.value && producer.resume) producer.resume()

    const consumer = Object.entries(getState(MediasoupMediaProducerConsumerState)[networkID].consumers).find(
      ([_, consumer]) => consumer.producerID === producerID
    )

    if (!consumer) return console.warn('No consumer found for paused producer', producerID)

    dispatchAction(
      MediaConsumerActions.consumerPaused({
        consumerID: consumer[0],
        paused: !!producerState.paused.value,
        $topic: networkState.topic.value
      })
    )
  }, [producerState.paused, producerState.producer])

  return <></>
}

export const NetworkConsumer = (props: { networkID: UserID; consumerID: string }) => {
  const { networkID, consumerID } = props
  const consumerState = useHookstate(
    getMutableState(MediasoupMediaProducerConsumerState)[networkID].consumers[consumerID]
  )
  const networkState = useHookstate(getMutableState(NetworkState).networks[networkID])

  useEffect(() => {
    const consumer = consumerState.consumer.value as any
    if (!consumer) return

    return () => {
      if (!consumer.closed || consumer._closed) return

      const network = getState(NetworkState).networks[networkID]

      consumer.close()

      // remove from the peer state
      delete network.peers.get(consumer.appData.peerID)?.consumerLayers?.[consumer.id]
    }
  }, [consumerState.consumer])

  useEffect(() => {
    const consumer = consumerState.consumer.value as any
    if (!consumer) return

    if (consumer.closed || consumer._closed) return

    if (consumerState.paused.value && consumer.pause) consumer.pause()
    if (!consumerState.paused.value && consumer.resume) consumer.resume()
  }, [consumerState.paused, consumerState.consumer])

  return <></>
}

const NetworkReactor = (props: { networkID: UserID }) => {
  const { networkID } = props
  const networkState = useHookstate(getMutableState(NetworkState).networks[networkID])
  const producers = useHookstate(getMutableState(MediasoupMediaProducerConsumerState)[networkID].producers)
  const consumers = useHookstate(getMutableState(MediasoupMediaProducerConsumerState)[networkID].consumers)

  useEffect(() => {
    for (const [producerID, producer] of Object.entries(producers.value)) {
      if (!networkState.peers.value.get(producer.peerID)) {
        producers[producerID].set(none)
      }
    }
    for (const [consumerID, consumer] of Object.entries(consumers.value)) {
      if (!networkState.peers.value.get(consumer.peerID)) {
        consumers[consumerID].set(none)
      }
    }
  }, [networkState.peers])

  return (
    <>
      {Object.keys(producers.value).map((producerID: string) => (
        <NetworkProducer key={producerID} producerID={producerID} networkID={networkID} />
      ))}
      {Object.keys(consumers.value).map((consumerID: string) => (
        <NetworkConsumer key={consumerID} consumerID={consumerID} networkID={networkID} />
      ))}
    </>
  )
}

const reactor = () => {
  const networkIDs = useHookstate(getMutableState(MediasoupMediaProducerConsumerState))
  return (
    <>
      {Object.keys(networkIDs.value).map((hostId: UserID) => (
        <NetworkReactor key={hostId} networkID={hostId} />
      ))}
    </>
  )
}

export const MediasoupMediaProducerConsumerStateSystem = defineSystem({
  uuid: 'ee.engine.MediasoupMediaProducerConsumerStateSystem',
  execute,
  reactor
})
