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

import { useMediaWindows } from '@etherealengine/client-core/src/components/UserMediaWindows'
import {
  PeerMediaChannelState,
  PeerMediaStreamInterface
} from '@etherealengine/client-core/src/transports/PeerMediaChannelState'
import {
  ConsumerExtension,
  SocketWebRTCClientNetwork,
  pauseConsumer,
  resumeConsumer,
  toggleMicrophonePaused,
  toggleScreenshareAudioPaused,
  toggleScreenshareVideoPaused,
  toggleWebcamPaused
} from '@etherealengine/client-core/src/transports/SocketWebRTCClientFunctions'
import { useUserAvatarThumbnail } from '@etherealengine/client-core/src/user/functions/useUserAvatarThumbnail'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { WorldState } from '@etherealengine/engine/src/networking/interfaces/WorldState'
import { State, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { t } from 'i18next'
import { Resizable } from 're-resizable'
import React, { useEffect, useRef } from 'react'
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa'

export const UserMedia = (props: { peerID: PeerID; type: 'cam' | 'screen' }) => {
  const { peerID, type } = props

  const mediaNetwork = NetworkState.mediaNetwork

  const isSelf =
    !mediaNetwork ||
    peerID === Engine.instance.peerID ||
    (mediaNetwork?.peers &&
      Object.values(mediaNetwork.peers).find((peer) => peer.userId === Engine.instance.userID)?.peerID === peerID) ||
    peerID === 'self'
  const isScreen = type === 'screen'

  const userID = mediaNetwork.peers[peerID]?.userId

  const userThumbnail = useUserAvatarThumbnail(userID)

  const usernames = useHookstate(getMutableState(WorldState).userNames)
  const getUsername = () => {
    if (isSelf && !isScreen) return t('user:person.you')
    if (isSelf && isScreen) return t('user:person.yourScreen')
    const username = userID ? usernames.get({ noproxy: true })[userID] : 'A User'
    if (!isSelf && isScreen) return username + "'s Screen"
    return username
  }

  const peerMediaChannelState = useHookstate(
    getMutableState(PeerMediaChannelState)[peerID][type] as State<PeerMediaStreamInterface>
  )
  const {
    videoStream,
    audioStream,
    videoStreamPaused,
    audioStreamPaused,
    videoProducerPaused,
    audioProducerPaused,
    videoProducerGlobalMute,
    audioProducerGlobalMute,
    videoElement,
    audioElement
  } = peerMediaChannelState.get({ noproxy: true })

  const { videoStream: videoStreamState } = peerMediaChannelState

  const username = getUsername()

  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!ref.current || ref.current.srcObject || !videoStreamState?.value) return

    ref.current.id = `${peerID}_video_xrui`
    ref.current.autoplay = true
    ref.current.muted = true
    ref.current.setAttribute('playsinline', 'true')

    const newVideoTrack = videoStreamState.value.track!.clone()
    ref.current.srcObject = new MediaStream([newVideoTrack])
    ref.current.play()
  }, [ref.current, videoStreamState])

  const toggleVideo = async (e) => {
    e.stopPropagation()
    const mediaNetwork = NetworkState.mediaNetwork as SocketWebRTCClientNetwork
    if (isSelf && !isScreen) {
      toggleWebcamPaused()
    } else if (isSelf && isScreen) {
      toggleScreenshareVideoPaused()
    } else {
      if (!videoStreamPaused) {
        pauseConsumer(mediaNetwork, videoStream as ConsumerExtension)
        peerMediaChannelState.videoStreamPaused.set(true)
      } else {
        resumeConsumer(mediaNetwork, videoStream as ConsumerExtension)
        peerMediaChannelState.videoStreamPaused.set(false)
      }
    }
  }

  const toggleAudio = async (e) => {
    e.stopPropagation()
    const mediaNetwork = NetworkState.mediaNetwork as SocketWebRTCClientNetwork
    if (isSelf && !isScreen) {
      toggleMicrophonePaused()
    } else if (isSelf && isScreen) {
      toggleScreenshareAudioPaused()
    } else {
      if (!audioStreamPaused) {
        pauseConsumer(mediaNetwork, audioStream as ConsumerExtension)
        peerMediaChannelState.audioStreamPaused.set(true)
      } else {
        resumeConsumer(mediaNetwork, audioStream as ConsumerExtension)
        peerMediaChannelState.audioStreamPaused.set(false)
      }
    }
  }

  return (
    <Resizable
      key={username}
      bounds="window"
      defaultSize={{ width: 254, height: 160 }}
      enable={{
        top: false,
        right: true,
        bottom: true,
        left: true,
        topRight: false,
        bottomRight: true,
        bottomLeft: true,
        topLeft: false
      }}
      minWidth={200}
      maxWidth={420}
      minHeight={160}
      maxHeight={250}
    >
      <div
        className={`relative h-full rounded-[5px] flex items-center justify-center`}
        style={{ backgroundColor: 'gray' }} // TODO derive color from user thumbnail
      >
        {videoStream == null || videoStreamPaused || videoProducerPaused || videoProducerGlobalMute ? (
          <img
            src={userThumbnail}
            alt=""
            crossOrigin="anonymous"
            draggable={false}
            className="rounded-full w-[40px] h-[40px]"
            id={peerID + '-thumbnail'}
          />
        ) : (
          <video
            className="w-full h-full"
            ref={ref}
            key={peerID + '-video-container'}
            id={peerID + '-video-container'}
          />
        )}
        <div className="absolute min-w-0 max-w-xs bottom-1 left-1  flex justify-center items-center rounded-[20px] px-1 bg-[#B6AFAE]">
          <p className="[text-align-last:center] rounded-2xl text-[12px] font-segoe-ui text-white text-left">
            {username}
          </p>
        </div>
        <button
          className="absolute bottom-1 right-1 w-[20px] h-[20px] flex px-1 justify-center  items-center rounded-full bg-[#EDEEF0]"
          onClick={toggleAudio}
        >
          {audioStreamPaused ? (
            <FaMicrophoneSlash className="w-5 h-5 overflow-hidden  fill-[#3F3960]" />
          ) : (
            <FaMicrophone className="w-3 h-3 overflow-hidden fill-[#008000]" />
          )}
        </button>
      </div>
    </Resizable>
  )
}

export const MediaCall = () => {
  const windows = useMediaWindows()
  return (
    <div className="flex flex-wrap gap-1 mx-1 mt-1">
      {windows.map(({ peerID, type }) => (
        <UserMedia peerID={peerID} type={type} key={peerID} />
      ))}
    </div>
  )
}
