import React from 'react'
import { useTranslation } from 'react-i18next'

import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { WidgetAppService } from '@etherealengine/engine/src/xrui/WidgetAppService'
import { WidgetName } from '@etherealengine/engine/src/xrui/Widgets'
import { createState, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import { MediaStreamState } from '../../../transports/MediaStreams'
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

  const mediaStreamState = useHookstate(getMutableState(MediaStreamState))
  const isMotionCaptureEnabled = mediaStreamState.faceTracking.value
  const isCamVideoEnabled = mediaStreamState.camVideoProducer.value != null && !mediaStreamState.videoPaused.value
  const isCamAudioEnabled = mediaStreamState.camAudioProducer.value != null && !mediaStreamState.audioPaused.value
  const isScreenVideoEnabled =
    mediaStreamState.screenVideoProducer.value != null && !mediaStreamState.screenShareVideoPaused.value

  const handleOpenChatMenuWidget = () => {
    WidgetAppService.setWidgetVisibility(WidgetName.CHAT, true)
  }

  return (
    <>
      <style>{styleString}</style>
      <div className="container" xr-layer="true">
        <h3 className="heading">{t('user:usermenu.mediaSession.containerHeading')}</h3>
        <XRTextButton onClick={toggleMicrophonePaused}>
          <Icon type={isCamAudioEnabled ? 'Mic' : 'MicOff'} />
          {t('user:usermenu.mediaSession.btn-audio')}
        </XRTextButton>
        <XRTextButton onClick={toggleWebcamPaused}>
          <Icon type={isCamVideoEnabled ? 'Videocam' : 'VideocamOff'} />
          {t('user:usermenu.mediaSession.btn-video')}
        </XRTextButton>
        <XRTextButton onClick={toggleFaceTracking}>
          <Icon type={isMotionCaptureEnabled ? 'Face' : 'FaceRetouchingOff'} />
          {t('user:usermenu.mediaSession.btn-faceTracking')}
        </XRTextButton>
        <XRTextButton onClick={toggleScreenshare}>
          <Icon type={isScreenVideoEnabled ? 'ScreenShare' : 'StopScreenShare'} />
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
