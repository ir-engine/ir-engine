import { createState } from '@speigg/hookstate'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'

import {
  Chat,
  Face,
  FaceRetouchingOff,
  Mic,
  MicOff,
  ScreenShare,
  StopScreenShare,
  Videocam,
  VideocamOff
} from '@mui/icons-material'

import { useMediaStreamState } from '../../../media/services/MediaStreamService'
import XRTextButton from '../../components/XRTextButton'
import styleString from './index.scss'

export function createMediaSessionMenuView() {
  return createXRUI(MediaSessionMenuView, createMediaSessionMenuState())
}

function createMediaSessionMenuState() {
  return createState({})
}

const MediaSessionMenuView = () => {
  const { t } = useTranslation()
  const mediastream = useMediaStreamState()

  const isFaceTrackingEnabled = mediastream.isFaceTrackingEnabled
  const isCamVideoEnabled = mediastream.isCamVideoEnabled
  const isCamAudioEnabled = mediastream.isCamAudioEnabled
  const isScreenVideoEnabled = mediastream.isScreenVideoEnabled

  const handleToggleAudio = () => {
    // TODO toggle audio here...
  }

  const handleToggleVideo = () => {
    // TODO toggle video here...
  }

  const handleToggleFaceTracking = () => {
    // TODO toggle face tracking here...
  }

  const handleToggleScreenShare = () => {
    // TODO toggle screen share here...
  }

  const handleOpenChatMenuWidget = () => {
    // TODO open admin controls menu here...
  }

  const MicIcon = isCamAudioEnabled.value ? Mic : MicOff
  const VideocamIcon = isCamVideoEnabled.value ? Videocam : VideocamOff
  const FaceTrackingIcon = isFaceTrackingEnabled.value ? Face : FaceRetouchingOff
  const ScreenShareIcon = isScreenVideoEnabled.value ? ScreenShare : StopScreenShare

  return (
    <>
      <style>{styleString}</style>
      <div className="container" xr-layer="true">
        <h3 className="heading">{t('user:usermenu.mediaSession.containerHeading')}</h3>
        <XRTextButton onClick={handleToggleAudio}>
          <MicIcon />
          {t('user:usermenu.mediaSession.btn-audio')}
        </XRTextButton>
        <XRTextButton onClick={handleToggleVideo}>
          <VideocamIcon />
          {t('user:usermenu.mediaSession.btn-video')}
        </XRTextButton>
        <XRTextButton onClick={handleToggleFaceTracking}>
          <FaceTrackingIcon />
          {t('user:usermenu.mediaSession.btn-faceTracking')}
        </XRTextButton>
        <XRTextButton onClick={handleToggleScreenShare}>
          <ScreenShareIcon />
          {t('user:usermenu.mediaSession.btn-screenShare')}
        </XRTextButton>
        <XRTextButton onClick={handleOpenChatMenuWidget}>
          <Chat />
          {t('user:usermenu.mediaSession.btn-chat')}
        </XRTextButton>
      </div>
    </>
  )
}

export default MediaSessionMenuView
