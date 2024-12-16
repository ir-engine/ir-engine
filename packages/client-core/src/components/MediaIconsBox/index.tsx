/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { useMediaNetwork } from '@ir-engine/client-core/src/common/services/MediaInstanceConnectionService'
import { LocationState } from '@ir-engine/client-core/src/social/services/LocationService'
import { ECSRecordingActions, PlaybackState, RecordingState } from '@ir-engine/common/src/recording/ECSRecordingSystem'
import { AudioEffectPlayer } from '@ir-engine/engine/src/audio/systems/MediaSystem'
import { dispatchAction, getMutableState, none, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { NetworkState } from '@ir-engine/network'
import { SpectateEntityState } from '@ir-engine/spatial/src/camera/systems/SpectateSystem'
import { endXRSession, requestXRSession } from '@ir-engine/spatial/src/xr/XRSessionFunctions'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'
import { RegisteredWidgets, WidgetAppActions } from '@ir-engine/spatial/src/xrui/WidgetAppService'
import CircularProgress from '@ir-engine/ui/src/primitives/mui/CircularProgress'
import Icon from '@ir-engine/ui/src/primitives/mui/Icon'
import IconButtonWithTooltip from '@ir-engine/ui/src/primitives/mui/IconButtonWithTooltip'

import useFeatureFlags from '@ir-engine/client-core/src/hooks/useFeatureFlags'
import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'
import multiLogger from '@ir-engine/common/src/logger'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import { VrIcon } from '../../common/components/Icons/VrIcon'
import { SearchParamState } from '../../common/services/RouterService'
import { MediaStreamService, MediaStreamState } from '../../media/MediaStreamState'
import { RecordingUIState } from '../../systems/ui/RecordingsWidgetUI'
import { clientContextParams } from '../../util/ClientContextState'
import { useShelfStyles } from '../Shelves/useShelfStyles'
import styles from './index.module.scss'

const logger = multiLogger.child({ component: 'client-core:MediaIconsBox', modifier: clientContextParams })

export const MediaIconsBox = () => {
  const { t } = useTranslation()
  const playbackState = useMutableState(PlaybackState)
  const recordingState = useMutableState(RecordingState)

  const location = useLocation()
  const { topShelfStyle } = useShelfStyles()

  const currentLocation = useHookstate(getMutableState(LocationState).currentLocation.location)
  const networkState = useMutableState(NetworkState)
  const mediaNetworkState = useMediaNetwork()
  const mediaNetworkReady = mediaNetworkState?.ready?.value
  const videoEnabled = currentLocation?.locationSetting?.value
    ? currentLocation?.locationSetting?.videoEnabled?.value
    : false
  const audioEnabled = currentLocation?.locationSetting?.value
    ? currentLocation?.locationSetting?.audioEnabled?.value
    : false
  const screenshareEnabled = currentLocation?.locationSetting?.value
    ? currentLocation?.locationSetting?.screenSharingEnabled?.value
    : false

  const mediaStreamState = useMutableState(MediaStreamState)
  const numVideoDevices = mediaStreamState.availableVideoDevices.value.length
  const hasAudioDevice = mediaStreamState.availableAudioDevices.value.length > 0
  const hasVideoDevice = numVideoDevices > 0
  const isMotionCaptureEnabled = mediaStreamState.faceTracking.value
  const isCamVideoEnabled = !!mediaStreamState.webcamMediaStream.value && mediaStreamState.webcamEnabled.value
  const isCamAudioEnabled = !!mediaStreamState.microphoneMediaStream.value && mediaStreamState.microphoneEnabled.value
  const isScreenVideoEnabled =
    !!mediaStreamState.screenshareMediaStream.value && mediaStreamState.screenshareEnabled.value

  const userID = useMutableState(EngineState).userID.value
  const spectating = !!useHookstate(getMutableState(SpectateEntityState)[userID]).value
  const xrState = useMutableState(XRState)
  const supportsAR = xrState.supportedSessionModes['immersive-ar'].value
  const xrMode = xrState.sessionMode.value
  const supportsVR = xrState.supportedSessionModes['immersive-vr'].value

  const [motionCaptureEnabled, xrEnabled] = useFeatureFlags([
    FeatureFlags.Client.Menu.MotionCapture,
    FeatureFlags.Client.Menu.XR
  ])

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

  const handleExitSpectatorClick = () => {
    if (spectating) {
      SearchParamState.set('spectate', none)
    } else {
      SearchParamState.set('spectate', '')
    }
  }

  return (
    <section
      className={`${styles.drawerBox} ${topShelfStyle} flex items-center justify-center gap-2`}
      style={{ pointerEvents: 'auto' }}
    >
      {networkState.config.media.value && !mediaNetworkState?.ready?.value && (
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
      {audioEnabled && hasAudioDevice && mediaNetworkReady && mediaNetworkState?.ready?.value ? (
        <IconButtonWithTooltip
          id="UserAudio"
          title={t('user:menu.toggleMute')}
          onClick={MediaStreamState.toggleMicrophonePaused}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          icon={<Icon type={isCamAudioEnabled ? 'Mic' : 'MicOff'} />}
          type="solid"
          sizePx={50}
        />
      ) : null}
      {videoEnabled && hasVideoDevice && mediaNetworkReady && mediaNetworkState?.ready.value ? (
        <>
          <IconButtonWithTooltip
            id="UserVideo"
            title={t('user:menu.toggleVideo')}
            onClick={() => {
              MediaStreamState.toggleWebcamPaused()
              logger.info({ event_name: 'toggle_camera', value: isCamVideoEnabled })
            }}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            icon={<Icon type={isCamVideoEnabled ? 'Videocam' : 'VideocamOff'} />}
            type="solid"
            sizePx={50}
          />
          {isCamVideoEnabled && numVideoDevices > 1 && (
            <IconButtonWithTooltip
              id="FlipVideo"
              title={t('user:menu.cycleCamera')}
              onClick={MediaStreamService.cycleCamera}
              onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
              onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
              icon={<Icon type={'FlipCameraAndroid'} />}
              type="solid"
              sizePx={50}
            />
          )}
          {motionCaptureEnabled && (
            <IconButtonWithTooltip
              id="UserPoseTracking"
              title={t('user:menu.poseTracking')}
              onClick={() => {
                window.open(`/capture/${location.pathname.split('/')[2]}`, '_blank')
                logger.info({
                  event_name: 'toggle_motion_capture',
                  event_value: isMotionCaptureEnabled
                })
              }}
              onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
              onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
              icon={<Icon type={'Accessibility'} />}
              type="solid"
              sizePx={50}
            />
          )}
        </>
      ) : null}
      {!isMobile &&
      !(typeof navigator.mediaDevices.getDisplayMedia === 'undefined') &&
      screenshareEnabled &&
      mediaNetworkReady &&
      mediaNetworkState?.ready.value ? (
        <>
          <IconButtonWithTooltip
            id="UserScreenSharing"
            title={t('user:menu.shareScreen')}
            onClick={MediaStreamState.toggleScreenshare}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            icon={<Icon type="ScreenShare" />}
            type="solid"
            sizePx={50}
          />
        </>
      ) : null}
      {supportsVR && xrEnabled && (
        <IconButtonWithTooltip
          id="UserVR"
          title={t('user:menu.enterVR')}
          onClick={() => {
            xrSessionActive ? endXRSession() : requestXRSession({ mode: 'immersive-vr' })
          }}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          icon={<VrIcon />}
          type="solid"
          sizePx={50}
        />
      )}
      {supportsAR && xrEnabled && (
        <IconButtonWithTooltip
          id="UserAR"
          title={t('user:menu.enterAR')}
          onClick={() => {
            xrSessionActive ? endXRSession() : requestXRSession({ mode: 'immersive-ar' })
          }}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          icon={<Icon type="ViewInAr" />}
          type="solid"
          sizePx={50}
        />
      )}
      {spectating && (
        <button
          type="button"
          id="ExitSpectator"
          title={t('user:menu.exitSpectate')}
          className={styles.iconContainer}
          onClick={handleExitSpectatorClick}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        >
          {/* todo - better UX for entering spectate mode */}
          {spectating ? 'Exit Spectate' : 'Enter Spectate'}
        </button>
      )}
      {/* {recordScopes && (
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
      )} */}
    </section>
  )
}
