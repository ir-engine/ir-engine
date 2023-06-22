/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { t } from 'i18next'
import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { MediaInstanceState } from '@etherealengine/client-core/src/common/services/MediaInstanceConnectionService'
import { LocationState } from '@etherealengine/client-core/src/social/services/LocationService'
import {
  toggleMicrophonePaused,
  toggleScreenshare,
  toggleWebcamPaused
} from '@etherealengine/client-core/src/transports/SocketWebRTCClientFunctions'
import logger from '@etherealengine/common/src/logger'
import { AudioEffectPlayer } from '@etherealengine/engine/src/audio/systems/MediaSystem'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineActions, EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { endXRSession, requestXRSession } from '@etherealengine/engine/src/xr/XRSessionFunctions'
import { XRAction, XRState } from '@etherealengine/engine/src/xr/XRState'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import CircularProgress from '@etherealengine/ui/src/primitives/mui/CircularProgress'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import { VrIcon } from '../../common/components/Icons/VrIcon'
import { MediaStreamService, MediaStreamState } from '../../transports/MediaStreams'
import { useShelfStyles } from '../Shelves/useShelfStyles'
import styles from './index.module.scss'

export const MediaIconsBox = () => {
  const location = useLocation()
  const hasAudioDevice = useHookstate(false)
  const hasVideoDevice = useHookstate(false)
  const { topShelfStyle } = useShelfStyles()

  const currentLocation = useHookstate(getMutableState(LocationState).currentLocation.location)
  const channelConnectionState = useHookstate(getMutableState(MediaInstanceState))
  const networkState = useHookstate(getMutableState(NetworkState))
  const mediaHostId = Engine.instance.mediaNetwork?.hostId
  const mediaNetworkReady = networkState.networks[mediaHostId]?.ready?.value
  const currentChannelInstanceConnection = mediaHostId && channelConnectionState.instances[mediaHostId].ornull
  const videoEnabled = currentLocation?.locationSetting?.value
    ? currentLocation?.locationSetting?.videoEnabled?.value
    : false
  const audioEnabled = currentLocation?.locationSetting?.value
    ? currentLocation?.locationSetting?.audioEnabled?.value
    : false

  const mediaStreamState = useHookstate(getMutableState(MediaStreamState))
  const isMotionCaptureEnabled = mediaStreamState.faceTracking.value
  const isCamVideoEnabled = mediaStreamState.camVideoProducer.value != null && !mediaStreamState.videoPaused.value
  const isCamAudioEnabled = mediaStreamState.camAudioProducer.value != null && !mediaStreamState.audioPaused.value
  const isScreenVideoEnabled =
    mediaStreamState.screenVideoProducer.value != null && !mediaStreamState.screenShareVideoPaused.value

  const spectating = useHookstate(getMutableState(EngineState).spectating)
  const xrState = useHookstate(getMutableState(XRState))
  const supportsAR = xrState.supportedSessionModes['immersive-ar'].value
  const xrMode = xrState.sessionMode.value
  const supportsVR = xrState.supportedSessionModes['immersive-vr'].value

  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        hasAudioDevice.set(devices.filter((device) => device.kind === 'audioinput').length > 0)
        hasVideoDevice.set(devices.filter((device) => device.kind === 'videoinput').length > 0)
      })
      .catch((err) => logger.error(err, 'Could not get media devices.'))
  }, [])

  const xrSessionActive = xrState.sessionActive.value
  const handleExitSpectatorClick = () => dispatchAction(EngineActions.exitSpectate({}))

  return (
    <section className={`${styles.drawerBox} ${topShelfStyle}`}>
      {networkState.config.media.value && !currentChannelInstanceConnection?.connected.value && (
        <div className={styles.loader}>
          <CircularProgress />
          <div
            style={{
              // default values will be overridden by theme
              fontFamily: 'Lato',
              fontSize: '12px',
              color: '#585858',
              padding: '16px'
            }}
          >
            {t('common:loader.connectingToMedia') as string}
          </div>
        </div>
      )}
      {audioEnabled &&
      hasAudioDevice.value &&
      mediaNetworkReady &&
      currentChannelInstanceConnection?.connected.value ? (
        <button
          type="button"
          id="UserAudio"
          className={styles.iconContainer + ' ' + (isCamAudioEnabled ? styles.on : '')}
          onClick={toggleMicrophonePaused}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        >
          <Icon type={isCamAudioEnabled ? 'Mic' : 'MicOff'} />
        </button>
      ) : null}
      {videoEnabled &&
      hasVideoDevice.value &&
      mediaNetworkReady &&
      currentChannelInstanceConnection?.connected.value ? (
        <>
          <button
            type="button"
            id="UserVideo"
            className={styles.iconContainer + ' ' + (isCamVideoEnabled ? styles.on : '')}
            onClick={toggleWebcamPaused}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          >
            <Icon type={isCamVideoEnabled ? 'Videocam' : 'VideocamOff'} />
          </button>
          {isCamVideoEnabled && hasVideoDevice.value && (
            <button
              type="button"
              id="FlipVideo"
              className={styles.iconContainer}
              onClick={MediaStreamService.cycleCamera}
              onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
              onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            >
              <Icon type={'FlipCameraAndroid'} />
            </button>
          )}
          <button
            type="button"
            id="UserPoseTracking"
            className={styles.iconContainer + ' ' + (isMotionCaptureEnabled ? styles.on : '')}
            onClick={() => window.open(`/capture/${location.pathname.split('/')[2]}`, '_blank')}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          >
            <Icon type={'Accessibility'} />
          </button>
          <button
            type="button"
            id="UserScreenSharing"
            className={styles.iconContainer + ' ' + (isScreenVideoEnabled ? styles.on : '')}
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
          onClick={() => {
            xrSessionActive ? endXRSession() : requestXRSession({ mode: 'immersive-vr' })
          }}
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
          onClick={() => {
            xrSessionActive ? endXRSession() : requestXRSession({ mode: 'immersive-ar' })
          }}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        >
          {<Icon type="ViewInAr" />}
        </button>
      )}
      {spectating.value && (
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
