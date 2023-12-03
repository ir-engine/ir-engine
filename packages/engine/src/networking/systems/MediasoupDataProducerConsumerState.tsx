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

import { DataChannelType } from '@etherealengine/common/src/interfaces/DataChannelType'
import { defineAction, defineState, getMutableState, getState, none } from '@etherealengine/hyperflux'
import { Validator, matches, matchesPeerID } from '../../common/functions/MatchesUtils'
import { InstanceID } from '../../schemas/networking/instance.schema'

export class MediasoupDataProducerActions {
  static requestProducer = defineAction({
    type: 'ee.engine.network.mediasoup.DATA_REQUEST_PRODUCER',
    requestID: matches.string,
    transportID: matches.string,
    protocol: matches.string,
    sctpStreamParameters: matches.object as Validator<unknown, any>,
    dataChannel: matches.string as Validator<unknown, DataChannelType>,
    appData: matches.object as Validator<unknown, any>
  })

  static requestProducerError = defineAction({
    type: 'ee.engine.network.mediasoup.DATA_REQUEST_PRODUCER_ERROR',
    requestID: matches.string,
    error: matches.string
  })

  static producerCreated = defineAction({
    type: 'ee.engine.network.mediasoup.DATA_PRODUCER_CREATED',
    requestID: matches.string,
    producerID: matches.string,
    transportID: matches.string,
    protocol: matches.string,
    sctpStreamParameters: matches.object as Validator<unknown, any>,
    dataChannel: matches.string as Validator<unknown, DataChannelType>,
    appData: matches.object as Validator<unknown, any>,
    $cache: true
  })

  static producerClosed = defineAction({
    type: 'ee.engine.network.mediasoup.DATA_CLOSED_PRODUCER',
    producerID: matches.string,
    $cache: true
  })
}

export class MediasoupDataConsumerActions {
  static requestConsumer = defineAction({
    type: 'ee.engine.network.mediasoup.DATA_REQUEST_CONSUMER',
    dataChannel: matches.string as Validator<unknown, DataChannelType>
  })

  static consumerCreated = defineAction({
    type: 'ee.engine.network.mediasoup.DATA_CREATED_CONSUMER',
    consumerID: matches.string,
    peerID: matchesPeerID,
    producerID: matches.string,
    transportID: matches.string,
    dataChannel: matches.string as Validator<unknown, DataChannelType>,
    sctpStreamParameters: matches.object,
    appData: matches.object as Validator<unknown, any>,
    protocol: matches.string
  })

  static consumerClosed = defineAction({
    type: 'ee.engine.network.mediasoup.DATA_CLOSED_CONSUMER',
    consumerID: matches.string
  })
}

export const MediasoupDataProducersConsumersObjectsState = defineState({
  name: 'ee.engine.network.mediasoup.MediasoupDataProducersAndConsumersObjectsState',

  initial: {
    producers: {} as Record<string, any>,
    consumers: {} as Record<string, any>
  }
})

export const MediasoupDataProducerConsumerState = defineState({
  name: 'ee.engine.network.mediasoup.DataProducerConsumerState',

  initial: {} as Record<
    InstanceID,
    {
      producers: {
        [producerID: string]: {
          producerID: string
          transportID: string
          protocol: string
          sctpStreamParameters: any
          dataChannel: DataChannelType
          appData: any
        }
      }
      consumers: {
        [consumerID: string]: {
          consumerID: string
          transportID: string
          dataChannel: DataChannelType
          sctpStreamParameters: any
          appData: any
          protocol: string
        }
      }
    }
  >,

  getProducerByPeer: (networkID: InstanceID, peerID: string) => {
    const state = getState(MediasoupDataProducerConsumerState)[networkID]
    if (!state) return

    const producer = Object.values(state.producers).find((p) => p.appData.peerID === peerID)
    if (!producer) return

    return getState(MediasoupDataProducersConsumersObjectsState).producers[producer.producerID]
  },

  getProducerByDataChannel: (networkID: InstanceID, dataChannel: DataChannelType) => {
    const state = getState(MediasoupDataProducerConsumerState)[networkID]
    if (!state) return

    const producer = Object.values(state.producers).find((p) => p.dataChannel === dataChannel)
    if (!producer) return

    return getState(MediasoupDataProducersConsumersObjectsState).producers[producer.producerID]
  },

  receptors: {
    onProducerCreate: MediasoupDataProducerActions.producerCreated.receive((action) => {
      const state = getMutableState(MediasoupDataProducerConsumerState)
      const networkID = action.$network as InstanceID
      if (!state.value[networkID]) {
        state.merge({ [networkID]: { producers: {}, consumers: {} } })
      }
      state[networkID].producers.merge({
        [action.producerID]: {
          producerID: action.producerID,
          transportID: action.transportID,
          protocol: action.protocol,
          sctpStreamParameters: action.sctpStreamParameters as any,
          dataChannel: action.dataChannel,
          appData: action.appData as any
        }
      })
    }),

    onProducerClosed: MediasoupDataProducerActions.producerClosed.receive((action) => {
      const state = getMutableState(MediasoupDataProducerConsumerState)
      const networkID = action.$network as InstanceID
      if (!state.value[networkID]) return
      state[networkID].producers[action.producerID].set(none)
      if (!state[networkID].producers.keys.length && !state[networkID].consumers.keys.length) {
        state[networkID].set(none)
      }
    }),

    onConsumerCreated: MediasoupDataConsumerActions.consumerCreated.receive((action) => {
      const state = getMutableState(MediasoupDataProducerConsumerState)
      const networkID = action.$network as InstanceID
      if (!state.value[networkID]) {
        state.merge({ [networkID]: { producers: {}, consumers: {} } })
      }
      state[networkID].consumers.merge({
        [action.consumerID]: {
          consumerID: action.consumerID,
          transportID: action.transportID,
          dataChannel: action.dataChannel,
          sctpStreamParameters: action.sctpStreamParameters as any,
          appData: action.appData as any,
          protocol: action.protocol
        }
      })
    }),

    onConsumerClosed: MediasoupDataConsumerActions.consumerClosed.receive((action) => {
      const state = getMutableState(MediasoupDataProducerConsumerState)
      const networkID = action.$network as InstanceID
      if (!state.value[networkID]) return
      state[networkID].consumers[action.consumerID].set(none)
      if (!state[networkID].consumers.keys.length && !state[networkID].consumers.keys.length) {
        state[networkID].set(none)
      }
    })
  }
})
