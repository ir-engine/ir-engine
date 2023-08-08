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

import { ChannelID } from '@etherealengine/common/src/interfaces/ChannelUser'
import { DataChannelType } from '@etherealengine/common/src/interfaces/DataChannelType'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import {
  defineAction,
  defineState,
  getMutableState,
  getState,
  none,
  receiveActions,
  useHookstate
} from '@etherealengine/hyperflux'
import { Validator, matches, matchesPeerID } from '../../common/functions/MatchesUtils'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { NetworkState } from '../NetworkState'

export class ProducerActions {
  static createProducer = defineAction({
    type: 'ee.engine.network.CREATE_PRODUCER',
    producerId: matches.string,
    peerID: matchesPeerID,
    mediaTag: matches.string as Validator<unknown, DataChannelType>,
    channelID: matches.string as Validator<unknown, ChannelID>,
    $cache: {
      removePrevious: ['producerId']
    }
  })

  static closeProducer = defineAction({
    type: 'ee.engine.network.CLOSED_PRODUCER',
    producerId: matches.string,
    $cache: {
      removePrevious: ['producerId']
    }
  })

  static producerPaused = defineAction({
    type: 'ee.engine.network.PRODUCER_PAUSED',
    producerId: matches.string,
    paused: matches.boolean,
    globalMute: matches.boolean,
    $cache: {
      removePrevious: ['producerId']
    }
  })
}

export class ConsumerActions {
  static createConsumer = defineAction({
    type: 'ee.engine.network.CREATE_CONSUMER',
    consumerId: matches.string,
    peerID: matchesPeerID,
    mediaTag: matches.string as Validator<unknown, DataChannelType>,
    channelID: matches.string as Validator<unknown, ChannelID>
  })

  static closeConsumer = defineAction({
    type: 'ee.engine.network.CLOSED_CONSUMER',
    consumerId: matches.string
  })

  static consumerPaused = defineAction({
    type: 'ee.engine.network.CONSUMER_PAUSED'
  })
}

export const ProducerConsumerState = defineState({
  name: 'ee.engine.network.ProducerState',

  initial: {} as Record<
    UserId, // NetworkID
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
        [consumerID: string]: {}
      }
    }
  >,

  receptors: [
    [
      ProducerActions.createProducer,
      (state, action: typeof ProducerActions.createProducer.matches._TYPE) => {
        if (!state.value[action.$from]) {
          state.merge({ [action.$from as UserId]: { producers: {}, consumers: {} } })
        }
        state[action.$from].producers.merge({
          [action.producerId]: {
            peerID: action.peerID,
            mediaTag: action.mediaTag,
            channelID: action.channelID
          }
        })
      }
    ],
    [
      ProducerActions.closeProducer,
      (state, action: typeof ProducerActions.closeProducer.matches._TYPE) => {
        if (!state.value[action.$from]) return

        state[action.$from].producers[action.producerId].set(none)

        if (!Object.keys(state[action.$from].producers).length && !Object.keys(state[action.$from].consumers).length) {
          state[action.$from].set(none)
        }
      }
    ],
    [
      ProducerActions.producerPaused,
      (state, action: typeof ProducerActions.producerPaused.matches._TYPE) => {
        if (!state.value[action.$from]?.producers[action.producerId]) return

        state[action.$from].producers[action.producerId].merge({
          paused: action.paused,
          globalMute: action.globalMute
        })

        const { producerId, globalMute, paused } = action
        const network = getState(NetworkState).networks[action.$from]
        const producer = network.producers.find((p) => p.id === producerId)
        if (producer) {
          const peerID = action.$peer
          const media = network.peers.get(peerID)?.media
          if (media && media[producer.appData.mediaTag]) {
            media[producer.appData.mediaTag].paused = paused
            media[producer.appData.mediaTag].globalMute = globalMute
          }
        }
      }
    ]
    // [
    //   ConsumerActions.createConsumer,
    //   (state, action: typeof ConsumerActions.createConsumer.matches._TYPE) => {
    //     if (!state.value[action.$from]) {
    //       state.merge({ [action.$from as UserId]: { producers: {}, consumers: {} } })
    //     }

    //     state[action.$from].consumers.merge({
    //       [action.consumerId]: {
    //         peerID: action.peerID,
    //         mediaTag: action.mediaTag,
    //         channelID: action.channelID
    //       }
    //     })
    //   }
    // ],
    // [
    //   ConsumerActions.closeConsumer,
    //   (state, action: typeof ConsumerActions.closeConsumer.matches._TYPE) => {
    //     if (!state.value[action.$from]) return

    //     state[action.$from].consumers[action.consumerId].set(none)

    //     if (!Object.keys(state[action.$from].producers).length && !Object.keys(state[action.$from].consumers).length) {
    //       state[action.$from].set(none)
    //     }
    //   }
    // ]
  ]
})

const execute = () => {
  receiveActions(ProducerConsumerState)
}

export const NetworkProducer = (props: { networkID: UserId; producerID: string }) => {
  const { networkID, producerID } = props
  const producerState = useHookstate(getMutableState(ProducerConsumerState)[networkID].producers[producerID])
  const networkState = useHookstate(getMutableState(NetworkState).networks[networkID])
  const networkProducerState = networkState.producers.find((p) => p.value.id === producerID)

  useEffect(() => {
    const network = getState(NetworkState).networks[networkID]
    const producer = network.producers.find((p) => p.id === producerID)
    if (!producer) return

    if (producer.closed || producer._closed) return

    if (producerState.paused.value) if (typeof producer.pause === 'function') producer.pause()

    if (!producerState.paused.value) if (typeof producer.resume === 'function') producer.resume()
  }, [producerState.paused, networkProducerState])

  return <></>
}

const NetworkProducers = (props: { networkID: UserId }) => {
  const { networkID } = props
  const producers = useHookstate(getMutableState(ProducerConsumerState)[networkID].producers)

  return (
    <>
      {Object.keys(producers.value).map((producerID: string) => (
        <NetworkProducer key={producerID} producerID={producerID} networkID={networkID} />
      ))}
    </>
  )
}

const ProducerReactor = () => {
  const networkIDs = useHookstate(getMutableState(ProducerConsumerState))
  return (
    <>
      {Object.keys(networkIDs.value).map((hostId: UserId) => (
        <NetworkProducers key={hostId} networkID={hostId} />
      ))}
    </>
  )
}

const reactor = () => {
  return (
    <>
      <ProducerReactor />
    </>
  )
}

export const ProducerConsumerStateSystem = defineSystem({
  uuid: 'ee.engine.ProducerConsumerStateSystem',
  execute,
  reactor
})
