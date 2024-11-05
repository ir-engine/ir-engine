/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useEffect, useLayoutEffect } from 'react'

import { InstanceID } from '@ir-engine/common/src/schema.type.module'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getMutableState, getState, useHookstate, useMutableState } from '@ir-engine/hyperflux'

import '@ir-engine/common/src/transports/mediasoup/MediasoupDataProducerConsumerState'
import '@ir-engine/common/src/transports/mediasoup/MediasoupMediaProducerConsumerState'
import '@ir-engine/common/src/transports/mediasoup/MediasoupTransportState'

import { NetworkState } from '@ir-engine/network'

import {
  MediasoupTransportObjectsState,
  MediasoupTransportState
} from '@ir-engine/common/src/transports/mediasoup/MediasoupTransportState'
import { WebRTCTransportExtension, onTransportCreated } from './MediasoupClientFunctions'

const TransportReactor = (props: { transportID: string; networkID: InstanceID }) => {
  useEffect(() => {
    const transport = getState(MediasoupTransportState)[props.networkID][props.transportID]
    onTransportCreated(props.networkID, transport)
  }, [])
  return null
}

const NetworkConnectionReactor = (props: { networkID: InstanceID }) => {
  const transportState = useMutableState(MediasoupTransportState)[props.networkID]
  const transportObjectState = useMutableState(MediasoupTransportObjectsState)
  const networkState = useMutableState(NetworkState).networks[props.networkID]

  useLayoutEffect(() => {
    /** @todo in future we will have a better way of determining whether we need to connect to a server or not */
    if (!networkState.value.hostPeerID) return

    const topic = networkState.topic.value
    const topicEnabled = getState(NetworkState).config[topic]
    if (topicEnabled) {
      const sendTransport = MediasoupTransportState.getTransport(props.networkID, 'send') as WebRTCTransportExtension
      const recvTransport = MediasoupTransportState.getTransport(props.networkID, 'recv') as WebRTCTransportExtension
      networkState.ready.set(!!recvTransport && !!sendTransport)
    } else {
      networkState.ready.set(true)
    }
  }, [transportObjectState, networkState])

  return (
    <>
      {transportState.keys?.map((transportID: string) => (
        <TransportReactor key={transportID} transportID={transportID} networkID={props.networkID} />
      ))}
    </>
  )
}

const reactor = () => {
  const networkConfig = useHookstate(getMutableState(NetworkState).config)
  const isOnline = networkConfig.world.value || networkConfig.media.value
  const networkIDs = Object.keys(useHookstate(getMutableState(NetworkState).networks).value)

  /** @todo - instead of checking for network config, we should filter NetworkConnectionReactor by networks with a "real" transport */
  if (!isOnline) return null

  return (
    <>
      {networkIDs
        .filter((networkID: InstanceID) => getState(NetworkState).networks[networkID].hostPeerID)
        .map((id: InstanceID) => (
          <NetworkConnectionReactor key={id} networkID={id} />
        ))}
    </>
  )
}

export const MediasoupTransportSystem = defineSystem({
  uuid: 'ee.client.MediasoupTransportSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
