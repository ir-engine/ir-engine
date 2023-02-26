import { createState, useHookstate } from '@hookstate/core'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { Channel } from '@xrengine/common/src/interfaces/Channel'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { WidgetAppService } from '@xrengine/engine/src/xrui/WidgetAppService'
import { WidgetName } from '@xrengine/engine/src/xrui/Widgets'
import { getState } from '@xrengine/hyperflux'
import Icon from '@xrengine/ui/src/Icon'

import { MediaInstanceConnectionService } from '../../../common/services/MediaInstanceConnectionService'
import { MediaStreamService, useMediaStreamState } from '../../../media/services/MediaStreamService'
import {
  startFaceTracking,
  startLipsyncTracking,
  stopFaceTracking,
  stopLipsyncTracking
} from '../../../media/webcam/WebcamInput'
import { useChatState } from '../../../social/services/ChatService'
import { MediaStreamState } from '../../../transports/MediaStreams'
import {
  configureMediaTransports,
  createCamAudioProducer,
  createCamVideoProducer,
  endVideoChat,
  leaveNetwork,
  pauseProducer,
  resumeProducer,
  startScreenshare,
  stopScreenshare
} from '../../../transports/SocketWebRTCClientFunctions'
import { SocketWebRTCClientNetwork } from '../../../transports/SocketWebRTCClientNetwork'
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
  const chatState = useChatState()
  const mediastream = useMediaStreamState()
  const mediaStreamState = useHookstate(getState(MediaStreamState))

  const isFaceTrackingEnabled = mediastream.isFaceTrackingEnabled
  const isCamVideoEnabled = mediastream.isCamVideoEnabled
  const isCamAudioEnabled = mediastream.isCamAudioEnabled
  const isScreenVideoEnabled = mediastream.isScreenVideoEnabled

  const channelState = chatState.channels
  const channels = channelState.channels.value as Channel[]

  const channelEntries = Object.values(channels).filter((channel) => !!channel) as any
  const instanceChannel = channelEntries.find(
    (entry) => entry.instanceId === Engine.instance.currentWorld.worldNetwork?.hostId
  )

  const checkEndVideoChat = async () => {
    const mediaNetwork = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
    if (
      (mediaStreamState.audioPaused.value || mediaStreamState.camAudioProducer.value == null) &&
      (mediaStreamState.videoPaused.value || mediaStreamState.camVideoProducer.value == null) &&
      instanceChannel.channelType !== 'instance'
    ) {
      await endVideoChat(mediaNetwork, {})
      if (!mediaNetwork.primus?.disconnect) {
        await leaveNetwork(mediaNetwork, false)
        await MediaInstanceConnectionService.provisionServer(instanceChannel.id)
      }
    }
  }

  const handleToggleAudio = async () => {
    const mediaNetwork = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
    if (await configureMediaTransports(mediaNetwork, ['audio'])) {
      if (mediaStreamState.camAudioProducer.value == null) await createCamAudioProducer(mediaNetwork)
      else {
        const audioPaused = mediaStreamState.audioPaused.value
        mediaStreamState.audioPaused.set(!audioPaused)
        if (!audioPaused) await pauseProducer(mediaNetwork, mediaStreamState.camAudioProducer.value)
        else await resumeProducer(mediaNetwork, mediaStreamState.camAudioProducer.value)
        checkEndVideoChat()
      }
      MediaStreamService.updateCamAudioState()
    }
  }

  const handleToggleFaceTracking = async () => {
    if (isFaceTrackingEnabled.value) {
      mediaStreamState.faceTracking.set(false)
      stopFaceTracking()
      stopLipsyncTracking()
      MediaStreamService.updateFaceTrackingState()
    } else {
      const mediaNetwork = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
      if (await configureMediaTransports(mediaNetwork, ['video', 'audio'])) {
        mediaStreamState.faceTracking.set(true)
        startFaceTracking()
        startLipsyncTracking()
        MediaStreamService.updateFaceTrackingState()
      }
    }
  }

  const handleToggleVideo = async () => {
    const mediaNetwork = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
    if (await configureMediaTransports(mediaNetwork, ['video'])) {
      if (mediaStreamState.camVideoProducer.value == null) await createCamVideoProducer(mediaNetwork)
      else {
        const videoPaused = mediaStreamState.videoPaused.value
        mediaStreamState.videoPaused.set(!videoPaused)
        if (!videoPaused) await pauseProducer(mediaNetwork, mediaStreamState.camVideoProducer.value)
        else await resumeProducer(mediaNetwork, mediaStreamState.camVideoProducer.value)
        checkEndVideoChat()
      }

      MediaStreamService.updateCamVideoState()
    }
  }

  const handleToggleScreenShare = async () => {
    const mediaNetwork = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
    if (!mediaStreamState.screenVideoProducer.value) await startScreenshare(mediaNetwork)
    else await stopScreenshare(mediaNetwork)
  }

  const handleOpenChatMenuWidget = () => {
    WidgetAppService.setWidgetVisibility(WidgetName.CHAT, true)
  }
  return (
    <>
      <style>{styleString}</style>
      <div className="container" xr-layer="true">
        <h3 className="heading">{t('user:usermenu.mediaSession.containerHeading')}</h3>
        <XRTextButton onClick={handleToggleAudio}>
          <Icon type={isCamAudioEnabled.value ? 'Mic' : 'MicOff'} />
          {t('user:usermenu.mediaSession.btn-audio')}
        </XRTextButton>
        <XRTextButton onClick={handleToggleVideo}>
          <Icon type={isCamVideoEnabled.value ? 'Videocam' : 'VideocamOff'} />
          {t('user:usermenu.mediaSession.btn-video')}
        </XRTextButton>
        <XRTextButton onClick={handleToggleFaceTracking}>
          <Icon type={isFaceTrackingEnabled.value ? 'Face' : 'FaceRetouchingOff'} />
          {t('user:usermenu.mediaSession.btn-faceTracking')}
        </XRTextButton>
        <XRTextButton onClick={handleToggleScreenShare}>
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
