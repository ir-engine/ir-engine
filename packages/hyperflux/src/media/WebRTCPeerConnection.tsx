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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { decode, encode } from 'msgpackr'
import React, { useEffect } from 'react'
import { dispatchAction } from '../functions/ActionFunctions'
import { getState, useMutableState } from '../functions/StateFunctions'
import { HyperFlux } from '../functions/StoreFunctions'
import { NetworkActions } from '../network/NetworkPeerState'
import { Network, NetworkState, NetworkTopics } from '../network/NetworkState'
import { NetworkID, PeerID, UserID } from '../types/Types'
import { DataChannelRegistryState, DataChannelType } from './DataChannelRegistry'
import {
  createPeerMediaChannels,
  MediaChannelState,
  removePeerMediaChannels,
  screenshareAudioMediaChannelType,
  screenshareVideoMediaChannelType,
  webcamAudioMediaChannelType,
  webcamVideoMediaChannelType
} from './MediaChannelState'
import { MediaStreamState } from './MediaStreamState'
import { CAM_VIDEO_SIMULCAST_ENCODINGS, VIDEO_CONSTRAINTS } from './VideoConstants'
import { RTCPeerConnectionState, SendMessageType, WebRTCTransportFunctions } from './WebRTCTransportFunctions'

export const WebRTCPeerConnection = (props: {
  network: Network
  peerID: PeerID
  peerIndex: number
  userID: UserID
  sendMessage: SendMessageType
  maxResolution: string
  isPiP: boolean
}) => {
  const { network, peerID, peerIndex, userID, sendMessage } = props

  const networkID = network.id

  useEffect(() => {
    const abortController = new AbortController()

    /**
     * We only need one peer to initiate the connection, so do so if the peerID is greater than our own.
     */
    const isInitiator = HyperFlux.store.peerID > peerID

    if (isInitiator) {
      // poll to ensure the other peer's listener has been set up before we try to connect

      WebRTCTransportFunctions.poll(sendMessage, networkID, peerID)

      const interval = setInterval(() => {
        if (abortController.signal.aborted || getState(RTCPeerConnectionState)[networkID]?.[peerID]) {
          clearInterval(interval)
        } else {
          WebRTCTransportFunctions.poll(sendMessage, networkID, peerID)
        }
      }, 1000)
    }

    return () => {
      abortController.abort()
      WebRTCTransportFunctions.close(networkID, peerID)
    }
  }, [])

  const peerConnectionState = useMutableState(RTCPeerConnectionState)[networkID][peerID]?.value

  useEffect(() => {
    if (!peerConnectionState || !peerConnectionState.ready || !peerConnectionState.dataChannels['actions']) return

    const dataChannel = peerConnectionState.dataChannels['actions'] as RTCDataChannel

    dispatchAction(
      NetworkActions.peerJoined({
        $network: networkID,
        $topic: network.topic,
        $to: HyperFlux.store.peerID,
        peerID: peerID,
        peerIndex: peerIndex,
        userID: userID
      })
    )

    let receivedPoll = false

    const onMessage = (e) => {
      if (e.data === '') {
        receivedPoll = true
        return
      }
      const message = decode(e.data)

      network.onMessage(peerID, message)
    }

    dataChannel.addEventListener('message', onMessage)

    const message = (data) => {
      // we can ignore messages if the data channel is not open, and once it is open we will send all our cached actions so none are lost
      if (!dataChannel || dataChannel.readyState !== 'open') return
      dataChannel.send(encode(data))
    }

    const buffer = (dataChannelType: DataChannelType, data: any) => {
      const dataChannel = peerConnectionState.dataChannels[dataChannelType] as RTCDataChannel
      if (!dataChannel || dataChannel.readyState !== 'open') return
      const fromPeerID = HyperFlux.store.peerID
      const fromPeerIndex = network.peerIDToPeerIndex[fromPeerID]
      if (typeof fromPeerIndex === 'undefined')
        return console.warn('fromPeerIndex is undefined', fromPeerID, fromPeerIndex)
      dataChannel.send(encode([fromPeerIndex, data]))
    }

    network.transports[peerID] = {
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
          // once connected, send all our own cached actions to the peer
          const selfCachedActions = HyperFlux.store.actions.cached.filter(
            (action) => action.$topic === network.topic && action.$peer === HyperFlux.store.peerID
          )
          message(selfCachedActions)
        }
      }
    }, 10)

    return () => {
      clearInterval(interval)
      dispatchAction(
        NetworkActions.peerLeft({
          $network: network.id,
          $topic: network.topic,
          $to: HyperFlux.store.peerID,
          peerID: peerID,
          userID: userID
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
            networkID={networkID}
            peerID={props.peerID}
            dataChannelType={dataChannelType}
          />
        ))}
      {network.topic === NetworkTopics.media && (
        <MediaSendChannelReactor networkID={networkID} peerID={props.peerID} sendMessage={sendMessage} />
      )}
      {Object.keys(peerConnectionState.incomingMediaTracks).map((trackID) => (
        <MediaReceiveChannelReactor
          key={trackID}
          networkID={networkID}
          peerID={props.peerID}
          trackID={trackID}
          maxResolution={props.maxResolution}
          isPiP={props.isPiP}
          sendMessage={sendMessage}
        />
      ))}
    </>
  )
}

const DataChannelReactor = (props: { networkID: NetworkID; peerID: PeerID; dataChannelType: DataChannelType }) => {
  const peerConnectionState = useMutableState(RTCPeerConnectionState)[props.networkID][props.peerID].value
  const dataChannel = peerConnectionState?.dataChannels?.[props.dataChannelType] as RTCDataChannel | undefined

  useEffect(() => {
    const isInitiator = HyperFlux.store.peerID < props.peerID
    if (!isInitiator) return

    WebRTCTransportFunctions.createDataChannel(props.networkID, props.peerID, props.dataChannelType)
    return () => {
      WebRTCTransportFunctions.closeDataChannel(props.networkID, props.peerID, props.dataChannelType)
    }
  }, [])

  useEffect(() => {
    if (!dataChannel) return

    const network = getState(NetworkState).networks[props.networkID]

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

export const MediaSendChannelReactor = (props: {
  networkID: NetworkID
  peerID: PeerID
  sendMessage: SendMessageType
}) => {
  const { sendMessage } = props

  const mediaStreamState = useMutableState(MediaStreamState)
  const microphoneEnabled = mediaStreamState.microphoneEnabled.value
  const microphoneMediaStream = mediaStreamState.microphoneDestinationNode.value?.stream
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
      props.networkID,
      props.peerID,
      track,
      webcamAudioMediaChannelType
    )
    if (!stream) return
    return () => {
      WebRTCTransportFunctions.closeMediaChannel(sendMessage, props.networkID, props.peerID, track, stream)
    }
  }, [microphoneMediaStream, microphoneEnabled])

  useEffect(() => {
    if (!webcamEnabled || !webcamMediaStream) return
    const track = webcamMediaStream.getVideoTracks()[0].clone()
    const stream = WebRTCTransportFunctions.createMediaChannel(
      sendMessage,
      props.networkID,
      props.peerID,
      track,
      webcamVideoMediaChannelType
    )
    if (!stream) return
    return () => {
      WebRTCTransportFunctions.closeMediaChannel(sendMessage, props.networkID, props.peerID, track, stream)
    }
  }, [webcamMediaStream, webcamEnabled])

  useEffect(() => {
    if (!screenshareEnabled || !screenshareMediaStream) return

    const videoTrack = screenshareMediaStream.getVideoTracks()[0].clone()
    const videoStream = WebRTCTransportFunctions.createMediaChannel(
      sendMessage,
      props.networkID,
      props.peerID,
      videoTrack,
      screenshareVideoMediaChannelType
    )

    let audioStream: MediaStream | undefined

    const audioTracks = screenshareMediaStream.getAudioTracks()
    if (audioTracks.length) {
      const audioTrack = audioTracks[0].clone()

      audioStream = WebRTCTransportFunctions.createMediaChannel(
        sendMessage,
        props.networkID,
        props.peerID,
        audioTrack,
        screenshareAudioMediaChannelType
      )!
    }

    return () => {
      if (videoStream) {
        WebRTCTransportFunctions.closeMediaChannel(sendMessage, props.networkID, props.peerID, videoTrack, videoStream)
      }
      if (audioStream) {
        WebRTCTransportFunctions.closeMediaChannel(sendMessage, props.networkID, props.peerID, videoTrack, audioStream)
      }
    }
  }, [screenshareMediaStream, screenshareEnabled])

  return null
}

const MAX_RES_TO_USE_TOP_LAYER = 540 // If under 540p, use the topmost video layer, otherwise use layer n-1

export const MediaReceiveChannelReactor = (props: {
  networkID: NetworkID
  peerID: PeerID
  trackID: string
  maxResolution: string
  isPiP: boolean
  sendMessage: SendMessageType
}) => {
  const { maxResolution, sendMessage } = props

  const peerConnectionState = useMutableState(RTCPeerConnectionState)[props.networkID][props.peerID].value
  const mediaTrack = peerConnectionState?.incomingMediaTracks?.[props.trackID]
  const mediaTag = mediaTrack?.mediaTag
  const type = mediaTag
    ? mediaTag === screenshareAudioMediaChannelType || mediaTag === screenshareVideoMediaChannelType
      ? 'screen'
      : 'cam'
    : null
  const isAudio = mediaTag === webcamAudioMediaChannelType || mediaTag === screenshareAudioMediaChannelType
  const stream = mediaTrack?.stream as MediaStream

  const peerMediaChannelState = useMutableState(MediaChannelState)[props.peerID]
  const peerMediaStream = mediaTag ? peerMediaChannelState?.[mediaTag] : null

  useEffect(() => {
    if (!mediaTag || !stream || !peerMediaStream?.value) return

    if (isAudio) {
      peerMediaStream.stream.set(stream)
      return () => {
        if (mediaTag && !getState(MediaChannelState)[props.peerID]?.[mediaTag]) return
        peerMediaStream.stream.set(null)
      }
    } else {
      peerMediaStream.stream.set(stream)
      return () => {
        if (mediaTag && !getState(MediaChannelState)[props.peerID]?.[mediaTag]) return
        peerMediaStream.stream.set(null)
      }
    }
  }, [mediaTag, stream, !!peerMediaStream?.value])

  useEffect(() => {
    if (!mediaTag || !stream || !peerMediaStream) return
    const paused = isAudio ? peerMediaStream.paused.value : peerMediaStream.paused.value
    WebRTCTransportFunctions.pauseMediaChannel(sendMessage, props.networkID, props.peerID, stream, paused)
  }, [isAudio ? peerMediaStream?.paused?.value : peerMediaStream?.paused?.value])

  const isPiP = props.isPiP || peerMediaStream?.value?.quality === 'largest'

  useEffect(() => {
    if (!stream || isAudio) return

    const isScreen = type === 'screen'

    const { scale, maxBitrate } = getVideoQuality({ isScreen, maxResolution, isPiP })

    WebRTCTransportFunctions.requestVideoQuality(sendMessage, props.networkID, props.peerID, stream, scale, maxBitrate)
  }, [stream, maxResolution, isPiP])

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
const getVideoQuality = (args: { isScreen: boolean; maxResolution: string; isPiP: boolean }) => {
  const { isScreen, maxResolution, isPiP } = args

  const resolution = VIDEO_CONSTRAINTS[maxResolution] || VIDEO_CONSTRAINTS.hd

  const layer = isPiP
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
