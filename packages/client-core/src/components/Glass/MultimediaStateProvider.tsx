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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import React from 'react'

import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'
import multiLogger from '@ir-engine/common/src/logger'
import { PlaybackState, RecordingState } from '@ir-engine/common/src/recording/ECSRecordingSystem'
import { EngineState } from '@ir-engine/ecs'
import { AudioEffectPlayer } from '@ir-engine/engine/src/audio/systems/MediaSystem'
import { getMutableState, NetworkState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { MediaStreamService, MediaStreamState } from '@ir-engine/hyperflux/src/media/MediaStreamState'
import { SpectateEntityState } from '@ir-engine/spatial/src/camera/systems/SpectateSystem'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import { endXRSession, requestXRSession } from '@ir-engine/spatial/src/xr/XRSessionFunctions'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'
import { CustomScreenshare as ScreenshareIcon } from '@ir-engine/ui/src/icons'
import { useTranslation } from 'react-i18next'
import {
  BsCameraVideoOffFill as CameraOffIcon,
  BsCameraVideoFill as CameraOnIcon,
  BsMicMuteFill as MicrophoneOffIcon,
  BsMicFill as MicrophoneOnIcon
} from 'react-icons/bs'
import { MdFlipCameraAndroid } from 'react-icons/md'
import { useLocation, useSearchParams } from 'react-router-dom'
import { VrIcon } from '../../common/components/Icons/VrIcon'
import { useMediaNetwork } from '../../common/services/MediaInstanceConnectionService'
import useFeatureFlags from '../../hooks/useFeatureFlags'
import { LocationState } from '../../social/services/LocationService'
import { clientContextParams } from '../../util/ClientContextState'

type IconType = ({ className }: { className?: string }) => JSX.Element | null

type MultimediaState = {
  isLoading: boolean | undefined
  isCamLoading: boolean | undefined

  isMicReady: boolean | undefined
  isCamReady: boolean | undefined
  isScreenshareReady: boolean | undefined
  isMultiVideoReady: boolean | undefined
  isVRReady: boolean | undefined
  isSpectateReady: boolean | undefined

  isCamVideoEnabled: boolean | undefined
  isCamAudioEnabled: boolean | undefined

  _MicIcon: IconType
  _CamIcon: IconType
  _ScreenshareIcon: IconType
  _MultiVideoIcon: IconType
  _VRIcon: IconType

  onMicClick: () => void
  onCamClick: () => void
  onScreenshareClick: () => void
  onMultiVideoClick: () => void
  onVRClick: () => void
  onSpectateClick: () => void
  onSpectatePointerUp: () => void
  onSpectatePointerDown: () => void
}

const MultimediaStateContext = React.createContext({} as MultimediaState)

const logger = multiLogger.child({ component: 'client-core:MultimediaStateProvider', modifier: clientContextParams })

const useMultimediaState = () => {
  const { t } = useTranslation()
  const playbackState = useMutableState(PlaybackState)
  const recordingState = useMutableState(RecordingState)

  const location = useLocation()

  const currentLocation = useHookstate(getMutableState(LocationState).currentLocation.location)
  const networkState = useMutableState(NetworkState)
  const mediaNetworkState = useMediaNetwork()
  const mediaNetworkReady = mediaNetworkState?.ready?.value ?? false
  const mediaNetworkConfigEnabled = networkState.config.media.value

  // Default these to true when location setting is not available yet
  const locationSetting = currentLocation?.locationSetting?.value
  const videoEnabled = locationSetting ? currentLocation?.locationSetting?.videoEnabled?.value : true
  const audioEnabled = locationSetting ? currentLocation?.locationSetting?.audioEnabled?.value : true
  const screenshareEnabled = locationSetting ? currentLocation?.locationSetting?.screenSharingEnabled?.value : true

  const mediaStreamState = useMutableState(MediaStreamState)
  const numVideoDevices = mediaStreamState.availableVideoDevices.value.length
  const hasAudioDevice = mediaStreamState.availableAudioDevices.value.length > 0
  const hasVideoDevice = numVideoDevices > 0

  // Fallback device detection - assume devices exist if browser supports getUserMedia
  const browserSupportsAudio = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  const browserSupportsVideo = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  const hasAudioDeviceFallback = hasAudioDevice || browserSupportsAudio
  const hasVideoDeviceFallback = hasVideoDevice || browserSupportsVideo
  const isMotionCaptureEnabled = mediaStreamState.faceTracking.value
  const isCamVideoEnabled = !!mediaStreamState.webcamMediaStream.value && mediaStreamState.webcamEnabled.value
  const isCamAudioEnabled = !!mediaStreamState.microphoneMediaStream.value && mediaStreamState.microphoneEnabled.value
  const isScreenVideoEnabled =
    !!mediaStreamState.screenshareMediaStream.value && mediaStreamState.screenshareEnabled.value

  const userID = useMutableState(EngineState).userID.value
  const spectating = !!useHookstate(getMutableState(SpectateEntityState)[userID]).value
  const xrState = useMutableState(XRState)
  const supportsVR = xrState.supportedSessionModes['immersive-vr'].value

  const [
    // motionCaptureEnabled,
    xrEnabled
  ] = useFeatureFlags([
    // FeatureFlags.Client.Menu.MotionCapture,
    FeatureFlags.Client.Menu.XR
  ])

  const xrSessionActive = xrState.sessionActive.value
  const [params, setSearch] = useSearchParams()

  const handleExitSpectatorClick = () => {
    if (spectating) {
      params.delete('spectate')
    } else {
      params.set('spectate', '')
    }
    setSearch(params)
  }

  const isNetworkLoading = mediaNetworkConfigEnabled && !mediaNetworkReady
  const isLoading = isNetworkLoading

  const isCamLoading = !!mediaStreamState.webcamMediaStream.value !== mediaStreamState.webcamEnabled.value

  const isNetworkReady = mediaNetworkConfigEnabled && mediaNetworkReady

  const isMicReady = audioEnabled && hasAudioDeviceFallback && isNetworkReady

  const isCamReady = videoEnabled && hasVideoDeviceFallback && isNetworkReady

  const isScreenshareReady =
    !isMobile &&
    !(typeof navigator.mediaDevices.getDisplayMedia === 'undefined') &&
    screenshareEnabled &&
    isNetworkReady

  const isVRReady = supportsVR && xrEnabled
  const isSpectateReady = spectating
  const isMultiVideoReady = isCamReady && isCamVideoEnabled && (numVideoDevices > 1 || hasVideoDeviceFallback)

  const _MicIcon = isCamAudioEnabled ? MicrophoneOnIcon : MicrophoneOffIcon

  const _CamIcon = isCamVideoEnabled ? CameraOnIcon : CameraOffIcon

  const _ScreenshareIcon = ScreenshareIcon
  const _VRIcon = VrIcon
  const _MultiVideoIcon = MdFlipCameraAndroid

  const onMicClick = MediaStreamState.toggleMicrophonePaused

  const onCamClick = () => {
    MediaStreamState.toggleWebcamPaused()
    logger.analytics({ event_name: 'toggle_camera', value: isCamVideoEnabled })
  }

  const onScreenshareClick = MediaStreamState.toggleScreenshare

  const onSpectatePointerUp = () => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)
  const onSpectatePointerDown = () => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)
  const onSpectateClick = handleExitSpectatorClick

  const onMultiVideoClick = MediaStreamService.cycleCamera

  const onVRClick = () => {
    xrSessionActive ? endXRSession() : requestXRSession({ mode: 'immersive-vr' })
  }

  return {
    isLoading,
    isCamLoading,

    isMicReady,
    isCamReady,
    isScreenshareReady,
    isMultiVideoReady,
    isVRReady,
    isSpectateReady,

    isCamVideoEnabled,
    isCamAudioEnabled,

    _MicIcon,
    _CamIcon,
    _ScreenshareIcon,
    _MultiVideoIcon,
    _VRIcon,

    onMicClick,
    onCamClick,
    onScreenshareClick,
    onMultiVideoClick,
    onVRClick,
    onSpectateClick,
    onSpectatePointerUp,
    onSpectatePointerDown
  }
}

export const useMultimediaStateProvider = () => React.useContext(MultimediaStateContext)

const Provider = MultimediaStateContext.Provider

export const MultimediaStateProvider = ({ children }) => {
  const multimediaState = useMultimediaState()

  return <Provider value={multimediaState}>{children}</Provider>
}
