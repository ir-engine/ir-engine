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

import { t } from 'i18next'
import { Resizable } from 're-resizable'
import React, { useEffect, useRef } from 'react'
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa'

import { useMediaWindows } from '@ir-engine/client-core/src/components/UserMediaWindows'
import { MediaStreamState } from '@ir-engine/client-core/src/media/MediaStreamState'
import { PeerMediaChannelState, PeerMediaStreamInterface } from '@ir-engine/client-core/src/media/PeerMediaChannelState'
import { useUserAvatarThumbnail } from '@ir-engine/client-core/src/user/functions/useUserAvatarThumbnail'
import { useGet } from '@ir-engine/common'
import { UserName, userPath } from '@ir-engine/common/src/schema.type.module'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { PeerID, State, getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { NetworkState } from '@ir-engine/network'

export const UserMedia = (props: { peerID: PeerID; type: 'cam' | 'screen' }) => {
  const { peerID, type } = props

  const mediaNetwork = NetworkState.mediaNetwork

  const isSelf =
    !mediaNetwork ||
    peerID === Engine.instance.store.peerID ||
    (mediaNetwork?.peers &&
      Object.values(mediaNetwork.peers).find((peer) => peer.userId === Engine.instance.userID)?.peerID === peerID) ||
    peerID === 'self'
  const isScreen = type === 'screen'

  const userID = mediaNetwork.peers[peerID]?.userId

  const user = useGet(userPath, userID)
  const userThumbnail = useUserAvatarThumbnail(userID)

  const getUsername = () => {
    if (isSelf && !isScreen) return t('user:person.you')
    if (isSelf && isScreen) return t('user:person.yourScreen')
    const username = user.data?.name ?? 'A User'
    if (!isSelf && isScreen) return username + "'s Screen"
    return username
  }

  const peerMediaChannelState = useHookstate(
    getMutableState(PeerMediaChannelState)[peerID][type] as State<PeerMediaStreamInterface>
  )
  const { videoMediaStream, audioMediaStream, videoStreamPaused, audioStreamPaused } = peerMediaChannelState.get({
    noproxy: true
  })

  const username = getUsername() as UserName

  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!ref.current || ref.current.srcObject || !videoMediaStream) return

    ref.current.id = `${peerID}_video_xrui`
    ref.current.autoplay = true
    ref.current.muted = true
    ref.current.setAttribute('playsinline', 'true')

    const newVideoTrack = videoMediaStream.getVideoTracks()[0]!.clone()
    ref.current.srcObject = new MediaStream([newVideoTrack])
    ref.current.play()
  }, [ref.current, videoMediaStream])

  const toggleVideo = async (e) => {
    e.stopPropagation()
    if (isSelf && !isScreen) {
      MediaStreamState.toggleWebcamPaused()
    } else if (isSelf && isScreen) {
      MediaStreamState.toggleScreenshareVideoPaused()
    } else {
      peerMediaChannelState.videoStreamPaused.set((val) => !val)
    }
  }

  const toggleAudio = async (e) => {
    e.stopPropagation()
    if (isSelf && !isScreen) {
      MediaStreamState.toggleMicrophonePaused()
    } else if (isSelf && isScreen) {
      MediaStreamState.toggleScreenshareAudioPaused()
    } else {
      peerMediaChannelState.audioStreamPaused.set((val) => !val)
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
        className={`relative flex h-full items-center justify-center rounded-[5px]`}
        style={{ backgroundColor: 'gray' }} // TODO derive color from user thumbnail
      >
        {!videoMediaStream || videoStreamPaused ? (
          <img
            src={userThumbnail}
            alt=""
            crossOrigin="anonymous"
            draggable={false}
            className="h-[40px] w-[40px] max-w-full rounded-full"
            id={peerID + '-thumbnail'}
          />
        ) : (
          <video
            className="h-full w-full"
            ref={ref}
            key={peerID + '-video-container'}
            id={peerID + '-video-container'}
          />
        )}
        <div className="absolute bottom-1 left-1 flex min-w-0  max-w-xs items-center justify-center rounded-[20px] bg-[#B6AFAE] px-1">
          <p className="font-segoe-ui rounded-2xl text-left text-[12px] text-white [text-align-last:center]">
            {username}
          </p>
        </div>
        <button
          className="absolute bottom-1 right-1 m-0 flex h-[20px] w-[20px] items-center justify-center  rounded-full bg-[#EDEEF0] px-1"
          onClick={toggleAudio}
        >
          {audioStreamPaused ? (
            <FaMicrophoneSlash className="h-5 w-5 overflow-hidden  fill-[#3F3960]" />
          ) : (
            <FaMicrophone className="h-3 w-3 overflow-hidden fill-[#008000]" />
          )}
        </button>
      </div>
    </Resizable>
  )
}

export const MediaCall = () => {
  const windows = useMediaWindows()
  return (
    <div className="mx-1 mt-1 flex flex-wrap gap-1">
      {windows.map(({ peerID, type }) => (
        <UserMedia peerID={peerID} type={type} key={peerID} />
      ))}
    </div>
  )
}
