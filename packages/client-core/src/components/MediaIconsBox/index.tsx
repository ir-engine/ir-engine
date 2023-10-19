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

import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import {
  MediaInstanceState,
  useMediaNetwork
} from '@etherealengine/client-core/src/common/services/MediaInstanceConnectionService'
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
import { XRState } from '@etherealengine/engine/src/xr/XRState'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import CircularProgress from '@etherealengine/ui/src/primitives/mui/CircularProgress'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import {
  ECSRecordingActions,
  PlaybackState,
  RecordingState
} from '@etherealengine/engine/src/recording/ECSRecordingSystem'
import { RegisteredWidgets, WidgetAppActions } from '@etherealengine/engine/src/xrui/WidgetAppService'
import IconButtonWithTooltip from '@etherealengine/ui/src/primitives/mui/IconButtonWithTooltip'
import { useTranslation } from 'react-i18next'
import { VrIcon } from '../../common/components/Icons/VrIcon'
import { RecordingTimer, RecordingUIState } from '../../systems/ui/RecordingsWidgetUI'
import { MediaStreamService, MediaStreamState } from '../../transports/MediaStreams'
import { useUserHasAccessHook } from '../../user/userHasAccess'
import { useShelfStyles } from '../Shelves/useShelfStyles'
import styles from './index.module.scss'

export const MediaIconsBox = () => {
  const { t } = useTranslation()
  const recordScopes = useUserHasAccessHook('record')
  const playbackState = useHookstate(getMutableState(PlaybackState))
  const recordingState = useHookstate(getMutableState(RecordingState))

  const location = useLocation()
  const hasAudioDevice = useHookstate(false)
  const hasVideoDevice = useHookstate(false)
  const { topShelfStyle } = useShelfStyles()

  const currentLocation = useHookstate(getMutableState(LocationState).currentLocation.location)
  const channelConnectionState = useHookstate(getMutableState(MediaInstanceState))
  const networkState = useHookstate(getMutableState(NetworkState))
  const mediaNetworkState = useMediaNetwork()
  const mediaNetworkID = Engine.instance.mediaNetwork?.id
  const mediaNetworkReady = mediaNetworkState?.ready?.value
  const currentChannelInstanceConnection = mediaNetworkID && channelConnectionState.instances[mediaNetworkID].ornull
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
  // const supportsAR = xrState.supportedSessionModes['immersive-ar'].value
  const supportsAR = false
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

  const toggleRecording = () => {
    const activeRecording = recordingState.recordingID.value
    if (activeRecording) {
      getMutableState(RecordingUIState).mode.set('recordings')
      RecordingState.stopRecording({
        recordingID: activeRecording
      })
    }
    const activePlayback = playbackState.recordingID.value
    if (activePlayback) {
      getMutableState(RecordingUIState).mode.set('recordings')
      ECSRecordingActions.stopPlayback({
        recordingID: activePlayback
      })
    }
    if (!activeRecording && !activePlayback) {
      getMutableState(RecordingUIState).mode.set('create')
    }
    const recordingWidget = Array.from(RegisteredWidgets.entries()).find(
      ([_, widget]) => widget.label === 'Recording' // todo - don't hard code this
    )!
    dispatchAction(WidgetAppActions.showWidget({ id: recordingWidget[0], shown: true }))
  }

  const xrSessionActive = xrState.sessionActive.value
  const handleExitSpectatorClick = () => dispatchAction(EngineActions.exitSpectate({}))

  return (
    <section className={`${styles.drawerBox} ${topShelfStyle}`}>
      {networkState.config.media.value && !mediaNetworkState?.ready.value && (
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
      {audioEnabled && hasAudioDevice.value && mediaNetworkReady && mediaNetworkState?.ready.value ? (
        <IconButtonWithTooltip
          id="UserAudio"
          title={t('user:menu.toggleMute')}
          className={styles.iconContainer + ' ' + (isCamAudioEnabled ? styles.on : '')}
          onClick={toggleMicrophonePaused}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          icon={<Icon type={isCamAudioEnabled ? 'Mic' : 'MicOff'} />}
        />
      ) : null}
      {videoEnabled && hasVideoDevice.value && mediaNetworkReady && mediaNetworkState?.ready.value ? (
        <>
          <IconButtonWithTooltip
            id="UserVideo"
            title={t('user:menu.toggleVideo')}
            className={styles.iconContainer + ' ' + (isCamVideoEnabled ? styles.on : '')}
            onClick={toggleWebcamPaused}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            icon={<Icon type={isCamVideoEnabled ? 'Videocam' : 'VideocamOff'} />}
          />
          {isCamVideoEnabled && hasVideoDevice.value && (
            <IconButtonWithTooltip
              id="FlipVideo"
              title={t('user:menu.cycleCamera')}
              className={styles.iconContainer}
              onClick={MediaStreamService.cycleCamera}
              onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
              onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
              icon={<Icon type={'FlipCameraAndroid'} />}
            />
          )}
          <IconButtonWithTooltip
            id="UserPoseTracking"
            title={t('user:menu.poseTracking')}
            className={styles.iconContainer + ' ' + (isMotionCaptureEnabled ? styles.on : '')}
            onClick={() => window.open(`/capture/${location.pathname.split('/')[2]}`, '_blank')}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            icon={<Icon type={'Accessibility'} />}
          />
          <IconButtonWithTooltip
            id="UserScreenSharing"
            title={t('user:menu.shareScreen')}
            className={styles.iconContainer + ' ' + (isScreenVideoEnabled ? styles.on : '')}
            onClick={toggleScreenshare}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            icon={<Icon type="ScreenShare" />}
          />
        </>
      ) : null}
      {supportsVR && (
        <IconButtonWithTooltip
          id="UserVR"
          title={t('user:menu.enterVR')}
          className={styles.iconContainer + ' ' + (xrMode === 'immersive-vr' ? styles.on : '')}
          onClick={() => {
            xrSessionActive ? endXRSession() : requestXRSession({ mode: 'immersive-vr' })
          }}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          icon={<VrIcon />}
        />
      )}
      {supportsAR && (
        <IconButtonWithTooltip
          id="UserAR"
          title={t('user:menu.enterAR')}
          className={styles.iconContainer + ' ' + (xrMode === 'immersive-ar' ? styles.on : '')}
          onClick={() => {
            xrSessionActive ? endXRSession() : requestXRSession({ mode: 'immersive-ar' })
          }}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          icon={<Icon type="ViewInAr" />}
        />
      )}
      {spectating.value && (
        <button
          type="button"
          id="ExitSpectator"
          title={t('user:menu.exitSpectate')}
          className={styles.iconContainer}
          onClick={handleExitSpectatorClick}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        >
          Exit Spectate
        </button>
      )}
      {recordScopes && (
        <>
          {recordingState.recordingID.value || playbackState.recordingID.value ? (
            <button
              type="button"
              id="Record"
              title={t('user:menu.stopRecording')}
              style={{ color: 'red' }}
              className={styles.iconContainer}
              onClick={toggleRecording}
            >
              <Icon type="StopCircle" />
              <div style={{ position: 'absolute', marginTop: '80px' }}>
                <RecordingTimer />
              </div>
            </button>
          ) : (
            <IconButtonWithTooltip
              id="Record"
              title={t('user:menu.startRecording')}
              className={styles.iconContainer}
              onClick={toggleRecording}
              icon={<Icon type="CameraAlt" />}
            />
          )}
        </>
      )}
    </section>
  )
}
