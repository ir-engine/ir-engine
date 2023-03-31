import { createState } from '@hookstate/core'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { WidgetAppService } from '@etherealengine/engine/src/xrui/WidgetAppService'
import { WidgetName } from '@etherealengine/engine/src/xrui/Widgets'
import Icon from '@etherealengine/ui/src/Icon'

import { useMediaStreamState } from '../../../media/services/MediaStreamService'
import {
  toggleFaceTracking,
  toggleMicrophonePaused,
  toggleScreenshare,
  toggleWebcamPaused
} from '../../../transports/SocketWebRTCClientFunctions'
import XRTextButton from '../../components/XRTextButton'
import styleString from './index.scss?inline'

export function createMediaSessionMenuView() {
  return createXRUI(MediaSessionMenuView, createMediaSessionMenuState())
}

function createMediaSessionMenuState() {
  return createState({})
}

const MediaSessionMenuView = () => {
  const { t } = useTranslation()
  const mediastream = useMediaStreamState()

  const isFaceTrackingEnabled = mediastream.isMotionCaptureEnabled
  const isCamVideoEnabled = mediastream.isCamVideoEnabled
  const isCamAudioEnabled = mediastream.isCamAudioEnabled
  const isScreenVideoEnabled = mediastream.isScreenVideoEnabled

  const handleOpenChatMenuWidget = () => {
    WidgetAppService.setWidgetVisibility(WidgetName.CHAT, true)
  }

  return (
    <>
      <style>{styleString}</style>
      <div className="container" xr-layer="true">
        <h3 className="heading">{t('user:usermenu.mediaSession.containerHeading')}</h3>
        <XRTextButton onClick={toggleMicrophonePaused}>
          <Icon type={isCamAudioEnabled.value ? 'Mic' : 'MicOff'} />
          {t('user:usermenu.mediaSession.btn-audio')}
        </XRTextButton>
        <XRTextButton onClick={toggleWebcamPaused}>
          <Icon type={isCamVideoEnabled.value ? 'Videocam' : 'VideocamOff'} />
          {t('user:usermenu.mediaSession.btn-video')}
        </XRTextButton>
        <XRTextButton onClick={toggleFaceTracking}>
          <Icon type={isFaceTrackingEnabled.value ? 'Face' : 'FaceRetouchingOff'} />
          {t('user:usermenu.mediaSession.btn-faceTracking')}
        </XRTextButton>
        <XRTextButton onClick={toggleScreenshare}>
          <Icon type={isScreenVideoEnabled.value ? 'ScreenShare' : 'StopScreenShare'} />
          {t('user:usermenu.mediaSession.btn-screenShare')}
        </XRTextButton>
        <XRTextButton onClick={handleOpenChatMenuWidget}>
          <Icon type="Chat" />
          {t('user:usermenu.mediaSession.btn-chat')}
        </XRTextButton>
      </div>
    </>
  )
}

export default MediaSessionMenuView
