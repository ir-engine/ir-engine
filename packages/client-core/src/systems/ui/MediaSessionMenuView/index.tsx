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

/** @deprecated */
export function createMediaSessionMenuView() {
  return createXRUI(MediaSessionMenuView, createMediaSessionMenuState())
}

function createMediaSessionMenuState() {
  return createState({})
}
/** @deprecated */
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
