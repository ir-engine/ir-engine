import { Mic, MicOff, Videocam, VideocamOff } from '@material-ui/icons'
import { selectAppOnBoardingStep } from '@xrengine/client-core/src/common/reducers/app/selector'
import { selectLocationState } from '@xrengine/client-core/src/social/reducers/location/selector'
import { selectAuthState } from '@xrengine/client-core/src/user/reducers/auth/selector'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { changeFaceTrackingState, updateCamAudioState, updateCamVideoState } from '../../reducers/mediastream/service'
import {
  configureMediaTransports,
  createCamAudioProducer,
  createCamVideoProducer,
  endVideoChat,
  leave,
  pauseProducer,
  resumeProducer
} from '../../transports/SocketWebRTCClientFunctions'
import styles from './MapMediaIconsBox.module.scss'

const mapStateToProps = (state: any): any => {
  return {
    onBoardingStep: selectAppOnBoardingStep(state),
    authState: selectAuthState(state),
    locationState: selectLocationState(state),
    mediastream: state.get('mediastream')
  }
}

const mapDispatchToProps = (dispatch): any => ({
  changeFaceTrackingState: bindActionCreators(changeFaceTrackingState, dispatch)
})

const MediaIconsBox = (props) => {
  const { authState, locationState, mediastream } = props
  const [hasAudioDevice, setHasAudioDevice] = useState(false)
  const [hasVideoDevice, setHasVideoDevice] = useState(false)

  const user = authState.get('user')
  const currentLocation = locationState.get('currentLocation').get('location')

  const videoEnabled = currentLocation.locationSettings ? currentLocation.locationSettings.videoEnabled : false
  const instanceMediaChatEnabled = currentLocation.locationSettings
    ? currentLocation.locationSettings.instanceMediaChatEnabled
    : false

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
    document.removeEventListener('ENGINE_LOADED', onEngineLoaded)
  }
  document.addEventListener('ENGINE_LOADED', onEngineLoaded)

  const checkEndVideoChat = async () => {
    if (
      (MediaStreams.instance.audioPaused || MediaStreams.instance?.camAudioProducer == null) &&
      (MediaStreams.instance.videoPaused || MediaStreams.instance?.camVideoProducer == null)
    ) {
      await endVideoChat({})
      if ((Network.instance.transport as any).channelSocket?.connected === true) await leave(false)
    }
  }
  const handleMicClick = async () => {
    const partyId = currentLocation?.locationSettings?.instanceMediaChatEnabled === true ? 'instance' : user.partyId
    if (await configureMediaTransports(['audio'], partyId)) {
      if (MediaStreams.instance?.camAudioProducer == null) await createCamAudioProducer(partyId)
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
    const partyId = currentLocation?.locationSettings?.instanceMediaChatEnabled === true ? 'instance' : user.partyId
    if (await configureMediaTransports(['video'], partyId)) {
      if (MediaStreams.instance?.camVideoProducer == null) await createCamVideoProducer(partyId)
      else {
        const videoPaused = MediaStreams.instance.toggleVideoPaused()
        if (videoPaused === true) await pauseProducer(MediaStreams.instance?.camVideoProducer)
        else await resumeProducer(MediaStreams.instance?.camVideoProducer)
        checkEndVideoChat()
      }

      updateCamVideoState()
    }
  }

  const VideocamIcon = isCamVideoEnabled ? Videocam : VideocamOff
  const MicIcon = isCamAudioEnabled ? Mic : MicOff

  return (
    <section className={styles.drawerBox}>
      {instanceMediaChatEnabled && hasAudioDevice ? (
        <button
          type="button"
          id="UserAudio"
          className={styles.iconContainer + ' ' + (isCamAudioEnabled ? styles.on : '')}
          onClick={handleMicClick}
        >
          <MicIcon />
        </button>
      ) : null}
      {videoEnabled && hasVideoDevice ? (
        <>
          <button
            type="button"
            id="UserVideo"
            className={styles.iconContainer + ' ' + (isCamVideoEnabled ? styles.on : '')}
            onClick={handleCamClick}
          >
            <VideocamIcon />
          </button>
        </>
      ) : null}
    </section>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(MediaIconsBox)
