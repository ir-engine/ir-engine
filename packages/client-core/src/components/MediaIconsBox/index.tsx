import React, { useEffect, useState } from 'react'

import { VrIcon } from '@xrengine/client-core/src/common/components/Icons/Vricon'
import { useLocationInstanceConnectionState } from '@xrengine/client-core/src/common/services/LocationInstanceConnectionService'
import {
  MediaInstanceConnectionService,
  useMediaInstanceConnectionState
} from '@xrengine/client-core/src/common/services/MediaInstanceConnectionService'
import { MediaStreamService, useMediaStreamState } from '@xrengine/client-core/src/media/services/MediaStreamService'
import { useChatState } from '@xrengine/client-core/src/social/services/ChatService'
import { useLocationState } from '@xrengine/client-core/src/social/services/LocationService'
import {
  configureMediaTransports,
  createCamAudioProducer,
  createCamVideoProducer,
  endVideoChat,
  leave,
  pauseProducer,
  resumeProducer
} from '@xrengine/client-core/src/transports/SocketWebRTCClientFunctions'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import logger from '@xrengine/common/src/logger'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions, useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import {
  startFaceTracking,
  startLipsyncTracking,
  stopFaceTracking,
  stopLipsyncTracking
} from '@xrengine/engine/src/input/functions/WebcamInput'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { dispatchAction } from '@xrengine/hyperflux'

import { Mic, MicOff, Videocam, VideocamOff } from '@mui/icons-material'
import FaceIcon from '@mui/icons-material/Face'

import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport'
import styles from './index.module.scss'

interface Props {
  animate?: any
}
const MediaIconsBox = (props: Props) => {
  const [hasAudioDevice, setHasAudioDevice] = useState(false)
  const [hasVideoDevice, setHasVideoDevice] = useState(false)

  const user = useAuthState().user
  const chatState = useChatState()
  const instanceId = useLocationInstanceConnectionState().currentInstanceId.value
  const channelState = chatState.channels
  const channels = channelState.channels.value
  const channelEntries = Object.values(channels).filter((channel) => !!channel) as any
  const instanceChannel = channelEntries.find((entry) => entry.instanceId === instanceId)
  const currentLocation = useLocationState().currentLocation.location
  const channelConnectionState = useMediaInstanceConnectionState()
  const currentChannelInstanceId = channelConnectionState.currentInstanceId.value
  const currentChannelInstanceConnection = channelConnectionState.instances[currentChannelInstanceId!].ornull
  const mediastream = useMediaStreamState()
  const videoEnabled = currentLocation?.locationSetting?.value
    ? currentLocation?.locationSetting?.videoEnabled?.value
    : false
  const instanceMediaChatEnabled = currentLocation?.locationSetting?.value
    ? currentLocation?.locationSetting?.instanceMediaChatEnabled?.value
    : false

  const isFaceTrackingEnabled = mediastream.isFaceTrackingEnabled
  const isCamVideoEnabled = mediastream.isCamVideoEnabled
  const isCamAudioEnabled = mediastream.isCamAudioEnabled

  const engineState = useEngineState()

  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        devices.forEach((device) => {
          if (device.kind === 'audioinput') setHasAudioDevice(true)
          if (device.kind === 'videoinput') setHasVideoDevice(true)
        })
      })
      .catch((err) => logger.error(err, 'Could not get media devices.'))
  }, [])

  const handleFaceClick = async () => {
    const partyId =
      currentLocation?.locationSetting?.instanceMediaChatEnabled?.value === true
        ? 'instance'
        : user.partyId?.value || 'instance'
    if (isFaceTrackingEnabled.value) {
      MediaStreams.instance.setFaceTracking(false)
      stopFaceTracking()
      stopLipsyncTracking()
      MediaStreamService.updateFaceTrackingState()
    } else {
      const mediaTransport = Network.instance.getTransport('media') as SocketWebRTCClientTransport
      if (await configureMediaTransports(mediaTransport, ['video', 'audio'])) {
        MediaStreams.instance.setFaceTracking(true)
        startFaceTracking()
        startLipsyncTracking()
        MediaStreamService.updateFaceTrackingState()
      }
    }
  }

  const checkEndVideoChat = async () => {
    const mediaTransport = Network.instance.getTransport('media') as SocketWebRTCClientTransport
    if (
      (MediaStreams.instance.audioPaused || MediaStreams.instance?.camAudioProducer == null) &&
      (MediaStreams.instance.videoPaused || MediaStreams.instance?.camVideoProducer == null) &&
      instanceChannel.channelType !== 'instance'
    ) {
      await endVideoChat(mediaTransport, {})
      if (mediaTransport.socket?.connected === true) {
        await leave(mediaTransport, false)
        await MediaInstanceConnectionService.provisionServer(instanceChannel.id)
      }
    }
  }
  const handleMicClick = async () => {
    const mediaTransport = Network.instance.getTransport('media') as SocketWebRTCClientTransport
    if (await configureMediaTransports(mediaTransport, ['audio'])) {
      if (MediaStreams.instance?.camAudioProducer == null) await createCamAudioProducer(mediaTransport)
      else {
        const audioPaused = MediaStreams.instance.toggleAudioPaused()
        if (audioPaused) await pauseProducer(mediaTransport, MediaStreams.instance.camAudioProducer)
        else await resumeProducer(mediaTransport, MediaStreams.instance.camAudioProducer)
        checkEndVideoChat()
      }
      MediaStreamService.updateCamAudioState()
    }
  }

  const handleCamClick = async () => {
    const mediaTransport = Network.instance.getTransport('media') as SocketWebRTCClientTransport
    if (await configureMediaTransports(mediaTransport, ['video'])) {
      if (MediaStreams.instance?.camVideoProducer == null) await createCamVideoProducer(mediaTransport)
      else {
        const videoPaused = MediaStreams.instance.toggleVideoPaused()
        if (videoPaused) await pauseProducer(mediaTransport, MediaStreams.instance.camVideoProducer)
        else await resumeProducer(mediaTransport, MediaStreams.instance.camVideoProducer)
        checkEndVideoChat()
      }

      MediaStreamService.updateCamVideoState()
    }
  }

  const handleVRClick = () => dispatchAction(Engine.instance.store, EngineActions.xrStart())

  const VideocamIcon = isCamVideoEnabled.value ? Videocam : VideocamOff
  const MicIcon = isCamAudioEnabled.value ? Mic : MicOff

  return (
    <section className={`${styles.drawerBox} ${props.animate}`}>
      {instanceMediaChatEnabled &&
      hasAudioDevice &&
      currentChannelInstanceId &&
      currentChannelInstanceConnection.connected.value ? (
        <button
          type="button"
          id="UserAudio"
          className={styles.iconContainer + ' ' + (isCamAudioEnabled.value ? styles.on : '')}
          onClick={handleMicClick}
        >
          <MicIcon />
        </button>
      ) : null}
      {videoEnabled &&
      hasVideoDevice &&
      currentChannelInstanceId &&
      currentChannelInstanceConnection.connected.value ? (
        <>
          <button
            type="button"
            id="UserVideo"
            className={styles.iconContainer + ' ' + (isCamVideoEnabled.value ? styles.on : '')}
            onClick={handleCamClick}
          >
            <VideocamIcon />
          </button>
          {
            <button
              type="button"
              id="UserFaceTracking"
              className={styles.iconContainer + ' ' + (isFaceTrackingEnabled.value ? styles.on : '')}
              onClick={handleFaceClick}
            >
              <FaceIcon />
            </button>
          }
        </>
      ) : null}
      {engineState.xrSupported.value ? (
        <button type="button" id="UserXR" className={styles.iconContainer} onClick={handleVRClick}>
          <VrIcon />
        </button>
      ) : null}
    </section>
  )
}

export default MediaIconsBox
