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

import { DataChannelType } from '@etherealengine/common/src/interfaces/DataChannelType'
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
import { Engine } from '../../ecs/classes/Engine'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { UserID } from '../../schemas/user/user.schema'
import { NetworkState } from '../NetworkState'

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

export const MediasoupDataProducerConsumerState = defineState({
  name: 'ee.engine.network.mediasoup.DataProducerConsumerState',

  initial: {} as Record<
    string, // NetworkID
    {
      producers: {
        [producerID: string]: {
          producer?: unknown // TODO make common type interface
          producerID: string
          transportId: string
          protocol: string
          sctpStreamParameters: any
          dataChannel: DataChannelType
          appData: any
        }
      }
      consumers: {
        [consumerID: string]: {
          consumer?: unknown // TODO make common type interface
          consumerID: string
          dataChannel: DataChannelType
          sctpStreamParameters: any
          appData: any
          protocol: string
        }
      }
    }
  >,

  getProducerByPeer: (networkID: string, peerID: string) => {
    const state = getState(MediasoupDataProducerConsumerState)[networkID]
    if (!state) return

    const producer = Object.values(state.producers).find((p) => p.appData.peerID === peerID)
    if (!producer) return

    return producer.producer
  },

  getProducerByDataChannel: (networkID: string, dataChannel: DataChannelType) => {
    const state = getState(MediasoupDataProducerConsumerState)[networkID]
    if (!state) return

    const producer = Object.values(state.producers).find((p) => p.dataChannel === dataChannel)
    if (!producer) return

    return producer.producer
  },

  receptors: [
    [
      MediasoupDataProducerActions.producerCreated,
      (state, action: typeof MediasoupDataProducerActions.producerCreated.matches._TYPE) => {
        const networkID = action.$network
        if (!state.value[networkID]) {
          state.merge({ [networkID]: { producers: {}, consumers: {} } })
        }
        state[networkID].producers.merge({
          [action.producerID]: {
            producerID: action.producerID,
            transportId: action.transportID,
            protocol: action.protocol,
            sctpStreamParameters: action.sctpStreamParameters as any,
            dataChannel: action.dataChannel,
            appData: action.appData as any
          }
        })
      }
    ],
    [
      MediasoupDataProducerActions.producerClosed,
      (state, action: typeof MediasoupDataProducerActions.producerClosed.matches._TYPE) => {
        // removed create/close cached actions for this producer
        const cachedActions = Engine.instance.store.actions.cached
        const peerCachedActions = cachedActions.filter(
          (cachedAction) =>
            (MediasoupDataProducerActions.producerCreated.matches.test(cachedAction) ||
              MediasoupDataProducerActions.producerClosed.matches.test(cachedAction)) &&
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
      MediasoupDataConsumerActions.consumerCreated,
      (state, action: typeof MediasoupDataConsumerActions.consumerCreated.matches._TYPE) => {
        const networkID = action.$network
        if (!state.value[networkID]) {
          state.merge({ [networkID]: { producers: {}, consumers: {} } })
        }
        state[networkID].consumers.merge({
          [action.consumerID]: {
            consumerID: action.consumerID,
            dataChannel: action.dataChannel,
            sctpStreamParameters: action.sctpStreamParameters as any,
            appData: action.appData as any,
            protocol: action.protocol
          }
        })
      }
    ],
    [
      MediasoupDataConsumerActions.consumerClosed,
      (state, action: typeof MediasoupDataConsumerActions.consumerClosed.matches._TYPE) => {
        const networkID = action.$network
        if (!state.value[networkID]) return

        state[networkID].consumers[action.consumerID].set(none)

        if (!Object.keys(state[networkID].consumers).length && !Object.keys(state[networkID].consumers).length) {
          state[networkID].set(none)
        }
      }
    ]
  ]
})

const execute = () => {
  receiveActions(MediasoupDataProducerConsumerState)
}

// export const NetworkProducer = (props: { networkID: UserID; producerID: string }) => {
//   const { networkID, producerID } = props
//   const producerState = useHookstate(getMutableState(DataProducerConsumerState)[networkID].producers[producerID])
//   const networkState = useHookstate(getMutableState(NetworkState).networks[networkID])
//   const networkProducerState = networkState.producers.find((p) => p.value.id === producerID)

//   useEffect(() => {
//     const network = getState(NetworkState).networks[networkID]
//   }, [])

//   return <></>
// }

export const NetworkConsumer = (props: { networkID: UserID; consumerID: string }) => {
  const { networkID, consumerID } = props
  const networkState = useHookstate(getMutableState(NetworkState).networks[networkID])

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
    }
  }, [])

  return <></>
}

const NetworkReactor = (props: { networkID: UserID }) => {
  const { networkID } = props
  const producers = useHookstate(getMutableState(MediasoupDataProducerConsumerState)[networkID].producers)
  const consumers = useHookstate(getMutableState(MediasoupDataProducerConsumerState)[networkID].consumers)

  return (
    <>
      {/* {Object.keys(producers.value).map((producerID: string) => (
        <NetworkProducer key={producerID} producerID={producerID} networkID={networkID} />
      ))} */}
      {Object.keys(consumers.value).map((consumerID: string) => (
        <NetworkConsumer key={consumerID} consumerID={consumerID} networkID={networkID} />
      ))}
    </>
  )
}

const reactor = () => {
  const networkIDs = useHookstate(getMutableState(MediasoupDataProducerConsumerState))
  return (
    <>
      {Object.keys(networkIDs.value).map((hostId: UserID) => (
        <NetworkReactor key={hostId} networkID={hostId} />
      ))}
    </>
  )
}

export const MediasoupDataProducerConsumerStateSystem = defineSystem({
  uuid: 'ee.engine.network.MediasoupDataProducerConsumerStateSystem',
  execute,
  reactor
})
