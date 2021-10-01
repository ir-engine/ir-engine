import React, { useEffect, useState } from 'react'
import { Mic, MicOff, Videocam, VideocamOff } from '@material-ui/icons'
import FaceIcon from '@material-ui/icons/Face'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import styles from './MediaIconsBox.module.scss'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { selectChatState } from '@xrengine/client-core/src/social/reducers/chat/selector'
import {
  configureMediaTransports,
  createCamAudioProducer,
  createCamVideoProducer,
  endVideoChat,
  leave,
  pauseProducer,
  resumeProducer
} from '../../transports/SocketWebRTCClientFunctions'
import { useAuthState } from '@xrengine/client-core/src/user/reducers/auth/AuthState'
import { selectLocationState } from '@xrengine/client-core/src/social/reducers/location/selector'
import { updateCamAudioState, updateCamVideoState, changeFaceTrackingState } from '../../reducers/mediastream/service'
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
import { selectChannelConnectionState } from '../../reducers/channelConnection/selector'

const mapStateToProps = (state: any): any => {
  return {
    locationState: selectLocationState(state),
    mediastream: state.get('mediastream'),
    chatState: selectChatState(state),
    channelConnectionState: selectChannelConnectionState(state)
  }
}

const mapDispatchToProps = (dispatch): any => ({
  changeFaceTrackingState: bindActionCreators(changeFaceTrackingState, dispatch)
})

const MediaIconsBox = (props) => {
  const { locationState, mediastream, chatState, changeFaceTrackingState, channelConnectionState } = props
  const [xrSupported, setXRSupported] = useState(false)
  const [hasAudioDevice, setHasAudioDevice] = useState(false)
  const [hasVideoDevice, setHasVideoDevice] = useState(false)

  const user = useAuthState().user
  const channelState = chatState.get('channels')
  const channels = channelState.get('channels')
  const channelEntries = [...channels.entries()]
  const instanceChannel = channelEntries.find((entry) => entry[1].instanceId != null)
  const currentLocation = locationState.get('currentLocation').get('location')

  const videoEnabled = currentLocation.locationSettings ? currentLocation.locationSettings.videoEnabled : false
  const instanceMediaChatEnabled = currentLocation.locationSettings
    ? currentLocation.locationSettings.instanceMediaChatEnabled
    : false

  const isFaceTrackingEnabled = mediastream.get('isFaceTrackingEnabled')
  const isCamVideoEnabled = mediastream.get('isCamVideoEnabled')
  const isCamAudioEnabled = mediastream.get('isCamAudioEnabled')

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
      currentLocation?.locationSettings?.instanceMediaChatEnabled === true ? 'instance' : user.partyId.value
    if (isFaceTrackingEnabled) {
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
    if (await configureMediaTransports(['audio'], 'instance', instanceChannel[0])) {
      if (MediaStreams.instance?.camAudioProducer == null) await createCamAudioProducer('instance', instanceChannel[0])
      else {
        const audioPaused = MediaStreams.instance.toggleAudioPaused()
        if (audioPaused === true) await pauseProducer(MediaStreams.instance?.camAudioProducer)
        else await resumeProducer(MediaStreams.instance?.camAudioProducer)
        checkEndVideoChat()
      }
      updateCamAudioState()
    }
  }

  const handleCamClick = async () => {
    if (await configureMediaTransports(['video'], 'instance', instanceChannel[0])) {
      if (MediaStreams.instance?.camVideoProducer == null) await createCamVideoProducer('instance', instanceChannel[0])
      else {
        const videoPaused = MediaStreams.instance.toggleVideoPaused()
        if (videoPaused === true) await pauseProducer(MediaStreams.instance?.camVideoProducer)
        else await resumeProducer(MediaStreams.instance?.camVideoProducer)
        checkEndVideoChat()
      }

      updateCamVideoState()
    }
  }

  const handleVRClick = () => EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.XR_START })

  const xrEnabled = Engine.xrSupported === true
  const VideocamIcon = isCamVideoEnabled ? Videocam : VideocamOff
  const MicIcon = isCamAudioEnabled ? Mic : MicOff

  return (
    <section className={styles.drawerBox}>
      {instanceMediaChatEnabled && hasAudioDevice && channelConnectionState.get('connected') === true ? (
        <button
          type="button"
          id="UserAudio"
          className={styles.iconContainer + ' ' + (isCamAudioEnabled ? styles.on : '')}
          onClick={handleMicClick}
        >
          <MicIcon />
        </button>
      ) : null}
      {videoEnabled && hasVideoDevice && channelConnectionState.get('connected') === true ? (
        <>
          <button
            type="button"
            id="UserVideo"
            className={styles.iconContainer + ' ' + (isCamVideoEnabled ? styles.on : '')}
            onClick={handleCamClick}
          >
            <VideocamIcon />
          </button>
          {
            <button
              type="button"
              id="UserFaceTracking"
              className={styles.iconContainer + ' ' + (isFaceTrackingEnabled ? styles.on : '')}
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

export default connect(mapStateToProps, mapDispatchToProps)(MediaIconsBox)
