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

import { t } from 'i18next'
import React, { useEffect, useRef, useState } from 'react'
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa'
import { HiArrowSmLeft, HiOutlineMinusSm } from 'react-icons/hi'
import { VolumeContextMenu } from './VolumeContextMenu'

import { useMediaWindows } from '@ir-engine/client-core/src/user/VideoWindows'
import { UserName } from '@ir-engine/common/src/schema.type.module'
import { Engine } from '@ir-engine/ecs/src/Engine'
import {
  MediaChannelState,
  MediaStreamInterface,
  MediaStreamState,
  NetworkState,
  PeerID,
  State,
  getMutableState,
  screenshareAudioMediaChannelType,
  screenshareVideoMediaChannelType,
  useHookstate,
  webcamAudioMediaChannelType,
  webcamVideoMediaChannelType
} from '@ir-engine/hyperflux'
import { MediaSessionState } from '@ir-engine/ui/src/pages/Chat/MediaSessionState'

export const UserMedia: React.FC<{ peerID: PeerID; type: 'cam' | 'screen' }> = (props) => {
  const { peerID, type } = props

  const mediaNetwork = NetworkState.mediaNetwork

  // Context menu state
  const [showVolumeMenu, setShowVolumeMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })

  const isSelf = !mediaNetwork || peerID === Engine.instance.store.peerID || peerID === 'self'
  const isScreen = type === 'screen'

  // For now, we'll use a placeholder for user data
  // This should be updated when a new API is available
  const user = { data: { name: isSelf ? 'You' : 'User' } }
  const userThumbnail = ''

  const getUsername = () => {
    if (isSelf && !isScreen) return t('user:person.you')
    if (isSelf && isScreen) return t('user:person.yourScreen')
    const username = user.data?.name ?? 'A User'
    if (!isSelf && isScreen) return username + "'s Screen"
    return username
  }

  const videoMediaChannelState = useHookstate(
    getMutableState(MediaChannelState)[peerID][
      isScreen ? screenshareVideoMediaChannelType : webcamVideoMediaChannelType
    ] as State<MediaStreamInterface>
  )
  const mediaStreamState = useHookstate(getMutableState(MediaStreamState))

  // Get the media state values
  const videoMediaState = videoMediaChannelState.get({
    noproxy: true
  }) as MediaStreamInterface

  // For self, use MediaStreamState directly to determine if audio/video is paused
  const videoMediaStream = videoMediaState.stream
  const videoStreamPaused =
    isSelf && !isScreen
      ? !mediaStreamState.webcamEnabled.value
      : isSelf && isScreen
      ? !mediaStreamState.screenshareEnabled.value
      : videoMediaState.paused

  const audioMediaChannelState = useHookstate(
    getMutableState(MediaChannelState)[peerID][
      isScreen ? screenshareAudioMediaChannelType : webcamAudioMediaChannelType
    ] as State<MediaStreamInterface>
  )

  const audioMediaState = audioMediaChannelState.get({
    noproxy: true
  }) as MediaStreamInterface

  const audioStreamPaused =
    isSelf && !isScreen
      ? !mediaStreamState.microphoneEnabled.value
      : isSelf && isScreen
      ? mediaStreamState.screenShareAudioPaused.value
      : audioMediaState.paused

  const username = getUsername() as UserName

  const ref = useRef<HTMLVideoElement>(null)

  // Handle right click to show volume menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setMenuPosition({ x: e.clientX, y: e.clientY })
    setShowVolumeMenu(true)
  }

  useEffect(() => {
    if (!ref.current || ref.current.srcObject || !videoMediaStream) return

    ref.current.id = `${peerID}_video_xrui`
    ref.current.autoplay = true
    ref.current.muted = true
    ref.current.setAttribute('playsinline', 'true')

    const newVideoTrack = videoMediaStream.getVideoTracks()[0]!.clone()
    ref.current.srcObject = new MediaStream([newVideoTrack])
    ref.current.play()
    ref.current!.style.transform = isSelf ? 'scaleX(-1)' : 'scaleX(1)'
  }, [ref.current, videoMediaStream])

  const toggleVideo = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isSelf && !isScreen) {
      MediaStreamState.toggleWebcamPaused()
    } else if (isSelf && isScreen) {
      MediaStreamState.toggleScreenshareVideoPaused()
    } else {
      videoMediaChannelState.paused.set((val) => !val)
    }
  }

  const toggleAudio = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isSelf && !isScreen) {
      MediaStreamState.toggleMicrophonePaused()
    } else if (isSelf && isScreen) {
      MediaStreamState.toggleScreenshareAudioPaused()
    } else {
      audioMediaChannelState.paused.set((val) => !val)
    }
  }

  // Video content component
  const VideoContent = () => (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[5px]"
      style={{
        backgroundColor: 'gray',
        height: '100%',
        width: '100%'
      }}
      onContextMenu={handleContextMenu}
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
          className="h-full w-full object-cover"
          ref={ref}
          key={peerID + '-video-container'}
          id={peerID + '-video-container'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
      <div className="absolute bottom-1 left-1 flex min-w-0 max-w-xs items-center justify-center rounded-[20px] bg-[#B6AFAE] px-1">
        <p className="font-segoe-ui rounded-2xl text-left text-[12px] text-white [text-align-last:center]">
          {username}
        </p>
      </div>

      {/* Media control buttons */}
      <div className="absolute bottom-1 right-1 flex space-x-1">
        {/* Audio toggle button */}
        <button
          className="m-0 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#EDEEF0] hover:bg-gray-200"
          onClick={toggleAudio}
          title={audioStreamPaused ? 'Unmute' : 'Mute'}
        >
          {audioStreamPaused ? (
            <FaMicrophoneSlash className="h-4 w-4 overflow-hidden fill-[#3F3960]" />
          ) : (
            <FaMicrophone className="h-3 w-3 overflow-hidden fill-[#008000]" />
          )}
        </button>

        {/* Video toggle button */}
        <button
          className="m-0 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#EDEEF0] hover:bg-gray-200"
          onClick={toggleVideo}
          title={videoStreamPaused ? 'Enable Video' : 'Disable Video'}
        >
          {videoStreamPaused ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 fill-[#3F3960]"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              <path d="M1 15L19 5" strokeWidth="2" stroke="#3F3960" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 fill-[#008000]"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          )}
        </button>
      </div>

      {/* Volume context menu */}
      {showVolumeMenu && (
        <VolumeContextMenu
          peerID={peerID}
          type={type}
          position={menuPosition}
          onClose={() => setShowVolumeMenu(false)}
        />
      )}
    </div>
  )

  // Always use the VideoContent directly - no more individual resizing
  // This ensures videos always maximize their space in the grid
  return <VideoContent />
}

export const MediaCall: React.FC<{ isExpanded?: boolean }> = ({ isExpanded = false }) => {
  const windows = useMediaWindows()
  const mediaSessionState = useHookstate(getMutableState(MediaSessionState))

  // Use a safer approach to get peers
  const readyPeers = windows.map(({ peerID }) => peerID)

  // Handle return to normal view from expanded mode
  const handleReturnToNormal = () => {
    mediaSessionState.isExpanded.set(false)
  }

  // Handle exit fullscreen
  const handleExitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
    mediaSessionState.isFullscreen.set(false)
  }

  return (
    <div className="relative h-full w-full">
      {/* Return buttons - shown when expanded or in fullscreen */}
      {(isExpanded || mediaSessionState.isFullscreen.value) && (
        <div className="absolute right-2 top-2 z-10 flex space-x-2">
          {/* Exit fullscreen button - only shown in fullscreen mode */}
          {mediaSessionState.isFullscreen.value && (
            <button
              className="flex items-center justify-center rounded-full bg-gray-200 p-2 text-gray-700 hover:bg-gray-300"
              onClick={handleExitFullscreen}
              title="Exit fullscreen"
            >
              <HiOutlineMinusSm className="h-5 w-5" />
              <span className="ml-1">Exit Fullscreen</span>
            </button>
          )}

          {/* Return to normal view button - only shown when expanded */}
          {isExpanded && !mediaSessionState.isFullscreen.value && (
            <button
              className="flex items-center justify-center rounded-full bg-gray-200 p-2 text-gray-700 hover:bg-gray-300"
              onClick={handleReturnToNormal}
              title="Return to normal view"
            >
              <HiArrowSmLeft className="h-5 w-5" />
              <span className="ml-1">Return</span>
            </button>
          )}
        </div>
      )}

      {/* Grid layout for video feeds */}
      <div className={`h-full w-full ${isExpanded || mediaSessionState.isFullscreen.value ? 'p-2' : 'p-1'}`}>
        {(() => {
          // Filter valid peers
          const validWindows = windows.filter(({ peerID }) => readyPeers.includes(peerID))
          const count = validWindows.length

          // Calculate grid dimensions based on square root
          const cols = Math.ceil(Math.sqrt(count))
          const rows = Math.ceil(count / cols)

          // Create grid layout
          return (
            <div
              className="grid h-full w-full gap-2"
              style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
                height: isExpanded || mediaSessionState.isFullscreen.value ? 'calc(100vh - 100px)' : '100%',
                maxHeight: isExpanded || mediaSessionState.isFullscreen.value ? 'calc(100vh - 100px)' : '100%',
                width: '100%'
              }}
            >
              {validWindows.map(({ peerID, type }) => (
                <div
                  key={peerID}
                  className="flex h-full w-full items-center justify-center overflow-hidden"
                  style={{
                    aspectRatio: '16/9',
                    minHeight: isExpanded || mediaSessionState.isFullscreen.value ? '200px' : '140px',
                    height: '100%',
                    width: '100%'
                  }}
                >
                  <div className="h-full w-full">
                    <UserMedia peerID={peerID} type={type} />
                  </div>
                </div>
              ))}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
