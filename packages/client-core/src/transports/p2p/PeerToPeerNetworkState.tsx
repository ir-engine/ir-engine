import { API, useFind, useGet } from '@ir-engine/common'
import {
  InstanceAttendanceType,
  InstanceID,
  InstanceType,
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
  VideoConstants,
  addNetwork,
  createNetwork,
  removeNetwork,
  screenshareAudioDataChannelType,
  screenshareVideoDataChannelType,
  webcamAudioDataChannelType,
  webcamVideoDataChannelType
} from '@ir-engine/network'
import {
  MessageTypes,
  RTCPeerConnectionState,
  SendMessageType,
  WebRTCTransportFunctions
} from '@ir-engine/network/src/webrtc/WebRTCTransportFunctions'
import { decode, encode } from 'msgpackr'
import React, { useEffect } from 'react'
import { MediaStreamState } from '../../media/MediaStreamState'
import {
  PeerMediaChannelState,
  createPeerMediaChannels,
  removePeerMediaChannels
} from '../../media/PeerMediaChannelState'

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
    const abortController = new AbortController()

    API.instance
      .service(instanceSignalingPath)
      .create({ instanceID })
      .then((response) => {
        if (abortController.signal.aborted) return
        joinResponse.set(response)
      })

    return () => {
      abortController.abort()
    }
  }, [])

  useEffect(() => {
    if (!joinResponse.value) return

    const topic = props.instance.locationId ? NetworkTopics.world : NetworkTopics.media

    getMutableState(NetworkState).hostIds[topic].set(instanceID)

    const network = createNetwork(instanceID, null, topic, {})
    addNetwork(network)

    network.ready = true

    /** heartbeat */
    const heartbeat = setInterval(() => {
      API.instance.service(instanceSignalingPath).get({ instanceID })
    }, 5000)

    NetworkPeerFunctions.createPeer(
      network,
      Engine.instance.store.peerID,
      joinResponse.value.index,
      Engine.instance.store.userID
    )

    return () => {
      clearInterval(heartbeat)
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
    API.instance.service(instanceSignalingPath).on('patched', async (data) => {
      // need to ignore messages from self
      if (data.fromPeerID !== props.peerID) return
      if (data.targetPeerID !== Engine.instance.store.peerID) return
      if (data.instanceID !== props.instanceID) return

      await WebRTCTransportFunctions.onMessage(sendMessage, data.instanceID, props.peerID, data.message)
    })

    const abortController = new AbortController()

    /**
     * We only need one peer to initiate the connection, so do so if the peerID is greater than our own.
     */
    const isInitiator = Engine.instance.store.peerID > props.peerID

    if (isInitiator) {
      // poll to ensure the other peer's listener has been set up before we try to connect

      WebRTCTransportFunctions.poll(sendMessage, props.instanceID, props.peerID)

      const interval = setInterval(() => {
        if (abortController.signal.aborted || getState(RTCPeerConnectionState)[props.instanceID]?.[props.peerID]) {
          clearInterval(interval)
        } else {
          WebRTCTransportFunctions.poll(sendMessage, props.instanceID, props.peerID)
        }
      }, 1000)
    }

    return () => {
      abortController.abort()
      WebRTCTransportFunctions.close(props.instanceID, props.peerID)
    }
  }, [])

  const peerConnectionState = useMutableState(RTCPeerConnectionState)[props.instanceID][props.peerID]?.value

  useEffect(() => {
    if (!peerConnectionState || !peerConnectionState.ready || !peerConnectionState.dataChannels['actions']) return

    const dataChannel = peerConnectionState.dataChannels['actions'] as RTCDataChannel

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
      if (!dataChannel || dataChannel.readyState !== 'open') return
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

    // @todo this is a hack to ensure the data channel is open before sending the actions
    setTimeout(() => {
      // once connected, send all our cached actions to the peer
      const selfCachedActions = Engine.instance.store.actions.cached.filter(
        (action) => action.$topic === network.topic && action.$peer === Engine.instance.store.peerID
      )
      network.messageToPeer(props.peerID, selfCachedActions)
    }, 10)

    return () => {
      NetworkPeerFunctions.destroyPeer(network, props.peerID)
      dataChannel.removeEventListener('message', onMessage)
    }
  }, [peerConnectionState?.ready, peerConnectionState?.dataChannels?.['actions']])

  const dataChannelRegistry = useMutableState(DataChannelRegistryState).value

  if (!peerConnectionState?.ready) return null

  return (
    <>
      {network.topic === NetworkTopics.world &&
        Object.keys(dataChannelRegistry).map((dataChannelType: DataChannelType) => (
          <DataChannelReactor
            key={dataChannelType}
            instanceID={props.instanceID}
            peerID={props.peerID}
            dataChannelType={dataChannelType}
          />
        ))}
      {network.topic === NetworkTopics.media && (
        <MediaSendChannelReactor instanceID={props.instanceID} peerID={props.peerID} />
      )}
      {Object.keys(peerConnectionState.incomingMediaTracks).map((trackID) => (
        <MediaReceiveChannelReactor
          key={trackID}
          instanceID={props.instanceID}
          peerID={props.peerID}
          trackID={trackID}
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

const MediaSendChannelReactor = (props: { instanceID: InstanceID; peerID: PeerID }) => {
  const mediaStreamState = useMutableState(MediaStreamState)
  const microphoneEnabled = mediaStreamState.microphoneEnabled.value
  const microphoneMediaStream = mediaStreamState.microphoneMediaStream.value
  const webcamEnabled = mediaStreamState.webcamEnabled.value
  const webcamMediaStream = mediaStreamState.webcamMediaStream.value
  const screenshareEnabled = mediaStreamState.screenshareEnabled.value
  const screenshareMediaStream = mediaStreamState.screenshareMediaStream.value

  useEffect(() => {
    createPeerMediaChannels(props.peerID)
    return () => {
      removePeerMediaChannels(props.peerID)
    }
  }, [])

  useEffect(() => {
    if (!microphoneEnabled || !microphoneMediaStream) return
    const track = microphoneMediaStream.getAudioTracks()[0].clone()
    const stream = WebRTCTransportFunctions.createMediaChannel(
      sendMessage,
      props.instanceID,
      props.peerID,
      track,
      webcamAudioDataChannelType
    )
    if (!stream) return
    return () => {
      WebRTCTransportFunctions.closeMediaChannel(sendMessage, props.instanceID, props.peerID, track, stream)
    }
  }, [microphoneMediaStream, microphoneEnabled])

  useEffect(() => {
    if (!webcamEnabled || !webcamMediaStream) return
    const track = webcamMediaStream.getVideoTracks()[0].clone()
    const stream = WebRTCTransportFunctions.createMediaChannel(
      sendMessage,
      props.instanceID,
      props.peerID,
      track,
      webcamVideoDataChannelType
    )
    if (!stream) return
    return () => {
      WebRTCTransportFunctions.closeMediaChannel(sendMessage, props.instanceID, props.peerID, track, stream)
    }
  }, [webcamMediaStream, webcamEnabled])

  const immersiveMedia = useMutableState(MediaSettingsState).immersiveMedia.value

  const peerMediaChannelState = useMutableState(PeerMediaChannelState)[props.peerID]?.cam?.value

  const clientSettingQuery = useFind(clientSettingPath)
  const clientSetting = clientSettingQuery.data[0]

  const isPiP = peerMediaChannelState?.videoQuality === 'largest'

  useEffect(() => {
    if (!webcamMediaStream || !peerMediaChannelState) return

    const isScreen = false

    const mediaTrack = webcamMediaStream.getVideoTracks()[0]

    const { maxResolution } = clientSetting.mediaSettings.video
    const resolution = VideoConstants.VIDEO_CONSTRAINTS[maxResolution] || VideoConstants.VIDEO_CONSTRAINTS.hd

    // @todo this isn't correct
    const scale = isPiP || immersiveMedia ? 1 : !isScreen && resolution.height.ideal > MAX_RES_TO_USE_TOP_LAYER ? 2 : 4

    WebRTCTransportFunctions.setVideoQuality(props.instanceID, props.peerID, mediaTrack, scale)
  }, [webcamMediaStream, immersiveMedia, isPiP])

  return null
}

const MAX_RES_TO_USE_TOP_LAYER = 540 // If under 540p, use the topmost video layer, otherwise use layer n-1

const MediaReceiveChannelReactor = (props: { instanceID: InstanceID; peerID: PeerID; trackID: string }) => {
  const peerConnectionState = useMutableState(RTCPeerConnectionState)[props.instanceID][props.peerID].value
  const mediaTrack = peerConnectionState?.incomingMediaTracks?.[props.trackID]
  const mediaTag = mediaTrack?.mediaTag
  const type = mediaTag
    ? mediaTag === screenshareAudioDataChannelType || mediaTag === screenshareVideoDataChannelType
      ? 'screen'
      : 'cam'
    : null
  const isAudio = type ? mediaTag === webcamAudioDataChannelType || mediaTag === screenshareAudioDataChannelType : false
  const stream = type ? (mediaTrack?.stream as MediaStream) : null

  const peerMediaChannelState = useMutableState(PeerMediaChannelState)[props.peerID]
  const peerMediaStream = type ? peerMediaChannelState?.[type] : null

  useEffect(() => {
    if (!mediaTag || !stream || !peerMediaStream) return

    if (isAudio) {
      const track = stream.getAudioTracks()[0]
      const newMediaStream = new MediaStream([track.clone()])
      peerMediaStream.audioMediaStream.set(newMediaStream)
      return () => {
        newMediaStream.getTracks().forEach((track) => track.stop())
        if (type && !getState(PeerMediaChannelState)[props.peerID]?.[type]) return
        peerMediaStream.audioMediaStream.set(null)
      }
    } else {
      const track = stream.getVideoTracks()[0]
      const newMediaStream = new MediaStream([track.clone()])
      peerMediaStream.videoMediaStream.set(newMediaStream)
      return () => {
        newMediaStream.getTracks().forEach((track) => track.stop())
        if (type && !getState(PeerMediaChannelState)[props.peerID]?.[type]) return
        peerMediaStream.videoMediaStream.set(null)
      }
    }
  }, [mediaTag, stream, peerMediaStream])

  useEffect(() => {
    if (!mediaTag || !stream || !peerMediaStream || !type) return
    const paused = isAudio ? peerMediaStream.audioStreamPaused.value : peerMediaStream.videoStreamPaused.value
    WebRTCTransportFunctions.pauseMediaChannel(sendMessage, props.instanceID, props.peerID, stream, paused)
  }, [isAudio ? peerMediaStream?.audioStreamPaused?.value : peerMediaStream?.videoStreamPaused?.value])

  return null
}
