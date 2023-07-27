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

import classNames from 'classnames'
import hark from 'hark'
import { t } from 'i18next'
import React, { useEffect, useRef } from 'react'

import { LocationState } from '@etherealengine/client-core/src/social/services/LocationService'
import {
  globalMuteProducer,
  globalUnmuteProducer,
  pauseConsumer,
  resumeConsumer,
  setPreferredConsumerLayer,
  toggleMicrophonePaused,
  toggleScreenshareAudioPaused,
  toggleScreenshareVideoPaused,
  toggleWebcamPaused
} from '@etherealengine/client-core/src/transports/SocketWebRTCClientFunctions'
import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { AudioSettingAction, AudioState } from '@etherealengine/engine/src/audio/AudioState'
import { isMobile } from '@etherealengine/engine/src/common/functions/isMobile'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { WorldState } from '@etherealengine/engine/src/networking/interfaces/WorldState'
import { MediaSettingsState } from '@etherealengine/engine/src/networking/MediaSettingsState'
import { applyScreenshareToTexture } from '@etherealengine/engine/src/scene/functions/applyScreenshareToTexture'
import { dispatchAction, getMutableState, State, useHookstate } from '@etherealengine/hyperflux'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'
import Slider from '@etherealengine/ui/src/primitives/mui/Slider'
import Tooltip from '@etherealengine/ui/src/primitives/mui/Tooltip'

import { MediaStreamState } from '../../transports/MediaStreams'
import { PeerMediaChannelState, PeerMediaStreamInterface } from '../../transports/PeerMediaChannelState'
import { ConsumerExtension, SocketWebRTCClientNetwork } from '../../transports/SocketWebRTCClientFunctions'
import { useUserAvatarThumbnail } from '../../user/functions/useUserAvatarThumbnail'
import Draggable from './Draggable'
import styles from './index.module.scss'

interface Props {
  peerID: PeerID
  type: 'screen' | 'cam'
}

export const useUserMediaWindowHook = ({ peerID, type }: Props) => {
  const peerMediaChannelState = useHookstate(
    getMutableState(PeerMediaChannelState)[peerID][type] as State<PeerMediaStreamInterface>
  )
  const {
    videoStream,
    audioStream,
    videoStreamPaused,
    audioStreamPaused,
    videoProducerPaused,
    audioProducerPaused,
    videoProducerGlobalMute,
    audioProducerGlobalMute,
    videoElement,
    audioElement
  } = peerMediaChannelState.get({ noproxy: true })

  const audioTrackClones = useHookstate<any[]>([])
  const videoTrackClones = useHookstate<any[]>([])
  const videoTrackId = useHookstate('')
  const audioTrackId = useHookstate('')

  const harkListener = useHookstate(null as ReturnType<typeof hark> | null)
  const soundIndicatorOn = useHookstate(false)
  const isPiP = useHookstate(false)
  const videoDisplayReady = useHookstate<boolean>(false)

  const resumeVideoOnUnhide = useRef<boolean>(false)
  const resumeAudioOnUnhide = useRef<boolean>(false)

  const audioState = useHookstate(getMutableState(AudioState))

  const _volume = useHookstate(1)

  const selfUser = useHookstate(getMutableState(AuthState).user).get({ noproxy: true })
  const currentLocation = useHookstate(getMutableState(LocationState).currentLocation.location)
  const enableGlobalMute =
    currentLocation?.locationSetting?.locationType?.value === 'showroom' &&
    selfUser?.locationAdmins?.find((locationAdmin) => currentLocation?.id?.value === locationAdmin.locationId) != null

  const mediaNetwork = Engine.instance.mediaNetwork
  const isSelf =
    !mediaNetwork ||
    peerID === Engine.instance.peerID ||
    (mediaNetwork?.peers &&
      Array.from(mediaNetwork.peers.values()).find((peer) => peer.userId === selfUser.id)?.peerID === peerID) ||
    peerID === 'self'
  const volume = isSelf ? audioState.microphoneGain.value : _volume.value
  const isScreen = type === 'screen'
  const userId = isSelf ? selfUser?.id : mediaNetwork?.peers?.get(peerID!)?.userId

  const mediaStreamState = useHookstate(getMutableState(MediaStreamState))
  const mediaSettingState = useHookstate(getMutableState(MediaSettingsState))
  const rendered = !mediaSettingState.immersiveMedia.value

  useEffect(() => {
    if (peerMediaChannelState.videoStream.value?.track)
      videoTrackId.set(peerMediaChannelState.videoStream.value.track.id)
  }, [peerMediaChannelState.videoStream])

  useEffect(() => {
    if (peerMediaChannelState.audioStream.value?.track)
      audioTrackId.set(peerMediaChannelState.audioStream.value.track.id)
  }, [peerMediaChannelState.audioStream])

  useEffect(() => {
    function onUserInteraction() {
      videoElement?.play()
      audioElement?.play()
      harkListener?.value?.resume()
    }
    window.addEventListener('pointerdown', onUserInteraction)
    return () => {
      window.removeEventListener('pointerdown', onUserInteraction)
    }
  }, [videoElement, audioElement, harkListener?.value])

  useEffect(() => {
    if (audioElement != null) {
      audioElement.id = `${peerID}_audio`
      audioElement.autoplay = true
      audioElement.setAttribute('playsinline', 'true')
      if (isSelf) {
        audioElement.muted = true
      } else {
        audioElement.volume = volume
      }
      if (audioStream != null) {
        const newAudioTrack = audioStream.track!.clone()
        const updateAudioTrackClones = audioTrackClones.get({ noproxy: true }).concat(newAudioTrack)
        audioTrackClones.set(updateAudioTrackClones)
        audioElement.srcObject = new MediaStream([newAudioTrack])
        const newHark = hark(audioElement.srcObject, { play: false })
        newHark.on('speaking', () => {
          soundIndicatorOn.set(true)
        })
        newHark.on('stopped_speaking', () => {
          soundIndicatorOn.set(false)
        })
        harkListener.set(newHark)
        peerMediaChannelState.audioProducerPaused.set(audioStream.paused)
      }
    }

    return () => {
      audioTrackClones.get({ noproxy: true }).forEach((track) => track.stop())
      if (harkListener?.value) (harkListener.value as any).stop()
    }
  }, [audioTrackId.value])

  useEffect(() => {
    videoElement.id = `${peerID}_video`
    videoElement.autoplay = true
    videoElement.muted = true
    videoElement.setAttribute('playsinline', 'true')
    if (videoStream != null) {
      videoDisplayReady.set(false)
      if (isSelf) peerMediaChannelState.videoProducerPaused.set(false)
      const originalTrackEnabledInterval = setInterval(() => {
        if (videoStream.track!.enabled) {
          clearInterval(originalTrackEnabledInterval)

          // if (!videoRef?.srcObject?.active || !videoRef?.srcObject?.getVideoTracks()[0].enabled) {
          const newVideoTrack = videoStream.track!.clone()
          videoTrackClones.get({ noproxy: true }).forEach((track) => track.stop())
          videoTrackClones.set([newVideoTrack])
          videoElement!.srcObject = new MediaStream([newVideoTrack])
          if (isScreen) {
            applyScreenshareToTexture(videoElement!)
          }
          videoDisplayReady.set(true)
          // }
        }
      }, 100)
    }

    return () => {
      videoTrackClones.get({ noproxy: true }).forEach((track) => track.stop())
    }
  }, [videoTrackId.value])

  useEffect(() => {
    if (!isSelf && !videoProducerPaused && videoStream != null && videoElement != null) {
      const originalTrackEnabledInterval = setInterval(() => {
        if (videoStream.track!.enabled) {
          clearInterval(originalTrackEnabledInterval)

          if (!(videoElement?.srcObject as MediaStream)?.getVideoTracks()[0].enabled) {
            const newVideoTrack = videoStream.track!.clone()
            videoTrackClones.get({ noproxy: true }).forEach((track) => track.stop())
            videoTrackClones.set([newVideoTrack])
            videoElement!.srcObject = new MediaStream([newVideoTrack])
          }
        }
      }, 100)
    }
  }, [videoProducerPaused])

  useEffect(() => {
    if (!isSelf && !audioProducerPaused && audioStream != null && audioElement != null) {
      const originalTrackEnabledInterval = setInterval(() => {
        if (audioStream.track!.enabled) {
          clearInterval(originalTrackEnabledInterval)

          if (!(audioElement?.srcObject as MediaStream)?.getAudioTracks()[0].enabled) {
            const newAudioTrack = audioStream.track!.clone()
            const updateAudioTrackClones = audioTrackClones.get({ noproxy: true }).concat(newAudioTrack)
            audioTrackClones.set(updateAudioTrackClones)
            audioElement!.srcObject = new MediaStream([newAudioTrack])
          }
        }
      })
    }
  }, [audioProducerPaused])

  useEffect(() => {
    mediaStreamState.microphoneGainNode.value?.gain.setTargetAtTime(
      audioState.microphoneGain.value,
      audioState.audioContext.currentTime.value,
      0.01
    )
  }, [audioState.microphoneGain.value])

  const toggleVideo = async (e) => {
    e.stopPropagation()
    const mediaNetwork = Engine.instance.mediaNetwork as SocketWebRTCClientNetwork
    if (isSelf && !isScreen) {
      toggleWebcamPaused()
    } else if (isSelf && isScreen) {
      toggleScreenshareVideoPaused()
    } else {
      if (!videoStreamPaused) {
        await pauseConsumer(mediaNetwork, videoStream as ConsumerExtension)
        peerMediaChannelState.videoStreamPaused.set(true)
      } else {
        await resumeConsumer(mediaNetwork, videoStream as ConsumerExtension)
        peerMediaChannelState.videoStreamPaused.set(false)
      }
    }
  }

  const toggleAudio = async (e) => {
    e.stopPropagation()
    const mediaNetwork = Engine.instance.mediaNetwork as SocketWebRTCClientNetwork
    if (isSelf && !isScreen) {
      toggleMicrophonePaused()
    } else if (isSelf && isScreen) {
      toggleScreenshareAudioPaused()
    } else {
      if (!audioStreamPaused) {
        await pauseConsumer(mediaNetwork, audioStream as ConsumerExtension)
        peerMediaChannelState.audioStreamPaused.set(true)
      } else {
        await resumeConsumer(mediaNetwork, audioStream as ConsumerExtension)
        peerMediaChannelState.audioStreamPaused.set(false)
      }
    }
  }

  const toggleGlobalMute = async (e) => {
    e.stopPropagation()
    const mediaNetwork = Engine.instance.mediaNetwork as SocketWebRTCClientNetwork
    const audioStreamProducer = audioStream as ConsumerExtension
    if (!audioProducerGlobalMute) {
      await globalMuteProducer(mediaNetwork, { id: audioStreamProducer.producerId })
      peerMediaChannelState.audioProducerGlobalMute.set(true)
    } else if (audioProducerGlobalMute) {
      await globalUnmuteProducer(mediaNetwork, { id: audioStreamProducer.producerId })
      peerMediaChannelState.audioProducerGlobalMute.set(false)
    }
  }

  const adjustVolume = (e, value) => {
    if (isSelf) {
      dispatchAction(AudioSettingAction.setMicrophoneVolume({ value }))
    } else {
      audioElement!.volume = value
    }
    _volume.set(value)
  }

  const usernames = useHookstate(getMutableState(WorldState).userNames)
  const getUsername = () => {
    if (isSelf && !isScreen) return t('user:person.you')
    if (isSelf && isScreen) return t('user:person.yourScreen')
    const username = userId ? usernames.get({ noproxy: true })[userId] : 'A User'
    if (!isSelf && isScreen) return username + "'s Screen"
    return username
  }

  const togglePiP = () => isPiP.set(!isPiP.value)

  const username = getUsername()

  const avatarThumbnail = useUserAvatarThumbnail(userId)

  const handleVisibilityChange = () => {
    if (document.hidden) {
      if (videoStream != null && !videoStream.paused && !videoStreamPaused) {
        resumeVideoOnUnhide.current = true
        toggleVideo({
          stopPropagation: () => {}
        })
      }
      if (audioStream != null && !audioStream.paused && !audioStreamPaused) {
        resumeAudioOnUnhide.current = true
        toggleAudio({
          stopPropagation: () => {}
        })
      }
    }
    if (!document.hidden) {
      if (videoStream != null && resumeVideoOnUnhide.current)
        toggleVideo({
          stopPropagation: () => {}
        })
      if (audioStream != null && resumeAudioOnUnhide.current)
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
    videoStream,
    audioStream,
    enableGlobalMute,
    avatarThumbnail,
    videoStreamPaused,
    audioStreamPaused,
    videoProducerPaused,
    audioProducerPaused,
    videoProducerGlobalMute,
    audioProducerGlobalMute,
    videoDisplayReady: videoDisplayReady.value,
    soundIndicatorOn: soundIndicatorOn.value,
    togglePiP,
    toggleAudio,
    toggleVideo,
    adjustVolume,
    toggleGlobalMute,
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
    videoStream,
    audioStream,
    enableGlobalMute,
    avatarThumbnail,
    videoStreamPaused,
    audioStreamPaused,
    videoProducerPaused,
    audioProducerPaused,
    videoProducerGlobalMute,
    audioProducerGlobalMute,
    videoDisplayReady,
    soundIndicatorOn,
    togglePiP,
    toggleAudio,
    toggleVideo,
    adjustVolume,
    toggleGlobalMute,
    rendered
  } = useUserMediaWindowHook({ peerID, type })

  const peerMediaChannelState = useHookstate(
    getMutableState(PeerMediaChannelState)[peerID][type] as State<PeerMediaStreamInterface>
  )

  const { videoElement, audioElement } = peerMediaChannelState.value

  useEffect(() => {
    videoElement.draggable = false
    document.getElementById(peerID + '-' + type + '-video-container')!.append(videoElement)
    document.getElementById(peerID + '-' + type + '-audio-container')!.append(audioElement)
  }, [])

  useEffect(() => {
    if (!videoStream) return
    const mediaNetwork = Engine.instance.mediaNetwork as SocketWebRTCClientNetwork
    const encodings = videoStream.rtpParameters.encodings

    const immersiveMedia = getMutableState(MediaSettingsState).immersiveMedia
    if (isPiP || immersiveMedia.value) {
      let maxLayer
      const scalabilityMode = encodings && encodings[0].scalabilityMode
      if (!scalabilityMode) maxLayer = 0
      else {
        const execed = /L([0-9])/.exec(scalabilityMode)
        if (execed) maxLayer = parseInt(execed[1]) - 1 //Subtract 1 from max scalabilityMode since layers are 0-indexed
        else maxLayer = 0
      }
      // If we're in immersive media mode, using max-resolution video for everyone could overwhelm some devices.
      // If there are more than 2 layers, then use layer n-1 to balance quality and performance
      // (immersive video bubbles are bigger than the flat bubbles, so low-quality video will be more noticeable).
      // If we're not, then use the highest layer when opening PiP for a video
      setPreferredConsumerLayer(
        mediaNetwork,
        videoStream as ConsumerExtension,
        immersiveMedia && maxLayer > 1 ? maxLayer - 1 : maxLayer
      )
    }
    // Standard video bubbles in flat/non-immersive mode should use the lowest quality layer for performance reasons
    else setPreferredConsumerLayer(mediaNetwork, videoStream as ConsumerExtension, 0)
  }, [videoStream, isPiP])

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
          [styles['no-video']]: videoStream == null,
          [styles['video-paused']]: (videoStream && (videoProducerPaused || videoStreamPaused)) || !videoDisplayReady,
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
            [styles['border-lit']]: soundIndicatorOn && !audioStreamPaused
          })}
        >
          {(videoStream == null ||
            videoStreamPaused ||
            videoProducerPaused ||
            videoProducerGlobalMute ||
            !videoDisplayReady) && <img src={avatarThumbnail} alt="" crossOrigin="anonymous" draggable={false} />}
          <span key={peerID + '-' + type + '-video-container'} id={peerID + '-' + type + '-video-container'} />
        </div>
        <span key={peerID + '-' + type + '-audio-container'} id={peerID + '-' + type + '-audio-container'} />
        <div className={styles['user-controls']}>
          <div className={styles['username']}>{username}</div>
          <div className={styles['controls']}>
            <div className={styles['mute-controls']}>
              {videoStream && !videoProducerPaused ? (
                <Tooltip title={!videoProducerPaused && !videoStreamPaused ? 'Pause Video' : 'Resume Video'}>
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
              ) : null}
              {enableGlobalMute && !isSelf && audioStream && (
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
              )}
              {audioStream && !audioProducerPaused ? (
                <Tooltip
                  title={
                    (isSelf && audioStream?.paused === false
                      ? t('user:person.muteMe')
                      : isSelf && audioStream?.paused === true
                      ? t('user:person.unmuteMe')
                      : !isSelf && audioStream?.paused === false
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
              ) : null}
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
            {audioProducerGlobalMute && <div className={styles['global-mute']}>Muted by Admin</div>}
            {audioStream && !audioProducerPaused && !audioProducerGlobalMute && (
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
  const {
    volume,
    isScreen,
    username,
    selfUser,
    isSelf,
    videoStream,
    audioStream,
    enableGlobalMute,
    avatarThumbnail,
    videoStreamPaused,
    audioStreamPaused,
    videoProducerPaused,
    audioProducerPaused,
    videoProducerGlobalMute,
    audioProducerGlobalMute,
    videoDisplayReady,
    soundIndicatorOn,
    toggleAudio,
    toggleVideo,
    adjustVolume,
    toggleGlobalMute,
    rendered
  } = useUserMediaWindowHook({ peerID, type })

  const peerMediaChannelState = useHookstate(
    getMutableState(PeerMediaChannelState)[peerID][type] as State<PeerMediaStreamInterface>
  )

  const { videoStream: videoStreamState } = peerMediaChannelState

  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!ref.current || ref.current.srcObject || !videoStreamState?.value) return

    ref.current.id = `${peerID}_video_xrui`
    ref.current.autoplay = true
    ref.current.muted = true
    ref.current.setAttribute('playsinline', 'true')

    const newVideoTrack = videoStreamState.value.track!.clone()
    ref.current.srcObject = new MediaStream([newVideoTrack])
    ref.current.play()
  }, [ref.current, videoStreamState])

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
      {videoStream == null || videoStreamPaused || videoProducerPaused || videoProducerGlobalMute ? (
        <img src={avatarThumbnail} alt="" crossOrigin="anonymous" draggable={false} xr-layer="true" />
      ) : (
        <video
          xr-layer="true"
          style={{ maxWidth: '100px' }}
          ref={ref}
          key={peerID + '-video-container'}
          id={peerID + '-video-container-xrui'}
        />
      )}
      <div
        style={{
          fontFamily: "'Roboto', sans-serif",
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
        <button style={{}} onClick={toggleAudio} xr-layer="true">
          <Icon
            xr-layer="true"
            type={isSelf ? (audioStreamPaused ? 'MicOff' : 'Mic') : audioStreamPaused ? 'VolumeOff' : 'VolumeUp'}
          />
        </button>
      </div>
    </div>
  )
}
