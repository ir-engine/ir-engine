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

import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import {
  State,
  addActionReceptor,
  defineActionQueue,
  getMutableState,
  getState,
  removeActionReceptor,
  useHookstate
} from '@etherealengine/hyperflux'

import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { MediaConsumerActions } from '@etherealengine/engine/src/networking/systems/MediaProducerConsumerState'
import { NetworkTransportActions } from '@etherealengine/engine/src/networking/systems/NetworkTransportState'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import { LocationInstanceConnectionServiceReceptor } from '../common/services/LocationInstanceConnectionService'
import { MediaInstanceConnectionServiceReceptor } from '../common/services/MediaInstanceConnectionService'
import { PeerMediaConsumers } from '../media/PeerMedia'
import { FriendServiceReceptor } from '../social/services/FriendService'
import {
  SocketWebRTCClientNetwork,
  onConnectToInstance,
  onTransportCreated,
  receiveConsumerHandler
} from '../transports/SocketWebRTCClientFunctions'
import { DataChannelSystem } from './DataChannelSystem'
import { InstanceProvisioning } from './NetworkInstanceProvisioning'

const consumerCreatedQueue = defineActionQueue(MediaConsumerActions.consumerCreated.matches)
const transportCreatedActionQueue = defineActionQueue(NetworkTransportActions.transportCreated.matches)

const execute = () => {
  for (const action of consumerCreatedQueue()) receiveConsumerHandler(action)
  for (const action of transportCreatedActionQueue()) onTransportCreated(action)
}

const NetworkConnectionReactor = (props: { networkID: UserID }) => {
  const networkState = getMutableState(NetworkState).networks[props.networkID] as State<SocketWebRTCClientNetwork>
  const networkConnected = useHookstate(networkState.connected)
  const recvTransport = useHookstate(networkState.recvTransport)
  const sendTransport = useHookstate(networkState.sendTransport)

  useEffect(() => {
    const network = getState(NetworkState).networks[props.networkID] as SocketWebRTCClientNetwork

    if (networkConnected.value) {
      onConnectToInstance(network)
    }
  }, [networkConnected])

  useEffect(() => {
    networkState.ready.set(!!recvTransport.value && !!sendTransport.value)
  }, [recvTransport, sendTransport])

  return null
}

const reactor = () => {
  useEffect(() => {
    addActionReceptor(LocationInstanceConnectionServiceReceptor)
    addActionReceptor(MediaInstanceConnectionServiceReceptor)
    addActionReceptor(FriendServiceReceptor)

    return () => {
      // todo replace with subsystems
      removeActionReceptor(LocationInstanceConnectionServiceReceptor)
      removeActionReceptor(MediaInstanceConnectionServiceReceptor)
      removeActionReceptor(FriendServiceReceptor)
    }
  }, [])

  const networkIDs = Object.keys(useHookstate(getMutableState(NetworkState).networks).value)

  return (
    <>
      {networkIDs.map((hostId: UserID) => (
        <NetworkConnectionReactor key={hostId} networkID={hostId} />
      ))}
      <PeerMediaConsumers />
      <InstanceProvisioning />
    </>
  )
}

export const ClientNetworkingSystem = defineSystem({
  uuid: 'ee.client.ClientNetworkingSystem',
  execute,
  reactor,
  subSystems: [DataChannelSystem]
})
