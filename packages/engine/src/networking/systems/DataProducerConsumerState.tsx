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
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
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
import { Network } from '../classes/Network'

export class DataProducerActions {
  static requestProducer = defineAction({
    type: 'ee.engine.network.DATA_REQUEST_PRODUCER',
    requestID: matches.string,
    transportId: matches.string,
    protocol: matches.string,
    sctpStreamParameters: matches.object as Validator<unknown, any>,
    label: matches.string as Validator<unknown, DataChannelType>,
    appData: matches.object as Validator<unknown, any>
  })

  static requestProducerError = defineAction({
    type: 'ee.engine.network.DATA_REQUEST_PRODUCER_ERROR',
    requestID: matches.string,
    error: matches.string
  })

  static producerCreated = defineAction({
    type: 'ee.engine.network.DATA_PRODUCER_CREATED',
    requestID: matches.string,
    producerID: matches.string,
    transportId: matches.string,
    protocol: matches.string,
    sctpStreamParameters: matches.object as Validator<unknown, any>,
    label: matches.string as Validator<unknown, DataChannelType>,
    appData: matches.object as Validator<unknown, any>,
    $cache: true
  })

  static closeProducer = defineAction({
    type: 'ee.engine.network.DATA_CLOSED_PRODUCER',
    producerID: matches.string,
    $cache: true
  })
}

export class DataConsumerActions {
  static requestConsumer = defineAction({
    type: 'ee.engine.network.DATA_REQUEST_CONSUMER',
    peerID: matchesPeerID,
    channelType: matches.string as Validator<unknown, DataChannelType>
  })

  static consumerCreated = defineAction({
    type: 'ee.engine.network.DATA_CREATED_CONSUMER',
    consumerID: matches.string,
    peerID: matchesPeerID,
    producerID: matches.string,
    label: matches.string,
    sctpStreamParameters: matches.object,
    appData: matches.object as Validator<unknown, any>,
    protocol: matches.string
  })

  static closeConsumer = defineAction({
    type: 'ee.engine.network.DATA_CLOSED_CONSUMER',
    consumerID: matches.string
  })
}

export const DataProducerConsumerState = defineState({
  name: 'ee.engine.network.DataProducerConsumerState',

  initial: {} as Record<
    UserID, // NetworkID
    {
      producers: {
        [producerID: string]: {
          transportId: string
          protocol: string
          sctpStreamParameters: any
          label: string
          appData: any
        }
      }
      consumers: {
        [consumerID: string]: {
          label: string
          sctpStreamParameters: any
          appData: any
          protocol: string
        }
      }
    }
  >,

  // TODO: support multiple networks
  receptors: [
    [
      DataProducerActions.producerCreated,
      (state, action: typeof DataProducerActions.producerCreated.matches._TYPE) => {
        const hostId = Engine.instance.worldNetwork.hostId
        if (!state.value[hostId]) {
          state.merge({ [hostId]: { producers: {}, consumers: {} } })
        }
        state[hostId].producers.merge({
          [action.producerID]: {
            transportId: action.transportId,
            protocol: action.protocol,
            sctpStreamParameters: action.sctpStreamParameters as any,
            label: action.label,
            appData: action.appData as any
          }
        })
      }
    ],
    [
      DataProducerActions.closeProducer,
      (state, action: typeof DataProducerActions.closeProducer.matches._TYPE) => {
        const hostId = Engine.instance.worldNetwork.hostId
        if (!state.value[hostId]) return

        state[hostId].producers[action.producerID].set(none)

        if (!Object.keys(state[hostId].producers).length && !Object.keys(state[hostId].consumers).length) {
          state[hostId].set(none)
        }
      }
    ],
    [
      DataConsumerActions.consumerCreated,
      (state, action: typeof DataConsumerActions.consumerCreated.matches._TYPE) => {
        const hostId = Engine.instance.worldNetwork.hostId
        if (!state.value[hostId]) {
          state.merge({ [hostId]: { producers: {}, consumers: {} } })
        }
        state[hostId].consumers.merge({
          [action.consumerID]: {
            label: action.label,
            sctpStreamParameters: action.sctpStreamParameters as any,
            appData: action.appData as any,
            protocol: action.protocol
          }
        })
      }
    ],
    [
      DataConsumerActions.closeConsumer,
      (state, action: typeof DataConsumerActions.closeConsumer.matches._TYPE) => {
        const hostId = Engine.instance.worldNetwork.hostId
        if (!state.value[hostId]) return

        state[hostId].consumers[action.consumerID].set(none)

        if (!Object.keys(state[hostId].consumers).length && !Object.keys(state[hostId].consumers).length) {
          state[hostId].set(none)
        }
      }
    ]
  ]
})

type RegistryFunction = (network: Network, dataChannel: DataChannelType, fromPeerID: PeerID, message: any) => void

export const DataChannelRegistryState = defineState({
  name: 'ee.engine.network.DataChannelRegistryState',
  initial: {} as Record<DataChannelType, RegistryFunction[]>
})

export const addDataChannelHandler = (dataChannelType: DataChannelType, handler: RegistryFunction) => {
  if (!getState(DataChannelRegistryState)[dataChannelType]) {
    getMutableState(DataChannelRegistryState).merge({ [dataChannelType]: [] })
  }
  getState(DataChannelRegistryState)[dataChannelType].push(handler)
}

export const removeDataChannelHandler = (dataChannelType: DataChannelType, handler: RegistryFunction) => {
  if (!getState(DataChannelRegistryState)[dataChannelType]) return

  const index = getState(DataChannelRegistryState)[dataChannelType].indexOf(handler)
  if (index === -1) return

  getState(DataChannelRegistryState)[dataChannelType].splice(index, 1)

  if (getState(DataChannelRegistryState)[dataChannelType].length === 0) {
    getMutableState(DataChannelRegistryState)[dataChannelType].set(none)
  }
}

const execute = () => {
  receiveActions(DataProducerConsumerState)
}

export const NetworkProducer = (props: { networkID: UserID; producerID: string }) => {
  const { networkID, producerID } = props
  const producerState = useHookstate(getMutableState(DataProducerConsumerState)[networkID].producers[producerID])
  const networkState = useHookstate(getMutableState(NetworkState).networks[networkID])
  const networkProducerState = networkState.producers.find((p) => p.value.id === producerID)

  useEffect(() => {
    const network = getState(NetworkState).networks[networkID]
  }, [])

  return <></>
}

export const NetworkConsumer = (props: { networkID: UserID; consumerID: string }) => {
  const { networkID, consumerID } = props
  const consumerState = useHookstate(getMutableState(DataProducerConsumerState)[networkID].consumers[consumerID])
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
    }
  }, [])

  return <></>
}

const NetworkReactor = (props: { networkID: UserID }) => {
  const { networkID } = props
  const producers = useHookstate(getMutableState(DataProducerConsumerState)[networkID].producers)
  const consumers = useHookstate(getMutableState(DataProducerConsumerState)[networkID].consumers)

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
  const networkIDs = useHookstate(getMutableState(DataProducerConsumerState))
  return (
    <>
      {Object.keys(networkIDs.value).map((hostId: UserID) => (
        <NetworkReactor key={hostId} networkID={hostId} />
      ))}
    </>
  )
}

export const DataProducerConsumerStateSystem = defineSystem({
  uuid: 'ee.engine.DataProducerConsumerStateSystem',
  execute,
  reactor
})
