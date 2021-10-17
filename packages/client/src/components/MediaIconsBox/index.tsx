import React, { useEffect, useState } from 'react'
import { Mic, MicOff, Videocam, VideocamOff } from '@material-ui/icons'
import FaceIcon from '@material-ui/icons/Face'
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
import { useAuthState } from '@xrengine/client-core/src/user/state/AuthState'
import {
  startFaceTracking,
  startLipsyncTracking,
  stopFaceTracking,
  stopLipsyncTracking
} from '@xrengine/engine/src/input/functions/WebcamInput'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { VrIcon } from '@xrengine/client-core/src/common/components/Icons/Vricon'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { useChatState } from '@xrengine/client-core/src/social/state/ChatState'
import { useLocationState } from '@xrengine/client-core/src/social/state/LocationState'
import { useChannelConnectionState } from '@xrengine/client-core/src/common/state/ChannelConnectionState'
import { useMediaStreamState } from '@xrengine/client-core/src/media/state/MediaStreamState'
import { MediaStreamService } from '@xrengine/client-core/src/media/state/MediaStreamService'

const MediaIconsBox = (props) => {
  const [xrSupported, setXRSupported] = useState(false)
  const [hasAudioDevice, setHasAudioDevice] = useState(false)
  const [hasVideoDevice, setHasVideoDevice] = useState(false)

  const user = useAuthState().user
  const chatState = useChatState()
  const channelState = chatState.channels
  const channels = channelState.channels.value
  const channelEntries = Object.values(channels).filter((channel) => !!channel) as any
  const instanceChannel = channelEntries.find((entry) => entry.instanceId != null)
  const currentLocation = useLocationState().currentLocation.location
  const channelConnectionState = useChannelConnectionState()
  const mediastream = useMediaStreamState()
  const videoEnabled = currentLocation?.location_settings?.value
    ? currentLocation?.location_settings?.videoEnabled?.value
    : false
  const instanceMediaChatEnabled = currentLocation?.location_settings?.value
    ? currentLocation?.location_settings?.instanceMediaChatEnabled?.value
    : false

  const isFaceTrackingEnabled = mediastream.isFaceTrackingEnabled
  const isCamVideoEnabled = mediastream.isCamVideoEnabled
  const isCamAudioEnabled = mediastream.isCamAudioEnabled

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

  const onEngineLoaded = () => {
    EngineEvents.instance.once(EngineEvents.EVENTS.JOINED_WORLD, () => setXRSupported(Engine.xrSupported))
    document.removeEventListener('ENGINE_LOADED', onEngineLoaded)
  }
  document.addEventListener('ENGINE_LOADED', onEngineLoaded)

  const handleFaceClick = async () => {
    const partyId =
      currentLocation?.location_settings?.instanceMediaChatEnabled?.value === true
        ? 'instance'
        : user.partyId?.value || 'instance'
    if (isFaceTrackingEnabled.value) {
      stopFaceTracking()
      stopLipsyncTracking()
    } else {
      if (await configureMediaTransports(['video', 'audio'], partyId)) {
        startFaceTracking()
        startLipsyncTracking()
      }
    }
  }

  const checkEndVideoChat = async () => {
    if (
      (MediaStreams.instance.audioPaused || MediaStreams.instance?.camAudioProducer == null) &&
      (MediaStreams.instance.videoPaused || MediaStreams.instance?.camVideoProducer == null) &&
      (Network.instance.transport as any).channelType !== 'instance'
    ) {
      await endVideoChat({})
      if ((Network.instance.transport as any).channelSocket?.connected === true) await leave(false)
    }
  }
  const handleMicClick = async () => {
    if (await configureMediaTransports(['audio'], 'instance', instanceChannel.id)) {
      if (MediaStreams.instance?.camAudioProducer == null) await createCamAudioProducer('instance', instanceChannel.id)
      else {
        const audioPaused = MediaStreams.instance.toggleAudioPaused()
        if (audioPaused === true) await pauseProducer(MediaStreams.instance?.camAudioProducer)
        else await resumeProducer(MediaStreams.instance?.camAudioProducer)
        checkEndVideoChat()
      }
      MediaStreamService.updateCamAudioState()
    }
  }

  const handleCamClick = async () => {
    if (await configureMediaTransports(['video'], 'instance', instanceChannel.id)) {
      if (MediaStreams.instance?.camVideoProducer == null) await createCamVideoProducer('instance', instanceChannel.id)
      else {
        const videoPaused = MediaStreams.instance.toggleVideoPaused()
        if (videoPaused === true) await pauseProducer(MediaStreams.instance?.camVideoProducer)
        else await resumeProducer(MediaStreams.instance?.camVideoProducer)
        checkEndVideoChat()
      }

      MediaStreamService.updateCamVideoState()
    }
  }

  const handleVRClick = () => EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.XR_START })

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
