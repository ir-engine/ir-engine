import React, { useEffect, useState } from 'react'
import { Mic, MicOff, Videocam, VideocamOff } from '@mui/icons-material'
import FaceIcon from '@mui/icons-material/Face'
import styles from './MediaIconsBox.module.scss'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
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
import {
  startFaceTracking,
  startLipsyncTracking,
  stopFaceTracking,
  stopLipsyncTracking
} from '@xrengine/engine/src/input/functions/WebcamInput'
import { VrIcon } from '@xrengine/client-core/src/common/components/Icons/Vricon'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { useChatState } from '@xrengine/client-core/src/social/services/ChatService'
import { useLocationState } from '@xrengine/client-core/src/social/services/LocationService'
import { useInstanceConnectionState } from '@xrengine/client-core/src/common/services/InstanceConnectionService'
import {
  ChannelConnectionService,
  useChannelConnectionState
} from '@xrengine/client-core/src/common/services/ChannelConnectionService'
import { useMediaStreamState } from '@xrengine/client-core/src/media/services/MediaStreamService'
import { MediaStreamService } from '@xrengine/client-core/src/media/services/MediaStreamService'
import { dispatchLocal } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import { EngineActions, useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'
import { getMediaTransport } from '@xrengine/client-core/src/transports/SocketWebRTCClientTransport'

const MediaIconsBox = (props) => {
  const [xrSupported, setXRSupported] = useState(false)
  const [hasAudioDevice, setHasAudioDevice] = useState(false)
  const [hasVideoDevice, setHasVideoDevice] = useState(false)

  const user = useAuthState().user
  const chatState = useChatState()
  const instanceId = useInstanceConnectionState().instance.id.value
  const channelState = chatState.channels
  const channels = channelState.channels.value
  const channelEntries = Object.values(channels).filter((channel) => !!channel) as any
  const instanceChannel = channelEntries.find((entry) => entry.instanceId === instanceId)
  const currentLocation = useLocationState().currentLocation.location
  const channelConnectionState = useChannelConnectionState()
  const mediastream = useMediaStreamState()
  const videoEnabled = currentLocation?.locationSettings?.value
    ? currentLocation?.locationSettings?.videoEnabled?.value
    : false
  const instanceMediaChatEnabled = currentLocation?.locationSettings?.value
    ? currentLocation?.locationSettings?.instanceMediaChatEnabled?.value
    : false

  const isFaceTrackingEnabled = mediastream.isFaceTrackingEnabled
  const isCamVideoEnabled = mediastream.isCamVideoEnabled
  const isCamAudioEnabled = mediastream.isCamAudioEnabled

  const engineState = useEngineState()
  let callbackDone = false

  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        devices.forEach((device) => {
          if (device.kind === 'audioinput') setHasAudioDevice(true)
          if (device.kind === 'videoinput') setHasVideoDevice(true)
        })
      })
      .catch((err) => console.log('could not get media devices', err))
  }, [])

  useEffect(() => {
    if (engineState.joinedWorld.value && !callbackDone) {
      setXRSupported(Engine.xrSupported)
      callbackDone = true
    }
  }, [engineState.joinedWorld.value])

  const handleFaceClick = async () => {
    const partyId =
      currentLocation?.locationSettings?.instanceMediaChatEnabled?.value === true
        ? 'instance'
        : user.partyId?.value || 'instance'
    if (isFaceTrackingEnabled.value) {
      stopFaceTracking()
      stopLipsyncTracking()
    } else {
      const mediaTransport = getMediaTransport()
      if (await configureMediaTransports(mediaTransport, ['video', 'audio'])) {
        startFaceTracking()
        startLipsyncTracking()
      }
    }
  }

  const checkEndVideoChat = async () => {
    const mediaTransport = getMediaTransport()
    if (
      (MediaStreams.instance.audioPaused || MediaStreams.instance?.camAudioProducer == null) &&
      (MediaStreams.instance.videoPaused || MediaStreams.instance?.camVideoProducer == null) &&
      mediaTransport.channelType !== 'instance'
    ) {
      await endVideoChat(mediaTransport, {})
      if (mediaTransport.socket?.connected === true) {
        await leave(mediaTransport, false)
        await ChannelConnectionService.provisionChannelServer(instanceChannel.id)
      }
    }
  }
  const handleMicClick = async () => {
    const mediaTransport = getMediaTransport()
    if (await configureMediaTransports(mediaTransport, ['audio'])) {
      if (MediaStreams.instance?.camAudioProducer == null) await createCamAudioProducer(mediaTransport)
      else {
        const audioPaused = MediaStreams.instance.toggleAudioPaused()
        if (audioPaused === true) await pauseProducer(mediaTransport, MediaStreams.instance.camAudioProducer)
        else await resumeProducer(mediaTransport, MediaStreams.instance.camAudioProducer)
        checkEndVideoChat()
      }
      MediaStreamService.updateCamAudioState()
    }
  }

  const handleCamClick = async () => {
    const mediaTransport = getMediaTransport()
    if (await configureMediaTransports(mediaTransport, ['video'])) {
      if (MediaStreams.instance?.camVideoProducer == null) await createCamVideoProducer(mediaTransport)
      else {
        const videoPaused = MediaStreams.instance.toggleVideoPaused()
        if (videoPaused === true) await pauseProducer(mediaTransport, MediaStreams.instance.camVideoProducer)
        else await resumeProducer(mediaTransport, MediaStreams.instance.camVideoProducer)
        checkEndVideoChat()
      }

      MediaStreamService.updateCamVideoState()
    }
  }

  const handleVRClick = () => dispatchLocal(EngineActions.xrStart() as any)

  const xrEnabled = Engine.xrSupported === true
  const VideocamIcon = isCamVideoEnabled.value ? Videocam : VideocamOff
  const MicIcon = isCamAudioEnabled.value ? Mic : MicOff

  return (
    <section className={styles.drawerBox}>
      {instanceMediaChatEnabled && hasAudioDevice && channelConnectionState.connected.value === true ? (
        <button
          type="button"
          id="UserAudio"
          className={styles.iconContainer + ' ' + (isCamAudioEnabled.value ? styles.on : '')}
          onClick={handleMicClick}
        >
          <MicIcon />
        </button>
      ) : null}
      {videoEnabled && hasVideoDevice && channelConnectionState.connected.value === true ? (
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
      {xrSupported ? (
        <button
          type="button"
          id="UserXR"
          className={styles.iconContainer + ' ' + (!xrEnabled ? '' : styles.on)}
          onClick={handleVRClick}
        >
          <VrIcon />
        </button>
      ) : null}
    </section>
  )
}

export default MediaIconsBox
