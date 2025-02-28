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

import { API, useFind, useGet } from '@ir-engine/common'
import { IceServer } from '@ir-engine/common/src/constants/DefaultWebRTCSettings'
import {
  InstanceAttendanceType,
  InstanceID,
  clientSettingPath,
  instanceAttendancePath,
  instancePath,
  instanceSignalingPath
} from '@ir-engine/common/src/schema.type.module'
import { toDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import { Engine } from '@ir-engine/ecs'
import { MediaSettingsState } from '@ir-engine/engine/src/audio/MediaSettingsState'
import {
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
import {
  MessageTypes,
  SendMessageType,
  StunServerState,
  WebRTCTransportFunctions
} from '@ir-engine/network/src/webrtc/WebRTCTransportFunctions'
import React, { useEffect } from 'react'

export const PeerToPeerNetworkState = defineState({
  name: 'ir.client.transport.p2p.PeerToPeerNetworkState',
  initial: () => ({}) as { [id: InstanceID]: object },
  connectToP2PInstance: (id: InstanceID) => {
    getMutableState(PeerToPeerNetworkState)[id].set({})

    return () => {
      getMutableState(PeerToPeerNetworkState)[id].set(none)
    }
  },

  reactor: () => {
    const state = useMutableState(PeerToPeerNetworkState)

    return (
      <>
        {state.keys.map((id: InstanceID) => (
          <NetworkReactor key={id} id={id} />
        ))}
      </>
    )
  }
})

const NetworkReactor = (props: { id: InstanceID }) => {
  const instance = useGet(instancePath, props.id)
  if (!instance.data) return null

  return (
    <ConnectionReactor
      instanceID={instance.data.id}
      topic={instance.data.locationId ? NetworkTopics.world : NetworkTopics.media}
    />
  )
}

const ConnectionReactor = (props: { instanceID: InstanceID; topic: Topic }) => {
  const instanceID = props.instanceID
  const joinResponse = useHookstate<null | { index: number; iceServers: IceServer[] }>(null)

  useEffect(() => {
    const abortController = new AbortController()

    API.instance
      .service(instanceSignalingPath)
      .create({ instanceID })
      .then((response) => {
        if (abortController.signal.aborted) return

        /** @todo it's probably fine that we override this every time we connect to a new server, but we should maybe handle this smarter */
        getMutableState(StunServerState).set(response.iceServers)

        joinResponse.set(response)
      })

    return () => {
      abortController.abort()
    }
  }, [])

  useEffect(() => {
    if (!joinResponse.value) return

    const topic = props.topic

    getMutableState(NetworkState).hostIds[topic].set(instanceID)

    const network = createNetwork(instanceID, null, topic, {})
    addNetwork(network)

    network.ready = true

    /** heartbeat */
    const heartbeat = setInterval(() => {
      API.instance.service(instanceSignalingPath).get({ instanceID })
    }, 5000)

    dispatchAction(
      NetworkActions.peerJoined({
        $network: network.id,
        $topic: network.topic,
        $to: Engine.instance.store.peerID,
        peerID: Engine.instance.store.peerID,
        peerIndex: joinResponse.value.index,
        userID: Engine.instance.userID
      })
    )

    return () => {
      clearInterval(heartbeat)
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
  }, [joinResponse])

  if (!joinResponse.value) return null

  return <PeersReactor instanceID={props.instanceID} />
}

const PeersReactor = (props: { instanceID: InstanceID }) => {
  const instanceAttendanceQuery = useFind(instanceAttendancePath, {
    query: {
      instanceId: props.instanceID,
      ended: false,
      updatedAt: {
        // Only consider instances that have been updated in the last 10 seconds
        $gt: toDateTimeSql(new Date(new Date().getTime() - 10000))
      }
    }
  })

  useEffect(() => {
    const interval = setInterval(() => {
      instanceAttendanceQuery.refetch()
    }, 5000)
    return () => {
      clearInterval(interval)
    }
  }, [])

  const otherPeers = useHookstate<InstanceAttendanceType[]>([])

  useEffect(() => {
    if (instanceAttendanceQuery.status === 'success') {
      otherPeers.set(instanceAttendanceQuery.data.filter((peer) => peer.peerId !== Engine.instance.store.peerID))
    }
  }, [instanceAttendanceQuery.status])

  return (
    <>
      {otherPeers.value.map((peer) => (
        <PeerReactor
          key={peer.peerId}
          peerID={peer.peerId}
          peerIndex={peer.peerIndex}
          userID={peer.userId}
          instanceID={props.instanceID}
        />
      ))}
    </>
  )
}

const sendMessage: SendMessageType = (instanceID: InstanceID, toPeerID: PeerID, message: MessageTypes) => {
  // console.log('sendMessage', instanceID, toPeerID, message)
  API.instance.service(instanceSignalingPath).patch(null, {
    instanceID,
    targetPeerID: toPeerID,
    message
  })
}

const PeerReactor = (props: { peerID: PeerID; peerIndex: number; userID: UserID; instanceID: InstanceID }) => {
  const network = getState(NetworkState).networks[props.instanceID]

  useEffect(() => {
    API.instance.service(instanceSignalingPath).on('patched', (data) => {
      // need to ignore messages from self
      if (data.fromPeerID !== props.peerID) return
      if (data.targetPeerID !== Engine.instance.store.peerID) return
      if (data.instanceID !== network.id) return

      WebRTCTransportFunctions.onMessage(sendMessage, data.instanceID, props.peerID, data.message)
    })
  }, [])

  const clientSettingQuery = useFind(clientSettingPath)
  const clientSetting = clientSettingQuery.data[0]

  const { maxResolution } = clientSetting.mediaSettings.video

  const immersiveMedia = useMutableState(MediaSettingsState).immersiveMedia.value

  return (
    <WebRTCPeerConnection
      network={network}
      peerID={props.peerID}
      peerIndex={props.peerIndex}
      userID={props.userID}
      sendMessage={sendMessage}
      maxResolution={maxResolution}
      isPiP={immersiveMedia}
    />
  )
}
