import { Mic, MicOff, Videocam, VideocamOff } from '@material-ui/icons'
import { selectAppOnBoardingStep } from '@xrengine/client-core/src/common/reducers/app/selector'
import { selectLocationState } from '@xrengine/client-core/src/social/reducers/location/selector'
import { selectAuthState } from '@xrengine/client-core/src/user/reducers/auth/selector'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import THREE, { Vector3 } from 'three'
import { PI } from '../../../../engine/src/common/constants/MathConstants'
import { Engine } from '../../../../engine/src/ecs/classes/Engine'
import { getComponent } from '../../../../engine/src/ecs/functions/EntityFunctions'
import { updateMap } from '../../../../engine/src/map'
import { llToScene } from '../../../../engine/src/map/MeshBuilder'
import { Object3DComponent } from '../../../../engine/src/scene/components/Object3DComponent'
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
// @ts-ignore
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

  const user = authState.get('user')
  const currentLocation = locationState.get('currentLocation').get('location')

  const videoEnabled = currentLocation.locationSettings ? currentLocation.locationSettings.videoEnabled : false
  const instanceMediaChatEnabled = currentLocation.locationSettings
    ? currentLocation.locationSettings.instanceMediaChatEnabled
    : false

  const isCamVideoEnabled = mediastream.get('isCamVideoEnabled')
  const isCamAudioEnabled = mediastream.get('isCamAudioEnabled')

  const onEngineLoaded = () => {
    document.removeEventListener('ENGINE_LOADED', onEngineLoaded)
  }
  document.addEventListener('ENGINE_LOADED', onEngineLoaded)

  const checkMediaStream = async (partyId: string): Promise<boolean> => {
    return await configureMediaTransports(partyId)
  }

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
    if (await checkMediaStream(partyId)) {
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
    if (await checkMediaStream(partyId)) {
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

  const handleUpdateMappa = async () => {
    const position = getComponent(Network.instance.localClientEntity, Object3DComponent).value.position
    console.log(position)
    const startLat = 33.749
    const startLong = -84.388
    const latitude = position.z / (Math.cos((startLat * PI) / 180) * 111134.861111) + startLat
    const longtitude = -position.x / 111134.861111 + startLong
    console.log(latitude)
    console.log(longtitude)

    await updateMap(
      Engine.scene,
      Engine.renderer,
      {
        name: 'MAPAPA',
        isGlobal: true
      },
      longtitude,
      latitude,
      position
    )

    const remObj = Engine.scene.getObjectByName('Mappa')
    console.log('Map is ', remObj)
    remObj.removeFromParent()
  }

  const VideocamIcon = isCamVideoEnabled ? Videocam : VideocamOff
  const MicIcon = isCamAudioEnabled ? Mic : MicOff

  return (
    <section className={styles.drawerBox}>
      {instanceMediaChatEnabled ? (
        <button
          type="button"
          id="UserAudio"
          className={styles.iconContainer + ' ' + (isCamAudioEnabled ? styles.on : '')}
          onClick={handleMicClick}
        >
          <MicIcon />
        </button>
      ) : null}
      {videoEnabled ? (
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
      <button onClick={handleUpdateMappa}>Update MAPPA</button>
    </section>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(MediaIconsBox)
