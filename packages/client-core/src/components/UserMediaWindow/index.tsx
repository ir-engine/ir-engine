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

import { DrawingUtils } from '@mediapipe/tasks-vision'
import classNames from 'classnames'
import hark from 'hark'
import { t } from 'i18next'
import React, { RefObject, useEffect, useRef } from 'react'

import Text from '@ir-engine/client-core/src/common/components/Text'
import { LocationState } from '@ir-engine/client-core/src/social/services/LocationService'
import { AuthState } from '@ir-engine/client-core/src/user/services/AuthService'
import { useFind, useGet } from '@ir-engine/common'
import { UserName, clientSettingPath, userPath } from '@ir-engine/common/src/schema.type.module'
import { useExecute } from '@ir-engine/ecs'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { AudioState } from '@ir-engine/engine/src/audio/AudioState'
import { MediaSettingsState } from '@ir-engine/engine/src/audio/MediaSettingsState'
import { MotionCaptureSystem, timeSeriesMocapData } from '@ir-engine/engine/src/mocap/MotionCaptureSystem'
import { applyScreenshareToTexture } from '@ir-engine/engine/src/scene/functions/applyScreenshareToTexture'
import { NO_PROXY, PeerID, State, getMutableState, getState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import {
  NetworkState,
  screenshareAudioDataChannelType,
  screenshareVideoDataChannelType,
  webcamAudioDataChannelType,
  webcamVideoDataChannelType
} from '@ir-engine/network'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import { drawPoseToCanvas } from '@ir-engine/ui/src/pages/Capture'
import Icon from '@ir-engine/ui/src/primitives/mui/Icon'
import IconButton from '@ir-engine/ui/src/primitives/mui/IconButton'
import Slider from '@ir-engine/ui/src/primitives/mui/Slider'
import Tooltip from '@ir-engine/ui/src/primitives/mui/Tooltip'
import Canvas from '@ir-engine/ui/src/primitives/tailwind/Canvas'

import { useTranslation } from 'react-i18next'
import { useZendesk } from '../../hooks/useZendesk'
import { MediaStreamState } from '../../transports/MediaStreams'
import { PeerMediaChannelState, PeerMediaStreamInterface } from '../../transports/PeerMediaChannelState'
import { useUserAvatarThumbnail } from '../../user/functions/useUserAvatarThumbnail'
import Draggable from './Draggable'
import styles from './index.module.scss'

interface Props {
  peerID: PeerID
  type: 'screen' | 'cam'
}

const MAX_RES_TO_USE_TOP_LAYER = 540 //If under 540p, use the topmost video layer, otherwise use layer n-1

const useDrawMocapLandmarks = (
  videoElement: HTMLVideoElement,
  canvasCtxRef: React.MutableRefObject<CanvasRenderingContext2D | undefined>,
  canvasRef: RefObject<HTMLCanvasElement>,
  peerID: PeerID
) => {
  let lastTimestamp = 0
  const drawingUtils = useHookstate(null as null | DrawingUtils)
  useEffect(() => {
    drawingUtils.set(new DrawingUtils(canvasCtxRef.current!))
    canvasRef.current!.style.transform = `scaleX(-1)`
  })
  useExecute(
    () => {
      if (videoElement.paused || videoElement.ended || !videoElement.currentTime) return
      const networkState = getState(NetworkState)
      if (networkState.hostIds.world) {
        const network = networkState.networks[networkState.hostIds.world]
        if (network?.peers?.[peerID]) {
          const userID = network.peers[peerID].userId
          const peers = network.users[userID]
          for (const peer of peers) {
            const mocapBuffer = timeSeriesMocapData.get(peer)
            if (mocapBuffer) {
              const lastMocapResult = mocapBuffer.getLast()
              if (lastMocapResult && lastMocapResult.timestamp !== lastTimestamp) {
                lastTimestamp = lastMocapResult.timestamp
                drawingUtils.value &&
                  drawPoseToCanvas([lastMocapResult.results.landmarks], canvasCtxRef, canvasRef, drawingUtils.value)
                return
              }
            }
          }
        }
      }
    },
    { before: MotionCaptureSystem }
  )
}

export const useUserMediaWindowHook = ({ peerID, type }: Props) => {
  const peerMediaChannelState = useHookstate(
    getMutableState(PeerMediaChannelState)[peerID][type] as State<PeerMediaStreamInterface>
  )
  const { videoMediaStream, audioMediaStream, videoStreamPaused, audioStreamPaused, videoElement, audioElement } =
    peerMediaChannelState.value as PeerMediaStreamInterface

  const audioTrackClones = useHookstate<any[]>([])
  const videoTrackClones = useHookstate<any[]>([])

  const harkListener = useHookstate(null as ReturnType<typeof hark> | null)
  const soundIndicatorOn = useHookstate(false)
  const isPiP = useHookstate(false)
  const videoDisplayReady = useHookstate<boolean>(false)

  const resumeVideoOnUnhide = useRef<boolean>(false)
  const resumeAudioOnUnhide = useRef<boolean>(false)

  const audioState = useMutableState(AudioState)

  const _volume = useHookstate(1)

  const selfUser = useMutableState(AuthState).user.get(NO_PROXY)
  const currentLocation = useMutableState(LocationState).currentLocation.location
  /** @todo refactor global mute for admin controls */
  const enableGlobalMute =
    currentLocation?.locationSetting?.locationType?.value === 'showroom' &&
    selfUser?.locationAdmins?.find((locationAdmin) => currentLocation?.id?.value === locationAdmin.locationId) != null

  const mediaNetwork = NetworkState.mediaNetwork
  const isSelf =
    !mediaNetwork ||
    peerID === Engine.instance.store.peerID ||
    (mediaNetwork?.peers &&
      Object.values(mediaNetwork.peers).find((peer) => peer.userId === selfUser.id)?.peerID === peerID) ||
    peerID === 'self'
  const volume = isSelf ? audioState.microphoneGain.value : _volume.value
  const isScreen = type === 'screen'
  const userId = isSelf ? selfUser?.id : mediaNetwork?.peers?.[peerID]?.userId

  const mediaStreamState = useMutableState(MediaStreamState)
  const mediaSettingState = useMutableState(MediaSettingsState)
  const rendered = !mediaSettingState.immersiveMedia.value

  useEffect(() => {
    function onUserInteraction() {
      videoElement?.play()
      audioElement?.play()
      harkListener?.value?.resume()
    }
    window.addEventListener('pointerup', onUserInteraction)
    return () => {
      window.removeEventListener('pointerup', onUserInteraction)
    }
  }, [videoElement, audioElement, harkListener?.value])

  useEffect(() => {
    let unmounted = false
    let newHark
    if (audioElement != null) {
      audioElement.id = `${peerID}_audio`
      audioElement.autoplay = true
      audioElement.setAttribute('playsinline', 'true')
      if (isSelf) {
        audioElement.muted = true
      } else {
        audioElement.volume = volume
      }
      if (audioMediaStream) {
        const newAudioTrack = audioMediaStream.getAudioTracks()[0].clone()
        const updateAudioTrackClones = audioTrackClones.get(NO_PROXY).concat(newAudioTrack)
        audioTrackClones.set(updateAudioTrackClones)
        audioElement.srcObject = new MediaStream([newAudioTrack])
        newHark = hark(audioElement.srcObject, { play: false })
        newHark.on('speaking', () => {
          if (unmounted) return
          soundIndicatorOn.set(true)
        })
        newHark.on('stopped_speaking', () => {
          if (unmounted) return
          soundIndicatorOn.set(false)
        })
        harkListener.set(newHark)
      }
    }

    return () => {
      audioTrackClones.get(NO_PROXY).forEach((track) => track.stop())
      unmounted = true
      if (newHark) newHark.stop()
    }
  }, [audioMediaStream])

  useEffect(() => {
    videoElement.id = `${peerID}_video`
    videoElement.autoplay = true
    videoElement.muted = true
    videoElement.setAttribute('playsinline', 'true')

    if (!videoMediaStream) return

    videoDisplayReady.set(false)
    const originalTrackEnabledInterval = setInterval(() => {
      const videoTrack = videoMediaStream.getVideoTracks()[0]
      if (videoTrack.enabled) {
        clearInterval(originalTrackEnabledInterval)

        // if (!videoRef?.srcObject?.active || !videoRef?.srcObject?.getVideoTracks()[0].enabled) {
        const newVideoTrack = videoTrack.clone()
        videoTrackClones.get(NO_PROXY).forEach((track) => track.stop())
        videoTrackClones.set([newVideoTrack])
        videoElement!.srcObject = new MediaStream([newVideoTrack])
        if (isScreen) {
          applyScreenshareToTexture(videoElement!)
        }
        videoDisplayReady.set(true)
        console.log({ videoElement, newVideoTrack })
        // }
      }
    }, 100)

    return () => {
      videoTrackClones.get(NO_PROXY).forEach((track) => track.stop())
    }
  }, [videoMediaStream])

  useEffect(() => {
    if (!isSelf && !videoStreamPaused && videoMediaStream != null && videoElement != null) {
      const originalTrackEnabledInterval = setInterval(() => {
        const videoTrack = videoMediaStream.getVideoTracks()[0]
        if (videoTrack.enabled) {
          clearInterval(originalTrackEnabledInterval)

          if (!(videoElement?.srcObject as MediaStream)?.getVideoTracks()[0].enabled) {
            const newVideoTrack = videoTrack.clone()
            videoTrackClones.get(NO_PROXY).forEach((track) => track.stop())
            videoTrackClones.set([newVideoTrack])
            videoElement!.srcObject = new MediaStream([newVideoTrack])
          }
        }
      }, 100)
    }
    if (isSelf && videoStreamPaused && videoMediaStream != null && videoElement != null)
      videoTrackClones.get(NO_PROXY).forEach((track) => track.stop())
  }, [videoStreamPaused])

  useEffect(() => {
    if (!isSelf && !audioStreamPaused && audioMediaStream != null && audioElement != null) {
      const originalTrackEnabledInterval = setInterval(() => {
        const audioTrack = audioMediaStream.getAudioTracks()[0]
        if (audioTrack.enabled) {
          clearInterval(originalTrackEnabledInterval)

          if (!(audioElement?.srcObject as MediaStream)?.getAudioTracks()[0].enabled) {
            const newAudioTrack = audioTrack.clone()
            const updateAudioTrackClones = audioTrackClones.get(NO_PROXY).concat(newAudioTrack)
            audioTrackClones.set(updateAudioTrackClones)
            audioElement!.srcObject = new MediaStream([newAudioTrack])
          }
        }
      })
    }
  }, [audioStreamPaused])

  useEffect(() => {
    mediaStreamState.microphoneGainNode.value?.gain.setTargetAtTime(
      audioState.microphoneGain.value,
      audioState.audioContext.currentTime.value,
      0.01
    )
  }, [audioState.microphoneGain.value])

  const toggleVideo = async (e) => {
    e.stopPropagation()
    const mediaNetwork = NetworkState.mediaNetwork
    if (isSelf && !isScreen) {
      MediaStreamState.toggleWebcamPaused()
    } else if (isSelf && isScreen) {
      MediaStreamState.toggleScreenshareVideoPaused()
    } else {
      mediaNetwork.pauseTrack(
        peerID,
        isScreen ? screenshareVideoDataChannelType : webcamVideoDataChannelType,
        !videoStreamPaused
      )
    }
  }

  const toggleAudio = async (e) => {
    e.stopPropagation()
    const mediaNetwork = NetworkState.mediaNetwork
    if (isSelf && !isScreen) {
      MediaStreamState.toggleMicrophonePaused()
    } else if (isSelf && isScreen) {
      MediaStreamState.toggleScreenshareAudioPaused()
    } else {
      mediaNetwork.pauseTrack(
        peerID,
        isScreen ? screenshareAudioDataChannelType : webcamAudioDataChannelType,
        !audioStreamPaused
      )
    }
  }

  const toggleGlobalMute = async (e) => {
    e.stopPropagation()
    /** @todo */
    // const mediaNetwork = NetworkState.mediaNetwork
    // const audioStreamProducer = audioStream as ConsumerExtension
    // if (!audioProducerGlobalMute) {
    //   MediasoupMediaProducerConsumerState.globalMuteProducer(mediaNetwork, audioStreamProducer.producerId)
    //   peerMediaChannelState.audioProducerGlobalMute.set(true)
    // } else if (audioProducerGlobalMute) {
    //   MediasoupMediaProducerConsumerState.globalUnmuteProducer(mediaNetwork, audioStreamProducer.producerId)
    //   peerMediaChannelState.audioProducerGlobalMute.set(false)
    // }
  }

  const adjustVolume = (e, value) => {
    if (isSelf) {
      getMutableState(AudioState).microphoneGain.set(value)
    } else {
      audioElement!.volume = value
    }
    _volume.set(value)
  }

  const user = useGet(userPath, userId)

  const getUsername = () => {
    if (isSelf && !isScreen) return t('user:person.you')
    if (isSelf && isScreen) return t('user:person.yourScreen')
    const username = user.data?.name ?? 'A User'
    if (!isSelf && isScreen) return username + "'s Screen"
    return username
  }

  const togglePiP = () => isPiP.set(!isPiP.value)

  const username = getUsername() as UserName

  const avatarThumbnail = useUserAvatarThumbnail(userId)

  const handleVisibilityChange = () => {
    if (document.hidden) {
      if (!videoStreamPaused) {
        resumeVideoOnUnhide.current = true
        toggleVideo({
          stopPropagation: () => {}
        })
      }
      if (!audioStreamPaused) {
        resumeAudioOnUnhide.current = true
        toggleAudio({
          stopPropagation: () => {}
        })
      }
    }
    if (!document.hidden) {
      if (resumeVideoOnUnhide.current)
        toggleVideo({
          stopPropagation: () => {}
        })
      if (resumeAudioOnUnhide.current)
        toggleAudio({
          stopPropagation: () => {}
        })
      resumeVideoOnUnhide.current = false
      resumeAudioOnUnhide.current = false
    }
  }

  useEffect(() => {
    if (isMobile) {
      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [])

  return {
    isPiP: isPiP.value,
    volume,
    isScreen,
    username,
    selfUser,
    isSelf,
    videoMediaStream,
    audioMediaStream,
    avatarThumbnail,
    videoStreamPaused,
    audioStreamPaused,
    videoDisplayReady: videoDisplayReady.value,
    soundIndicatorOn: soundIndicatorOn.value,
    togglePiP,
    toggleAudio,
    toggleVideo,
    adjustVolume,
    /** @todo reimplement global mute */
    // enableGlobalMute,
    // toggleGlobalMute,
    rendered
  }
}

export const UserMediaWindow = ({ peerID, type }: Props): JSX.Element => {
  const {
    isPiP,
    volume,
    isScreen,
    username,
    selfUser,
    isSelf,
    videoMediaStream,
    audioMediaStream,
    avatarThumbnail,
    videoStreamPaused,
    audioStreamPaused,
    videoDisplayReady,
    soundIndicatorOn,
    togglePiP,
    toggleAudio,
    toggleVideo,
    adjustVolume,
    rendered
  } = useUserMediaWindowHook({ peerID, type })

  const { t } = useTranslation()

  const { initialized, openChat } = useZendesk()

  const peerMediaChannelState = useHookstate(
    getMutableState(PeerMediaChannelState)[peerID][type] as State<PeerMediaStreamInterface>
  )

  const { videoElement, audioElement } = peerMediaChannelState.value as PeerMediaStreamInterface

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasCtxRef = useRef<CanvasRenderingContext2D>()

  const clientSettingQuery = useFind(clientSettingPath)
  const clientSetting = clientSettingQuery.data[0]

  useDrawMocapLandmarks(videoElement, canvasCtxRef, canvasRef, peerID)

  useEffect(() => {
    videoElement.draggable = false
    document.getElementById(peerID + '-' + type + '-video-container')!.append(videoElement)
    document.getElementById(peerID + '-' + type + '-audio-container')!.append(audioElement)
  }, [])

  useEffect(() => {
    if (canvasRef.current && canvasRef.current.width !== videoElement.clientWidth) {
      canvasRef.current.width = videoElement.clientWidth
    }

    if (canvasRef.current && canvasRef.current.height !== videoElement.clientHeight) {
      canvasRef.current.height = videoElement.clientHeight
    }

    if (canvasRef.current) canvasCtxRef.current = canvasRef.current.getContext('2d')!
  })

  /** @todo move to reactor and hoist isPip or something to a state */
  // useEffect(() => {
  //   if (!videoStream) return
  //   const mediaNetwork = NetworkState.mediaNetwork
  //   const encodings = videoStream.rtpParameters.encodings

  //   const immersiveMedia = getMutableState(MediaSettingsState).immersiveMedia
  //   const { maxResolution } = clientSetting.mediaSettings.video
  //   const resolution = VideoConstants.VIDEO_CONSTRAINTS[maxResolution] || VideoConstants.VIDEO_CONSTRAINTS.hd
  //   if (isPiP || immersiveMedia.value) {
  //     let maxLayer
  //     const scalabilityMode = encodings && encodings[0].scalabilityMode
  //     if (!scalabilityMode) maxLayer = 0
  //     else {
  //       const execed = /L([0-9])/.exec(scalabilityMode)
  //       if (execed) maxLayer = parseInt(execed[1]) - 1 //Subtract 1 from max scalabilityMode since layers are 0-indexed
  //       else maxLayer = 0
  //     }
  //     // If we're in immersive media mode, using max-resolution video for everyone could overwhelm some devices.
  //     // If there are more than 2 layers, then use layer n-1 to balance quality and performance
  //     // (immersive video bubbles are bigger than the flat bubbles, so low-quality video will be more noticeable).
  //     // If we're not, then the highest layer is still probably more than necessary, so use the n-1 layer unless the
  //     // n layer is under a specified constant
  //     MediasoupMediaProducerConsumerState.setPreferredConsumerLayer(
  //       mediaNetwork,
  //       videoStream.id,
  //       (immersiveMedia.value && maxLayer) > 1
  //         ? maxLayer - 1
  //         : (!isScreen && resolution.height.ideal) > MAX_RES_TO_USE_TOP_LAYER
  //         ? maxLayer - 1
  //         : maxLayer
  //     )
  //   }
  //   // Standard video bubbles in flat/non-immersive mode should use the lowest quality layer for performance reasons
  //   else MediasoupMediaProducerConsumerState.setPreferredConsumerLayer(mediaNetwork, videoStream.id, 0)
  // }, [videoStream, isPiP])

  return (
    <Draggable isPiP={isPiP}>
      <div
        tabIndex={0}
        id={peerID + '_' + type + '_container'}
        className={classNames({
          [styles['resizeable-screen']]: isScreen && !isPiP,
          [styles['resizeable-screen-fullscreen']]: isScreen && isPiP,
          [styles['party-chat-user']]: true,
          [styles['self-user']]: isSelf && !isScreen,
          [styles['no-video']]: videoMediaStream == null,
          [styles['video-paused']]: (videoMediaStream && videoStreamPaused) || !videoDisplayReady,
          [styles.pip]: isPiP && !isScreen,
          [styles.screenpip]: isPiP && isScreen,
          [styles['not-rendered']]: !isSelf && !rendered
        })}
        style={{
          pointerEvents: 'auto'
        }}
        onClick={() => {
          if (isScreen && isPiP) togglePiP()
        }}
      >
        <div
          className={classNames({
            [styles['video-wrapper']]: !isScreen,
            [styles['screen-video-wrapper']]: isScreen,
            [styles['border-lit']]: soundIndicatorOn && (isSelf ? !audioStreamPaused : !audioStreamPaused)
          })}
        >
          {(!videoMediaStream ||
            videoStreamPaused ||
            // videoProducerGlobalMute ||
            !videoDisplayReady) && <img src={avatarThumbnail} alt="" crossOrigin="anonymous" draggable={false} />}
          <span key={peerID + '-' + type + '-video-container'} id={peerID + '-' + type + '-video-container'} />
          <div
            className={classNames({
              [styles['canvas-container']]: true,
              [styles['canvas-rotate']]: !isSelf
            })}
          >
            <Canvas ref={canvasRef} />
          </div>
        </div>
        <span key={peerID + '-' + type + '-audio-container'} id={peerID + '-' + type + '-audio-container'} />
        <div className={styles['user-controls']}>
          <div className={styles['username']}>{username}</div>
          {initialized && isPiP && !isSelf && (
            <button
              style={{
                display: 'flex',
                flexDirection: 'row',
                position: 'relative',
                width: '50%',
                left: '25%',
                alignItems: 'center',
                alignContent: 'center',
                height: '2rem',
                marginTop: '1rem',
                marginBottom: '0.5rem',
                borderRadius: '10px',
                backgroundColor: 'red'
              }}
              onClick={openChat}
            >
              <Icon
                type="Report"
                style={{
                  display: 'block',
                  width: '20px',
                  height: '20px',
                  margin: '8px',
                  color: 'var(--inputBackground)'
                }}
              />
              <Text
                align="center"
                sx={{
                  marginLeft: '8px',
                  fontSize: '12px',
                  color: 'var(--inputBackground)'
                }}
              >
                {t('social:user.reportUser')}
              </Text>
            </button>
          )}
          <div className={styles['controls']}>
            <div className={styles['mute-controls']}>
              {videoMediaStream && (
                <Tooltip title={!videoStreamPaused && !videoStreamPaused ? 'Pause Video' : 'Resume Video'}>
                  <IconButton
                    size="large"
                    className={classNames({
                      [styles['icon-button']]: true,
                      [styles.mediaOff]: videoStreamPaused,
                      [styles.mediaOn]: !videoStreamPaused
                    })}
                    onClick={toggleVideo}
                    icon={<Icon type={videoStreamPaused ? 'VideocamOff' : 'Videocam'} />}
                  />
                </Tooltip>
              )}
              {/* {enableGlobalMute && !isSelf && audioMediaStream && (
                <Tooltip
                  title={
                    !audioProducerGlobalMute
                      ? (t('user:person.muteForEveryone') as string)
                      : (t('user:person.unmuteForEveryone') as string)
                  }
                >
                  <IconButton
                    size="large"
                    className={classNames({
                      [styles['icon-button']]: true,
                      [styles.mediaOff]: audioProducerGlobalMute,
                      [styles.mediaOn]: !audioProducerGlobalMute
                    })}
                    onClick={toggleGlobalMute}
                    icon={<Icon type={audioProducerGlobalMute ? 'VoiceOverOff' : 'RecordVoiceOver'} />}
                  />
                </Tooltip>
              )} */}
              {audioMediaStream && (
                <Tooltip
                  title={
                    (isSelf && !audioStreamPaused
                      ? t('user:person.muteMe')
                      : isSelf && audioStreamPaused
                      ? t('user:person.unmuteMe')
                      : !isSelf && !audioStreamPaused
                      ? t('user:person.muteThisPerson')
                      : t('user:person.unmuteThisPerson')) as string
                  }
                >
                  <IconButton
                    size="large"
                    className={classNames({
                      [styles['icon-button']]: true,
                      [styles.mediaOff]: audioStreamPaused,
                      [styles.mediaOn]: !audioStreamPaused
                    })}
                    onClick={toggleAudio}
                    icon={
                      <Icon
                        type={
                          isSelf ? (audioStreamPaused ? 'MicOff' : 'Mic') : audioStreamPaused ? 'VolumeOff' : 'VolumeUp'
                        }
                      />
                    }
                  />
                </Tooltip>
              )}
              <Tooltip title={t('user:person.openPictureInPicture') as string}>
                <IconButton
                  size="large"
                  className={styles['icon-button']}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    togglePiP()
                  }}
                  icon={<Icon type="Launch" className={styles.pipBtn} />}
                />
              </Tooltip>
            </div>
            {/* {audioProducerGlobalMute && <div className={styles['global-mute']}>Muted by Admin</div>} */}
            {audioMediaStream && !audioStreamPaused && (
              // && !audioProducerGlobalMute
              <div className={styles['audio-slider']}>
                {volume === 0 && <Icon type="VolumeMute" />}
                {volume > 0 && volume < 0.7 && <Icon type="VolumeDown" />}
                {volume >= 0.7 && <Icon type="VolumeUp" />}
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={adjustVolume}
                  aria-labelledby="continuous-slider"
                  style={{ color: 'var(--textColor)' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Draggable>
  )
}

export const UserMediaWindowWidget = ({ peerID, type }: Props): JSX.Element => {
  const { username, isSelf, videoMediaStream, avatarThumbnail, videoStreamPaused, audioStreamPaused, toggleAudio } =
    useUserMediaWindowHook({ peerID, type })

  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!ref.current || ref.current.srcObject || !videoMediaStream) return

    ref.current.id = `${peerID}_video_xrui`
    ref.current.autoplay = true
    ref.current.muted = true
    ref.current.setAttribute('playsinline', 'true')

    const newVideoTrack = videoMediaStream.getVideoTracks()[0].clone()
    ref.current.srcObject = new MediaStream([newVideoTrack])
    ref.current.play()
  }, [ref.current, videoMediaStream])

  return (
    <div
      style={{
        height: '100px',
        width: '100px',
        background: 'white',
        // borderRadius: '50px', // todo - fix video overflow to make round - see if we can replace the geometry of the layer with a circle geom
        border: '3px solid var(--iconButtonSelectedBackground)',
        overflow: 'hidden'
      }}
      xr-layer="true"
    >
      {!videoMediaStream || videoStreamPaused ? (
        <img
          style={{
            height: 'auto',
            maxWidth: '100%'
          }}
          src={avatarThumbnail}
          alt=""
          crossOrigin="anonymous"
          draggable={false}
          xr-layer="true"
        />
      ) : (
        <video
          xr-layer="true"
          style={{ height: 'auto', maxWidth: '100px' }}
          ref={ref}
          key={peerID + '-video-container'}
          id={peerID + '-video-container-xrui'}
        />
      )}
      <div
        style={{
          fontFamily: 'var(--lato)',
          textAlign: 'center',
          width: '100%',
          margin: '14px 0',
          color: 'var(--textColor)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
        xr-layer="true"
      >
        {username}
        <button style={{ margin: 0 }} onClick={toggleAudio} xr-layer="true">
          <Icon
            xr-layer="true"
            type={isSelf ? (audioStreamPaused ? 'MicOff' : 'Mic') : audioStreamPaused ? 'VolumeOff' : 'VolumeUp'}
          />
        </button>
      </div>
    </div>
  )
}
