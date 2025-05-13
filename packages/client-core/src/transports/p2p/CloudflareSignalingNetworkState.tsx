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

import multiLogger from '@ir-engine/common/src/logger'
import { ChannelID, LocationID } from '@ir-engine/common/src/schema.type.module'
import { Engine } from '@ir-engine/ecs'
import { MediaSettingsState } from '@ir-engine/engine/src/audio/MediaSettingsState'
import {
  ErrorBoundary,
  InstanceID,
  PeerID,
  Topic,
  UserID,
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  none,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'
import {
  NetworkActions,
  NetworkState,
  NetworkTopics,
  WebRTCPeerConnection,
  addNetwork,
  createNetwork,
  removeNetwork
} from '@ir-engine/network'
import { MediaStreamState } from '@ir-engine/network/src/media/MediaStreamState'
import {
  MessageTypes,
  SendMessageType,
  StunServerState,
  WebRTCTransportFunctions
} from '@ir-engine/network/src/webrtc/WebRTCTransportFunctions'
import React, { Suspense, useEffect } from 'react'
import { CloudflareSignalingTransport } from './CloudflareSignalingTransport'

const logger = multiLogger.child({ component: 'CloudflareSignalingNetworkState' })

type InstanceType = {
  id: InstanceID
  locationId?: LocationID
  channelId?: ChannelID
  workerUrl: string
}

type ConnectedPeer = {
  peerID: PeerID
  userID: UserID
  peerIndex: number
}

export const CloudflareSignalingNetworkState = defineState({
  name: 'ir.client.transport.p2p.CloudflareSignalingNetworkState',
  initial: {} as { [id: InstanceID]: InstanceType },

  connectToCloudflareInstance: (instance: InstanceType) => {
    getMutableState(CloudflareSignalingNetworkState)[instance.id].set(instance)

    return () => {
      getMutableState(CloudflareSignalingNetworkState)[instance.id].set(none)
    }
  },

  reactor: () => {
    const state = useMutableState(CloudflareSignalingNetworkState)

    return (
      <>
        {Object.values(state.value).map((instance) => (
          <ErrorBoundary key={instance.id}>
            <Suspense>
              <ConnectionReactor
                key={instance.id}
                instanceID={instance.id}
                workerUrl={instance.workerUrl}
                topic={instance.locationId ? NetworkTopics.world : NetworkTopics.media}
              />
            </Suspense>
          </ErrorBoundary>
        ))}
      </>
    )
  }
})

/**
 * Manages the connection to a Cloudflare signaling instance
 */
const ConnectionReactor = (props: { instanceID: InstanceID; workerUrl: string; topic: Topic }) => {
  const { instanceID, workerUrl, topic } = props
  const iceServers = useHookstate<RTCIceServer[]>([])
  const transport = useHookstate<CloudflareSignalingTransport | null>(null)
  const connectedPeers = useHookstate<Record<PeerID, ConnectedPeer>>({})

  useEffect(() => {
    // Set up STUN/TURN servers
    const stunServers = [{ urls: 'stun:stun1.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478' }]

    const turnServers = [
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ]

    // Combine STUN and TURN servers
    iceServers.set([...stunServers, ...turnServers])

    // Set up the network
    getMutableState(NetworkState).hostIds[topic].set(instanceID)

    const network = createNetwork(instanceID, null, topic, {})
    addNetwork(network)

    network.ready = true

    // Create the transport
    const signalingTransport = new CloudflareSignalingTransport(
      instanceID,
      (peerID, userID, peerIndex) => {
        // Peer connected
        connectedPeers[peerID].set({ peerID, userID, peerIndex })

        dispatchAction(
          NetworkActions.peerJoined({
            $network: network.id,
            $topic: network.topic,
            $to: Engine.instance.store.peerID,
            peerID,
            peerIndex,
            userID
          })
        )
      },
      (peerID) => {
        // Peer disconnected
        connectedPeers[peerID].set(none)

        dispatchAction(
          NetworkActions.peerLeft({
            $network: network.id,
            $topic: network.topic,
            $to: Engine.instance.store.peerID,
            peerID,
            userID: ''
          })
        )
      },
      (fromPeerID, message) => {
        // Message received
        WebRTCTransportFunctions.onMessage(sendMessage, instanceID, fromPeerID, message)
      },
      {
        workerUrl
      }
    )

    transport.set(signalingTransport)

    // Set ICE servers in global state
    getMutableState(StunServerState).set(iceServers.value)

    // Announce ourselves
    dispatchAction(
      NetworkActions.peerJoined({
        $network: network.id,
        $topic: network.topic,
        $to: Engine.instance.store.peerID,
        peerID: Engine.instance.store.peerID,
        peerIndex: 0,
        userID: Engine.instance.userID
      })
    )

    return () => {
      // Clean up
      if (transport.value) {
        transport.value.destroy()
      }

      dispatchAction(
        NetworkActions.peerLeft({
          $network: network.id,
          $topic: network.topic,
          $to: Engine.instance.store.peerID,
          peerID: Engine.instance.store.peerID,
          userID: Engine.instance.userID
        })
      )

      removeNetwork(network)
      getMutableState(NetworkState).hostIds[topic].set(none)
    }
  }, [])

  // Function to send messages through the transport
  const sendMessage: SendMessageType = (networkID: InstanceID, targetPeerID: PeerID, message: MessageTypes) => {
    if (transport.value) {
      transport.value.sendMessage(targetPeerID, message)
    }
  }

  return (
    <>
      {Object.values(connectedPeers.value).map((peer) => (
        <ErrorBoundary key={peer.peerID}>
          <Suspense>
            <PeerReactor
              key={peer.peerID}
              peerID={peer.peerID}
              peerIndex={peer.peerIndex}
              userID={peer.userID}
              instanceID={props.instanceID}
              sendMessage={sendMessage}
            />
          </Suspense>
        </ErrorBoundary>
      ))}
    </>
  )
}

/**
 * Manages a connection to a specific peer
 */
const PeerReactor = (props: {
  peerID: PeerID
  peerIndex: number
  userID: UserID
  instanceID: InstanceID
  sendMessage: SendMessageType
}) => {
  const { peerID, peerIndex, userID, instanceID, sendMessage } = props
  const network = getState(NetworkState).networks[instanceID]

  const immersiveMedia = useMutableState(MediaSettingsState).immersiveMedia.value
  const maxResolution = useMutableState(MediaStreamState).maxResolution.value

  return (
    <WebRTCPeerConnection
      network={network}
      peerID={peerID}
      peerIndex={peerIndex}
      userID={userID}
      sendMessage={sendMessage}
      maxResolution={maxResolution}
      isPiP={immersiveMedia}
    />
  )
}
