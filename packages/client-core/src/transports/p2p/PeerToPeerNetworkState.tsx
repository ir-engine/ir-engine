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
import {
  IceServerType,
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
  dispatchAction,
  getMutableState,
  getState,
  none,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'
import {
  DataChannelRegistryState,
  DataChannelType,
  NetworkActions,
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
import { CAM_VIDEO_SIMULCAST_ENCODINGS } from '@ir-engine/network/src/constants/VideoConstants'
import {
  MessageTypes,
  RTCPeerConnectionState,
  SendMessageType,
  StunServerState,
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
  const joinResponse = useHookstate<null | { index: number; iceServers: IceServerType[] }>(null)

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

    const topic = props.instance.locationId ? NetworkTopics.world : NetworkTopics.media

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
        userID: Engine.instance.store.userID
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
          userID: Engine.instance.store.userID
        })
      )
      removeNetwork(network)
      getMutableState(NetworkState).hostIds[topic].set(none)
    }
  }, [joinResponse])

  if (!joinResponse.value) return null

  return <PeersReactor instance={props.instance} />
}

const PeersReactor = (props: { instance: InstanceType }) => {
  const instanceAttendanceQuery = useFind(instanceAttendancePath, {
    query: {
      instanceId: props.instance.id,
      ended: false,
      updatedAt: {
        // Only consider instances that have been updated in the last 10 seconds
        $gt: toDateTimeSql(new Date(new Date().getTime() - 10000))
      }
    }
  })

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
          instanceID={props.instance.id}
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

    dispatchAction(
      NetworkActions.peerJoined({
        $network: network.id,
        $topic: network.topic,
        $to: Engine.instance.store.peerID,
        peerID: props.peerID,
        peerIndex: props.peerIndex,
        userID: props.userID
      })
    )

    let receivedPoll = false

    const onMessage = (e) => {
      if (e.data === '') {
        receivedPoll = true
        return
      }
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

    network.transports[props.peerID] = {
      message,
      buffer
    }

    /**
     * Poll the data channel until it's open, then send a message to the peer to let them know we're ready to receive messages.
     */
    const interval = setInterval(() => {
      if (dataChannel.readyState === 'open') {
        dataChannel.send('')
        if (receivedPoll) {
          clearInterval(interval)
          // once connected, send all our cached actions to the peer
          const selfCachedActions = Engine.instance.store.actions.cached.filter(
            (action) => action.$topic === network.topic && action.$peer === Engine.instance.store.peerID
          )
          network.messageToPeer(props.peerID, selfCachedActions)
        }
      }
    }, 10)

    return () => {
      clearInterval(interval)
      dispatchAction(
        NetworkActions.peerLeft({
          $network: network.id,
          $topic: network.topic,
          $to: Engine.instance.store.peerID,
          peerID: props.peerID,
          userID: props.userID
        })
      )
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

  useEffect(() => {
    if (!screenshareEnabled || !screenshareMediaStream) return

    const videoTrack = screenshareMediaStream.getVideoTracks()[0].clone()
    const videoStream = WebRTCTransportFunctions.createMediaChannel(
      sendMessage,
      props.instanceID,
      props.peerID,
      videoTrack,
      screenshareVideoDataChannelType
    )

    let audioStream: MediaStream | undefined

    const audioTracks = screenshareMediaStream.getAudioTracks()
    if (audioTracks.length) {
      const audioTrack = audioTracks[0].clone()

      audioStream = WebRTCTransportFunctions.createMediaChannel(
        sendMessage,
        props.instanceID,
        props.peerID,
        audioTrack,
        screenshareAudioDataChannelType
      )!
    }

    return () => {
      if (videoStream) {
        WebRTCTransportFunctions.closeMediaChannel(sendMessage, props.instanceID, props.peerID, videoTrack, videoStream)
      }
      if (audioStream) {
        WebRTCTransportFunctions.closeMediaChannel(sendMessage, props.instanceID, props.peerID, videoTrack, audioStream)
      }
    }
  }, [screenshareMediaStream, screenshareEnabled])

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
    if (!mediaTag || !stream || !peerMediaStream?.value) return

    if (isAudio) {
      peerMediaStream.audioMediaStream.set(stream)
      return () => {
        if (type && !getState(PeerMediaChannelState)[props.peerID]?.[type]) return
        peerMediaStream.audioMediaStream.set(null)
      }
    } else {
      peerMediaStream.videoMediaStream.set(stream)
      return () => {
        if (type && !getState(PeerMediaChannelState)[props.peerID]?.[type]) return
        peerMediaStream.videoMediaStream.set(null)
      }
    }
  }, [mediaTag, stream, !!peerMediaStream?.value])

  useEffect(() => {
    if (!mediaTag || !stream || !peerMediaStream || !type) return
    const paused = isAudio ? peerMediaStream.audioStreamPaused.value : peerMediaStream.videoStreamPaused.value
    WebRTCTransportFunctions.pauseMediaChannel(sendMessage, props.instanceID, props.peerID, stream, paused)
  }, [isAudio ? peerMediaStream?.audioStreamPaused?.value : peerMediaStream?.videoStreamPaused?.value])

  const clientSettingQuery = useFind(clientSettingPath)
  const clientSetting = clientSettingQuery.data[0]

  const immersiveMedia = useMutableState(MediaSettingsState).immersiveMedia.value

  const isPiP = peerMediaStream?.value?.videoQuality === 'largest'

  useEffect(() => {
    if (!stream || isAudio) return

    const { maxResolution } = clientSetting.mediaSettings.video

    const isScreen = type === 'screen'

    const { scale, maxBitrate } = getVideoQuality({ isScreen, maxResolution, isPiP, immersiveMedia })

    WebRTCTransportFunctions.requestVideoQuality(sendMessage, props.instanceID, props.peerID, stream, scale, maxBitrate)
  }, [stream, immersiveMedia, isPiP])

  return null
}

/**
 * Get the video quality based on the client settings
 * - If the video is in PiP or immersive media mode, use the highest quality
 * - If the resolution is less than 540p, use the second layer
 * - If the video is a screen share, do not scale the resolution
 * @param args
 * @returns
 */
const getVideoQuality = (args: {
  isScreen: boolean
  maxResolution: string
  isPiP: boolean
  immersiveMedia: boolean
}) => {
  const { isScreen, maxResolution, isPiP, immersiveMedia } = args

  const resolution = VideoConstants.VIDEO_CONSTRAINTS[maxResolution] || VideoConstants.VIDEO_CONSTRAINTS.hd

  const layer =
    isPiP || immersiveMedia
      ? resolution.height.ideal > MAX_RES_TO_USE_TOP_LAYER
        ? CAM_VIDEO_SIMULCAST_ENCODINGS.length - 1
        : CAM_VIDEO_SIMULCAST_ENCODINGS.length - 2
      : 0
  const config = CAM_VIDEO_SIMULCAST_ENCODINGS[layer]
  const scale = isScreen ? 1 : config.scaleResolutionDownBy
  const maxBitrate = config.maxBitrate

  return {
    scale,
    maxBitrate
  }
}
