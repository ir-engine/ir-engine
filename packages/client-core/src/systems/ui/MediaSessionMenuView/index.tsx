import { createState } from '@hookstate/core'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { Channel } from '@xrengine/common/src/interfaces/Channel'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { WidgetAppService } from '@xrengine/engine/src/xrui/WidgetAppService'
import { WidgetName } from '@xrengine/engine/src/xrui/Widgets'

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

import { MediaInstanceConnectionService } from '../../../common/services/MediaInstanceConnectionService'
import { MediaStreamService, useMediaStreamState } from '../../../media/services/MediaStreamService'
import {
  startFaceTracking,
  startLipsyncTracking,
  stopFaceTracking,
  stopLipsyncTracking
} from '../../../media/webcam/WebcamInput'
import { useChatState } from '../../../social/services/ChatService'
import { MediaStreams } from '../../../transports/MediaStreams'
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
import styleString from './index.scss'

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
      (MediaStreams.instance.audioPaused || MediaStreams.instance.camAudioProducer == null) &&
      (MediaStreams.instance.videoPaused || MediaStreams.instance.camVideoProducer == null) &&
      instanceChannel.channelType !== 'instance'
    ) {
      await endVideoChat(mediaNetwork, {})
      if (mediaNetwork.socket?.connected === true) {
        await leaveNetwork(mediaNetwork, false)
        await MediaInstanceConnectionService.provisionServer(instanceChannel.id)
      }
    }
  }

  const handleToggleAudio = async () => {
    const mediaNetwork = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
    if (await configureMediaTransports(mediaNetwork, ['audio'])) {
      if (MediaStreams.instance.camAudioProducer == null) await createCamAudioProducer(mediaNetwork)
      else {
        const audioPaused = MediaStreams.instance.toggleAudioPaused()
        if (audioPaused) await pauseProducer(mediaNetwork, MediaStreams.instance.camAudioProducer)
        else await resumeProducer(mediaNetwork, MediaStreams.instance.camAudioProducer)
        checkEndVideoChat()
      }
      MediaStreamService.updateCamAudioState()
    }
  }

  const handleToggleFaceTracking = async () => {
    if (isFaceTrackingEnabled.value) {
      MediaStreams.instance.setFaceTracking(false)
      stopFaceTracking()
      stopLipsyncTracking()
      MediaStreamService.updateFaceTrackingState()
    } else {
      const mediaNetwork = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
      if (await configureMediaTransports(mediaNetwork, ['video', 'audio'])) {
        MediaStreams.instance.setFaceTracking(true)
        startFaceTracking()
        startLipsyncTracking()
        MediaStreamService.updateFaceTrackingState()
      }
    }
  }

  const handleToggleVideo = async () => {
    const mediaNetwork = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
    if (await configureMediaTransports(mediaNetwork, ['video'])) {
      if (MediaStreams.instance.camVideoProducer == null) await createCamVideoProducer(mediaNetwork)
      else {
        const videoPaused = MediaStreams.instance.toggleVideoPaused()
        if (videoPaused) await pauseProducer(mediaNetwork, MediaStreams.instance.camVideoProducer)
        else await resumeProducer(mediaNetwork, MediaStreams.instance.camVideoProducer)
        checkEndVideoChat()
      }

      MediaStreamService.updateCamVideoState()
    }
  }

  const handleToggleScreenShare = async () => {
    const mediaNetwork = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
    if (!MediaStreams.instance.screenVideoProducer) await startScreenshare(mediaNetwork)
    else await stopScreenshare(mediaNetwork)
  }

  const handleOpenChatMenuWidget = () => {
    WidgetAppService.setWidgetVisibility(WidgetName.CHAT, true)
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
