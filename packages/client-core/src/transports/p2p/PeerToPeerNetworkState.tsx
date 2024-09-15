import { API, useFind, useGet } from '@ir-engine/common'
import {
  InstanceAttendanceType,
  InstanceID,
  InstanceType,
  instanceAttendancePath,
  instancePath,
  instanceSignalingPath
} from '@ir-engine/common/src/schema.type.module'
import { toDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import { Engine } from '@ir-engine/ecs'
import {
  PeerID,
  UserID,
  defineState,
  getMutableState,
  getState,
  none,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'
import {
  DataChannelRegistryState,
  DataChannelType,
  NetworkPeerFunctions,
  NetworkState,
  NetworkTopics,
  addNetwork,
  createNetwork,
  removeNetwork
} from '@ir-engine/network'
import {
  MessageTypes,
  RTCPeerConnectionState,
  SendMessageType,
  WebRTCTransportFunctions
} from '@ir-engine/network/src/webrtc/WebRTCTransportFunctions'
import { decode, encode } from 'msgpackr'
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

  return <ConnectionReactor instance={instance.data} />
}

const ConnectionReactor = (props: { instance: InstanceType }) => {
  const instanceID = props.instance.id
  const instanceAttendanceQuery = useFind(instanceAttendancePath, {
    query: {
      instanceId: instanceID,
      ended: false,
      updatedAt: {
        // Only consider instances that have been updated in the last 10 seconds
        $gt: toDateTimeSql(new Date(new Date().getTime() - 10000))
      }
    }
  })

  const joinResponse = useHookstate<null | { index: number }>(null)

  useEffect(() => {
    API.instance
      .service(instanceSignalingPath)
      .create({ instanceID })
      .then((response) => {
        joinResponse.set(response)
      })
  }, [])

  useEffect(() => {
    if (!joinResponse.value) return

    const topic = props.instance.locationId ? NetworkTopics.world : NetworkTopics.media

    getMutableState(NetworkState).hostIds[topic].set(instanceID)

    const network = createNetwork(instanceID, null, topic, {})
    addNetwork(network)

    network.ready = true

    /** heartbeat */
    setInterval(() => {
      API.instance.service(instanceSignalingPath).get({ instanceID })
    }, 5000)

    NetworkPeerFunctions.createPeer(
      network,
      Engine.instance.store.peerID,
      joinResponse.value.index,
      Engine.instance.store.userID
    )

    return () => {
      NetworkPeerFunctions.destroyPeer(network, Engine.instance.store.peerID)
      removeNetwork(network)
      getMutableState(NetworkState).hostIds[topic].set(none)
    }
  }, [joinResponse])

  const otherPeers = useHookstate<InstanceAttendanceType[]>([])

  useEffect(() => {
    if (instanceAttendanceQuery.status === 'success') {
      otherPeers.set(instanceAttendanceQuery.data.filter((peer) => peer.peerId !== Engine.instance.store.peerID))
    }
  }, [instanceAttendanceQuery.status])

  if (!joinResponse.value) return null

  return (
    <>
      {otherPeers.value.map((peer) => (
        <PeerReactor
          key={peer.peerId}
          peerID={peer.peerId}
          peerIndex={peer.peerIndex}
          userID={peer.userId}
          instanceID={instanceID}
        />
      ))}
    </>
  )
}

const sendMessage: SendMessageType = (instanceID: InstanceID, toPeerID: PeerID, message: MessageTypes) => {
  console.log('[PeerToPeerNetworkState] sendMessage', toPeerID, message)
  API.instance.service(instanceSignalingPath).patch(null, {
    instanceID,
    targetPeerID: toPeerID,
    message
  })
}

const PeerReactor = (props: { peerID: PeerID; peerIndex: number; userID: UserID; instanceID: InstanceID }) => {
  useEffect(() => {
    API.instance.service(instanceSignalingPath).on('patched', async (data) => {
      // need to ignore messages from self
      if (data.fromPeerID !== props.peerID) return
      if (data.targetPeerID !== Engine.instance.store.peerID) return

      await WebRTCTransportFunctions.onMessage(sendMessage, props.instanceID, props.peerID, data.message)
    })

    /**
     * We only need one peer to initiate the connection, so do so if the peerID is greater than our own.
     */
    const isInitiator = Engine.instance.store.peerID < props.peerID

    if (isInitiator) {
      WebRTCTransportFunctions.makeCall(sendMessage, props.instanceID, props.peerID)
    }

    return () => {
      WebRTCTransportFunctions.close(props.instanceID, props.peerID)
    }
  }, [])

  const peerConnectionState = useMutableState(RTCPeerConnectionState)[props.instanceID][props.peerID]?.value

  useEffect(() => {
    if (!peerConnectionState || !peerConnectionState.ready || !peerConnectionState.dataChannels['actions']) return

    const dataChannel = peerConnectionState.dataChannels['actions'] as RTCDataChannel

    const network = getState(NetworkState).networks[props.instanceID]

    NetworkPeerFunctions.createPeer(network, props.peerID, props.peerIndex, props.userID)

    const onMessage = (e) => {
      const message = decode(e.data)
      network.onMessage(props.peerID, message)
    }

    dataChannel.addEventListener('message', onMessage)

    const message = (data) => {
      dataChannel.send(encode(data))
    }

    const buffer = (dataChannelType: DataChannelType, data: any) => {
      const dataChannel = peerConnectionState.dataChannels[dataChannelType] as RTCDataChannel
      if (!dataChannel) return
      const fromPeerID = Engine.instance.store.peerID
      const fromPeerIndex = network.peerIDToPeerIndex[fromPeerID]
      if (typeof fromPeerIndex === 'undefined')
        return console.warn('fromPeerIndex is undefined', fromPeerID, fromPeerIndex)
      dataChannel.send(encode([fromPeerIndex, data]))
    }

    network.peers[props.peerID].transport = {
      message,
      buffer
    }

    // once connected, send all our cached actions to the peer
    const selfCachedActions = Engine.instance.store.actions.cached.filter(
      (action) => action.$topic === network.topic && action.$peer === Engine.instance.store.peerID
    )

    network.messageToPeer(props.peerID, selfCachedActions)

    return () => {
      NetworkPeerFunctions.destroyPeer(network, props.peerID)
      dataChannel.removeEventListener('message', onMessage)
    }
  }, [peerConnectionState?.ready, peerConnectionState?.dataChannels?.['actions']])

  const dataChannelRegistry = useMutableState(DataChannelRegistryState).value

  if (!peerConnectionState?.ready) return null

  return (
    <>
      {Object.keys(dataChannelRegistry).map((dataChannelType: DataChannelType) => (
        <DataChannelReactor
          key={dataChannelType}
          instanceID={props.instanceID}
          peerID={props.peerID}
          dataChannelType={dataChannelType}
        />
      ))}
    </>
  )
}

const DataChannelReactor = (props: { instanceID: InstanceID; peerID: PeerID; dataChannelType: DataChannelType }) => {
  const peerConnectionState = useMutableState(RTCPeerConnectionState)[props.instanceID][props.peerID].value
  const dataChannel = peerConnectionState?.dataChannels?.[props.dataChannelType] as RTCDataChannel | undefined

  useEffect(() => {
    const isInitiator = Engine.instance.store.peerID < props.peerID
    if (!isInitiator) return

    WebRTCTransportFunctions.createDataChannel(props.instanceID, props.peerID, props.dataChannelType)
    return () => {
      WebRTCTransportFunctions.closeDataChannel(props.instanceID, props.peerID, props.dataChannelType)
    }
  }, [])

  useEffect(() => {
    console.log('DataChannelReactor',{dataChannel})
    if (!dataChannel) return

    const network = getState(NetworkState).networks[props.instanceID]

    const onBuffer = (e: MessageEvent) => {
      const message = e.data
      const [fromPeerIndex, data] = decode(message)
      const fromPeerID = network.peerIndexToPeerID[fromPeerIndex]
      const dataBuffer = new Uint8Array(data).buffer
      network.onBuffer(dataChannel.label as DataChannelType, fromPeerID, dataBuffer)
    }

    dataChannel.addEventListener('message', onBuffer)

    return () => {
      dataChannel.removeEventListener('message', onBuffer)
    }
  }, [dataChannel])

  return null
}
