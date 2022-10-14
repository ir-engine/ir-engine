import React, { useEffect, useState } from 'react'

import { useMediaInstanceConnectionState } from '@xrengine/client-core/src/common/services/MediaInstanceConnectionService'
import { MediaStreamService, useMediaStreamState } from '@xrengine/client-core/src/media/services/MediaStreamService'
import { useLocationState } from '@xrengine/client-core/src/social/services/LocationService'
import { MediaStreams } from '@xrengine/client-core/src/transports/MediaStreams'
import {
  configureMediaTransports,
  createCamAudioProducer,
  createCamVideoProducer,
  pauseProducer,
  resumeProducer,
  startScreenshare,
  stopScreenshare
} from '@xrengine/client-core/src/transports/SocketWebRTCClientFunctions'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import logger from '@xrengine/common/src/logger'
import { AudioEffectPlayer } from '@xrengine/engine/src/audio/systems/MediaSystem'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions, useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { XRAction, XRState } from '@xrengine/engine/src/xr/XRState'
import { dispatchAction, getState, useHookstate } from '@xrengine/hyperflux'

import { Mic, MicOff, Videocam, VideocamOff } from '@mui/icons-material'
import FaceIcon from '@mui/icons-material/Face'
import ScreenShareIcon from '@mui/icons-material/ScreenShare'
import ViewInArIcon from '@mui/icons-material/ViewInAr'

import { VrIcon } from '../../common/components/Icons/Vricon'
import {
  startFaceTracking,
  startLipsyncTracking,
  stopFaceTracking,
  stopLipsyncTracking
} from '../../media/webcam/WebcamInput'
import { SocketWebRTCClientNetwork } from '../../transports/SocketWebRTCClientNetwork'
import { useShelfStyles } from '../Shelves/useShelfStyles'
import styles from './index.module.scss'

export const MediaIconsBox = () => {
  const [hasAudioDevice, setHasAudioDevice] = useState(false)
  const [hasVideoDevice, setHasVideoDevice] = useState(false)
  const { topShelfStyle } = useShelfStyles()

  const user = useAuthState().user
  const currentLocation = useLocationState().currentLocation.location
  const channelConnectionState = useMediaInstanceConnectionState()
  const mediaHostId = Engine.instance.currentWorld.mediaNetwork?.hostId
  const currentChannelInstanceConnection = mediaHostId && channelConnectionState.instances[mediaHostId].ornull
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
  const isScreenVideoEnabled = mediastream.isScreenVideoEnabled

  const engineState = useEngineState()
  const xrState = useHookstate(getState(XRState))
  const supportsAR = xrState.supportedSessionModes['immersive-ar'].value
  const supportsVR = xrState.supportedSessionModes['immersive-vr'].value

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
      const mediaNetwork = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
      if (await configureMediaTransports(mediaNetwork, ['video', 'audio'])) {
        MediaStreams.instance.setFaceTracking(true)
        startFaceTracking()
        startLipsyncTracking()
        MediaStreamService.updateFaceTrackingState()
      }
    }
  }

  const handleMicClick = async () => {
    const mediaNetwork = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
    if (await configureMediaTransports(mediaNetwork, ['audio'])) {
      if (MediaStreams.instance.camAudioProducer == null) await createCamAudioProducer(mediaNetwork)
      else {
        const audioPaused = MediaStreams.instance.toggleAudioPaused()
        if (audioPaused) await pauseProducer(mediaNetwork, MediaStreams.instance.camAudioProducer)
        else await resumeProducer(mediaNetwork, MediaStreams.instance.camAudioProducer)
      }
      MediaStreamService.updateCamAudioState()
    }
  }

  const handleCamClick = async () => {
    const mediaNetwork = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
    if (await configureMediaTransports(mediaNetwork, ['video'])) {
      if (MediaStreams.instance.camVideoProducer == null) await createCamVideoProducer(mediaNetwork)
      else {
        const videoPaused = MediaStreams.instance.toggleVideoPaused()
        if (videoPaused) await pauseProducer(mediaNetwork, MediaStreams.instance.camVideoProducer)
        else await resumeProducer(mediaNetwork, MediaStreams.instance.camVideoProducer)
      }

      MediaStreamService.updateCamVideoState()
    }
  }

  const handleScreenShare = async () => {
    const mediaNetwork = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
    if (!MediaStreams.instance.screenVideoProducer) await startScreenshare(mediaNetwork)
    else await stopScreenshare(mediaNetwork)
  }

  const xrSessionActive = xrState.sessionActive.value
  const handleExitSpectatorClick = () => dispatchAction(EngineActions.spectateUser({}))

  const VideocamIcon = isCamVideoEnabled.value ? Videocam : VideocamOff
  const MicIcon = isCamAudioEnabled.value ? Mic : MicOff

  return (
    <section className={`${styles.drawerBox} ${topShelfStyle}`}>
      {instanceMediaChatEnabled &&
      hasAudioDevice &&
      Engine.instance.currentWorld.mediaNetwork &&
      currentChannelInstanceConnection?.connected.value ? (
        <button
          type="button"
          id="UserAudio"
          className={styles.iconContainer + ' ' + (isCamAudioEnabled.value ? styles.on : '')}
          onClick={handleMicClick}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        >
          <MicIcon />
        </button>
      ) : null}
      {videoEnabled &&
      hasVideoDevice &&
      Engine.instance.currentWorld.mediaNetwork &&
      currentChannelInstanceConnection?.connected.value ? (
        <>
          <button
            type="button"
            id="UserVideo"
            className={styles.iconContainer + ' ' + (isCamVideoEnabled.value ? styles.on : '')}
            onClick={handleCamClick}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          >
            <VideocamIcon />
          </button>
          <button
            type="button"
            id="UserFaceTracking"
            className={styles.iconContainer + ' ' + (isFaceTrackingEnabled.value ? styles.on : '')}
            onClick={handleFaceClick}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          >
            <FaceIcon />
          </button>
          <button
            type="button"
            id="UserScreenSharing"
            className={styles.iconContainer + ' ' + (isScreenVideoEnabled.value ? styles.on : '')}
            onClick={handleScreenShare}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          >
            <ScreenShareIcon />
          </button>
        </>
      ) : null}
      {supportsVR && (
        <button
          type="button"
          id="UserVR"
          className={styles.iconContainer + ' ' + (xrSessionActive ? styles.on : '')}
          onClick={() =>
            dispatchAction(
              xrSessionActive ? XRAction.endSession({}) : XRAction.requestSession({ mode: 'immersive-vr' })
            )
          }
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        >
          {<VrIcon />}
        </button>
      )}
      {supportsAR && (
        <button
          type="button"
          id="UserAR"
          className={styles.iconContainer + ' ' + (xrSessionActive ? styles.on : '')}
          onClick={() =>
            dispatchAction(
              xrSessionActive ? XRAction.endSession({}) : XRAction.requestSession({ mode: 'immersive-ar' })
            )
          }
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        >
          {<ViewInArIcon />}
        </button>
      )}
      {engineState.spectating.value && (
        <button
          type="button"
          id="ExitSpectator"
          className={styles.iconContainer}
          onClick={handleExitSpectatorClick}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        >
          Exit Spectate
        </button>
      )}
    </section>
  )
}
