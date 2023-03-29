import React, { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { useMediaInstanceConnectionState } from '@etherealengine/client-core/src/common/services/MediaInstanceConnectionService'
import { useMediaStreamState } from '@etherealengine/client-core/src/media/services/MediaStreamService'
import { useLocationState } from '@etherealengine/client-core/src/social/services/LocationService'
import {
  toggleFaceTracking,
  toggleMicrophonePaused,
  toggleScreenshare,
  toggleWebcamPaused
} from '@etherealengine/client-core/src/transports/SocketWebRTCClientFunctions'
import logger from '@etherealengine/common/src/logger'
import { AudioEffectPlayer } from '@etherealengine/engine/src/audio/systems/MediaSystem'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineActions, useEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { XRAction, XRState } from '@etherealengine/engine/src/xr/XRState'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import { VrIcon } from '../../common/components/Icons/VrIcon'
import { useShelfStyles } from '../Shelves/useShelfStyles'
import styles from './index.module.scss'

export const MediaIconsBox = () => {
  const navigate = useNavigate()
  const [hasAudioDevice, setHasAudioDevice] = useState(false)
  const [hasVideoDevice, setHasVideoDevice] = useState(false)
  const { topShelfStyle } = useShelfStyles()

  const currentLocation = useLocationState().currentLocation.location
  const channelConnectionState = useMediaInstanceConnectionState()
  const mediaHostId = Engine.instance.mediaNetwork?.hostId
  const currentChannelInstanceConnection = mediaHostId && channelConnectionState.instances[mediaHostId].ornull
  const mediastream = useMediaStreamState()
  const videoEnabled = currentLocation?.locationSetting?.value
    ? currentLocation?.locationSetting?.videoEnabled?.value
    : false
  const audioEnabled = currentLocation?.locationSetting?.value
    ? currentLocation?.locationSetting?.audioEnabled?.value
    : false

  const isMotionCaptureEnabled = mediastream.isMotionCaptureEnabled
  const isCamVideoEnabled = mediastream.isCamVideoEnabled
  const isCamAudioEnabled = mediastream.isCamAudioEnabled
  const isScreenVideoEnabled = mediastream.isScreenVideoEnabled

  const engineState = useEngineState()
  const xrState = useHookstate(getMutableState(XRState))
  const supportsAR = xrState.supportedSessionModes['immersive-ar'].value
  const xrMode = xrState.sessionMode.value
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

  const xrSessionActive = xrState.sessionActive.value
  const handleExitSpectatorClick = () => dispatchAction(EngineActions.exitSpectate({}))

  return (
    <section className={`${styles.drawerBox} ${topShelfStyle}`}>
      {audioEnabled &&
      hasAudioDevice &&
      Engine.instance.mediaNetwork &&
      currentChannelInstanceConnection?.connected.value ? (
        <button
          type="button"
          id="UserAudio"
          className={styles.iconContainer + ' ' + (isCamAudioEnabled.value ? styles.on : '')}
          onClick={toggleMicrophonePaused}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        >
          <Icon type={isCamAudioEnabled.value ? 'Mic' : 'MicOff'} />
        </button>
      ) : null}
      {videoEnabled &&
      hasVideoDevice &&
      Engine.instance.mediaNetwork &&
      currentChannelInstanceConnection?.connected.value ? (
        <>
          <button
            type="button"
            id="UserVideo"
            className={styles.iconContainer + ' ' + (isCamVideoEnabled.value ? styles.on : '')}
            onClick={toggleWebcamPaused}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          >
            <Icon type={isCamVideoEnabled.value ? 'Videocam' : 'VideocamOff'} />
          </button>
          <button
            type="button"
            id="UserPoseTracking"
            className={styles.iconContainer + ' ' + (isMotionCaptureEnabled.value ? styles.on : '')}
            onClick={() => window.open('/recorder', '_blank')}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          >
            <Icon type={'Accessibility'} />
          </button>
          <button
            type="button"
            id="UserScreenSharing"
            className={styles.iconContainer + ' ' + (isScreenVideoEnabled.value ? styles.on : '')}
            onClick={toggleScreenshare}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          >
            <Icon type="ScreenShare" />
          </button>
        </>
      ) : null}
      {supportsVR && (
        <button
          type="button"
          id="UserVR"
          className={styles.iconContainer + ' ' + (xrMode === 'immersive-vr' ? styles.on : '')}
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
          className={styles.iconContainer + ' ' + (xrMode === 'immersive-ar' ? styles.on : '')}
          onClick={() =>
            dispatchAction(
              xrSessionActive ? XRAction.endSession({}) : XRAction.requestSession({ mode: 'immersive-ar' })
            )
          }
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        >
          {<Icon type="ViewInAr" />}
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
