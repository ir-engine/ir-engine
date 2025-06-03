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

import React from 'react'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'

import { Engine } from '@ir-engine/ecs/src/Engine'
import { AudioState } from '@ir-engine/engine/src/audio/AudioState'
import {
  getMutableState,
  MediaChannelState,
  MediaStreamState,
  PeerID,
  screenshareAudioMediaChannelType,
  screenshareVideoMediaChannelType,
  useHookstate,
  webcamAudioMediaChannelType,
  webcamVideoMediaChannelType
} from '@ir-engine/hyperflux'

import {
  Expand06Lg,
  Maximize02Lg,
  Microphone01Lg,
  MicrophoneOff,
  Screenshare,
  VideoRecorderLg,
  VideoRecorderOffLg,
  VolumeMaxLg,
  VolumeXLg
} from '@ir-engine/ui/src/icons'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import { HiOutlineMinusSm } from 'react-icons/hi'

import { MediaSessionState } from '../MediaSessionState'

interface MediaControlProps {
  peerID: PeerID
  type: 'cam' | 'screen'
}

export const MediaControl: React.FC<MediaControlProps> = ({ peerID, type }) => {
  const { t } = useTranslation()
  const mediaSessionState = useHookstate(getMutableState(MediaSessionState))
  const audioState = useHookstate(getMutableState(AudioState))

  const isSelf = peerID === Engine.instance.store.peerID || peerID === 'self'

  const isScreen = type === 'screen'

  const videoMediaChannelState = useHookstate(
    getMutableState(MediaChannelState)[peerID][
      isScreen ? screenshareVideoMediaChannelType : webcamVideoMediaChannelType
    ]
  )
  const audioMediaChannelState = useHookstate(
    getMutableState(MediaChannelState)[peerID][
      isScreen ? screenshareAudioMediaChannelType : webcamAudioMediaChannelType
    ]
  )

  const audioStreamPaused = audioMediaChannelState.paused.value
  const videoStreamPaused = videoMediaChannelState.paused.value

  const volume = isSelf ? audioState.microphoneGain.value : mediaSessionState.peerVolumes[peerID]?.value || 1

  const toggleAudio = () => {
    if (isSelf && !isScreen) {
      MediaStreamState.toggleMicrophonePaused()
    } else if (isSelf && isScreen) {
      MediaStreamState.toggleScreenshareAudioPaused()
    } else {
      audioMediaChannelState.paused.set((val) => !val)
    }
  }

  const toggleVideo = () => {
    if (isSelf && !isScreen) {
      MediaStreamState.toggleWebcamPaused()
    } else if (isSelf && isScreen) {
      MediaStreamState.toggleScreenshareVideoPaused()
    } else {
      videoMediaChannelState.paused.set((val) => !val)
    }
  }

  const adjustVolume = (value: number) => {
    if (isSelf) {
      getMutableState(AudioState).microphoneGain.set(value)
    } else {
      // Note: We can't directly set audioElement.volume as it's read-only
      // This should be handled by a proper volume control system
      mediaSessionState.peerVolumes[peerID].set(value)
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-md bg-gray-100 p-2">
      {/* Audio toggle button */}
      <Button
        variant="primary"
        size="sm"
        onClick={toggleAudio}
        className="flex items-center justify-center"
        title={
          isSelf
            ? audioStreamPaused
              ? t('mediaSession:mediaSession.unmuteYourself')
              : t('mediaSession:mediaSession.muteYourself')
            : audioStreamPaused
            ? t('mediaSession:mediaSession.unmuteOthers')
            : t('mediaSession:mediaSession.muteOthers')
        }
      >
        {isSelf ? (
          audioStreamPaused ? (
            <MicrophoneOff />
          ) : (
            <Microphone01Lg />
          )
        ) : audioStreamPaused ? (
          <VolumeXLg />
        ) : (
          <VolumeMaxLg />
        )}
      </Button>

      {/* Video toggle button */}
      <Button
        variant="primary"
        size="sm"
        onClick={toggleVideo}
        className="flex items-center justify-center"
        title={
          isSelf
            ? videoStreamPaused
              ? t('mediaSession:mediaSession.enableVideo')
              : t('mediaSession:mediaSession.disableVideo')
            : videoStreamPaused
            ? t('mediaSession:mediaSession.enableOtherVideo')
            : t('mediaSession:mediaSession.disableOtherVideo')
        }
      >
        {videoStreamPaused ? <VideoRecorderOffLg /> : <VideoRecorderLg />}
      </Button>

      {/* Volume slider */}
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) => adjustVolume(parseFloat(e.target.value))}
        className="w-24"
        title={
          isSelf ? t('mediaSession:mediaSession.microphoneVolume') : t('mediaSession:mediaSession.participantVolume')
        }
      />
    </div>
  )
}

export const MediaSessionControls: React.FC = () => {
  const { t } = useTranslation()
  const mediaSessionState = useHookstate(getMutableState(MediaSessionState))
  const isFullscreen = mediaSessionState.isFullscreen.value
  const isExpanded = mediaSessionState.isExpanded.value

  // This should be updated when a new API is available
  const peers: PeerID[] = []

  const toggleFullscreen = () => {
    if (isFullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
      mediaSessionState.isFullscreen.set(false)
    } else {
      const mediaContainer = document.getElementById('media-session-container')
      if (mediaContainer?.requestFullscreen) {
        mediaContainer.requestFullscreen()
        mediaSessionState.isFullscreen.set(true)
      }
    }
  }

  const toggleExpandedView = () => {
    mediaSessionState.isExpanded.set(!isExpanded)
  }

  const toggleScreenshare = () => {
    MediaStreamState.toggleScreenshare()
  }

  return (
    <div
      id="media-session-container"
      className={twMerge(
        'flex flex-col rounded-lg bg-white p-4 shadow',
        isFullscreen ? 'fixed inset-0 z-50' : '',
        isExpanded && !isFullscreen ? 'fixed bottom-0 right-0 z-40 w-96' : ''
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">{t('mediaSession:mediaSession.title')}</h3>
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={toggleScreenshare}
            className="flex items-center justify-center"
            title={t('mediaSession:mediaSession.startScreenshare')}
          >
            <Screenshare />
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={toggleExpandedView}
            className="flex items-center justify-center"
            title={isExpanded ? t('mediaSession:mediaSession.collapseView') : t('mediaSession:mediaSession.expandView')}
          >
            <Maximize02Lg />
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={toggleFullscreen}
            className="flex items-center justify-center"
            title={
              isFullscreen
                ? t('mediaSession:mediaSession.exitFullscreen')
                : t('mediaSession:mediaSession.enterFullscreen')
            }
          >
            {isFullscreen ? <HiOutlineMinusSm /> : <Expand06Lg />}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="rounded bg-gray-50 p-2">
          <h4 className="mb-2 text-sm font-medium">{t('mediaSession:mediaSession.yourControls')}</h4>
          <MediaControl peerID={Engine.instance.store.peerID} type="cam" />
        </div>
        {peers.length > 0 && (
          <div className="rounded bg-gray-50 p-2">
            <h4 className="mb-2 text-sm font-medium">{t('mediaSession:mediaSession.otherParticipants')}</h4>
            <div className="space-y-2">
              {peers.map((peerID) => (
                <MediaControl key={peerID} peerID={peerID} type="cam" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MediaSessionControls
