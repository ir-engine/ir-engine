import { Downgraded, State, useHookstate } from '@hookstate/core'
import classNames from 'classnames'
import hark from 'hark'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useMediaStreamState } from '@etherealengine/client-core/src/media/services/MediaStreamService'
import { useLocationState } from '@etherealengine/client-core/src/social/services/LocationService'
import {
  globalMuteProducer,
  globalUnmuteProducer,
  pauseConsumer,
  ProducerExtension,
  resumeConsumer,
  toggleMicrophonePaused,
  toggleScreenshareAudioPaused,
  toggleScreenshareVideoPaused,
  toggleWebcamPaused
} from '@etherealengine/client-core/src/transports/SocketWebRTCClientFunctions'
import { getAvatarURLForUser } from '@etherealengine/client-core/src/user/components/UserMenu/util'
import { useAuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { useNetworkUserState } from '@etherealengine/client-core/src/user/services/NetworkUserService'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { AudioSettingAction, AudioState, useAudioState } from '@etherealengine/engine/src/audio/AudioState'
import { getMediaSceneMetadataState } from '@etherealengine/engine/src/audio/systems/MediaSystem'
import { isMobile } from '@etherealengine/engine/src/common/functions/isMobile'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { useEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { MessageTypes } from '@etherealengine/engine/src/networking/enums/MessageTypes'
import { WorldState } from '@etherealengine/engine/src/networking/interfaces/WorldState'
import { MediaSettingsState } from '@etherealengine/engine/src/networking/MediaSettingsState'
import { applyScreenshareToTexture } from '@etherealengine/engine/src/scene/functions/applyScreenshareToTexture'
import { dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'
import Icon from '@etherealengine/ui/src/Icon'
import IconButton from '@etherealengine/ui/src/IconButton'
import Slider from '@etherealengine/ui/src/Slider'
import Tooltip from '@etherealengine/ui/src/Tooltip'

import { useMediaInstance } from '../../common/services/MediaInstanceConnectionService'
import { MediaStreamState } from '../../transports/MediaStreams'
import { PeerMediaChannelState, PeerMediaStreamInterface } from '../../transports/PeerMediaChannelState'
import { ConsumerExtension, SocketWebRTCClientNetwork } from '../../transports/SocketWebRTCClientFunctions'
import Draggable from './Draggable'
import styles from './index.module.scss'

interface Props {
  peerID: PeerID
  type: 'screen' | 'cam'
}

/** @todo separate all media state from UI state and move it to hookstate record keyed to peerID */
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
  } = peerMediaChannelState.value

  useEffect(() => {
    videoElement.draggable = false
    document.getElementById(peerID + '-video-container')!.append(videoElement)
    document.getElementById(peerID + '-audio-container')!.append(audioElement)
  }, [])

  const [audioTrackClones, setAudioTrackClones] = useState<any[]>([])
  const [videoTrackClones, setVideoTrackClones] = useState<any[]>([])
  const [videoTrackId, setVideoTrackId] = useState('')
  const [audioTrackId, setAudioTrackId] = useState('')

  const [harkListener, setHarkListener] = useState(null as ReturnType<typeof hark> | null)
  const [soundIndicatorOn, setSoundIndicatorOn] = useState(false)
  const [isPiP, setPiP] = useState(false)
  const [videoDisplayReady, setVideoDisplayReady] = useState<boolean>(false)

  const userState = useNetworkUserState()
  const resumeVideoOnUnhide = useRef<boolean>(false)
  const resumeAudioOnUnhide = useRef<boolean>(false)

  const { t } = useTranslation()
  const audioState = useAudioState()

  const [_volume, _setVolume] = useState(1)

  const selfUser = useAuthState().user.value
  const currentLocation = useLocationState().currentLocation.location
  const enableGlobalMute =
    currentLocation?.locationSetting?.locationType?.value === 'showroom' &&
    selfUser?.locationAdmins?.find((locationAdmin) => currentLocation?.id?.value === locationAdmin.locationId) != null

  const mediaNetwork = Engine.instance.mediaNetwork
  const isSelf = !mediaNetwork || peerID === mediaNetwork?.peerID
  const volume = isSelf ? audioState.microphoneGain.value : _volume
  const isScreen = type === 'screen'
  const userId = mediaNetwork ? mediaNetwork?.peers!.get(peerID!)?.userId : ''
  const user = userState.layerUsers.find((user) => user.id.value === userId)?.attach(Downgraded).value

  const mediaStreamState = useHookstate(getMutableState(MediaStreamState))
  const mediaSettingState = useHookstate(getMutableState(MediaSettingsState))
  const mediaState = getMediaSceneMetadataState()
  const rendered =
    mediaSettingState.immersiveMediaMode.value === 'off' ||
    (mediaSettingState.immersiveMediaMode.value === 'auto' && !mediaState.immersiveMedia.value)

  useEffect(() => {
    if (peerMediaChannelState.videoStream.value?.track)
      setVideoTrackId(peerMediaChannelState.videoStream.value.track.id)
  }, [peerMediaChannelState.videoStream])

  useEffect(() => {
    if (peerMediaChannelState.audioStream.value?.track)
      setAudioTrackId(peerMediaChannelState.audioStream.value.track.id)
  }, [peerMediaChannelState.audioStream])

  useEffect(() => {
    function onUserInteraction() {
      videoElement?.play()
      audioElement?.play()
      harkListener?.resume()
    }
    window.addEventListener('pointerdown', onUserInteraction)
    return () => {
      window.removeEventListener('pointerdown', onUserInteraction)
    }
  }, [videoElement, audioElement, harkListener])

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
        const updateAudioTrackClones = audioTrackClones.concat(newAudioTrack)
        setAudioTrackClones(updateAudioTrackClones)
        audioElement.srcObject = new MediaStream([newAudioTrack])
        const newHark = hark(audioElement.srcObject, { play: false })
        newHark.on('speaking', () => {
          setSoundIndicatorOn(true)
        })
        newHark.on('stopped_speaking', () => {
          setSoundIndicatorOn(false)
        })
        setHarkListener(newHark)
        peerMediaChannelState.audioProducerPaused.set(audioStream.paused)
      }
    }

    return () => {
      audioTrackClones.forEach((track) => track.stop())
      if (harkListener) (harkListener as any).stop()
    }
  }, [audioTrackId])

  useEffect(() => {
    videoElement.id = `${peerID}_video`
    videoElement.autoplay = true
    videoElement.muted = true
    videoElement.setAttribute('playsinline', 'true')
    if (videoStream != null) {
      setVideoDisplayReady(false)
      if (isSelf) peerMediaChannelState.videoProducerPaused.set(false)
      const originalTrackEnabledInterval = setInterval(() => {
        if (videoStream.track!.enabled) {
          clearInterval(originalTrackEnabledInterval)

          // if (!videoRef?.srcObject?.active || !videoRef?.srcObject?.getVideoTracks()[0].enabled) {
          const newVideoTrack = videoStream.track!.clone()
          videoTrackClones.forEach((track) => track.stop())
          setVideoTrackClones([newVideoTrack])
          videoElement!.srcObject = new MediaStream([newVideoTrack])
          if (isScreen) {
            applyScreenshareToTexture(videoElement!)
          }
          setVideoDisplayReady(true)
          // }
        }
      }, 100)
    }

    return () => {
      videoTrackClones.forEach((track) => track.stop())
    }
  }, [videoTrackId])

  useEffect(() => {
    if (!isSelf && !videoProducerPaused && videoStream != null && videoElement != null) {
      const originalTrackEnabledInterval = setInterval(() => {
        if (videoStream.track!.enabled) {
          clearInterval(originalTrackEnabledInterval)

          if (!(videoElement?.srcObject as MediaStream)?.getVideoTracks()[0].enabled) {
            const newVideoTrack = videoStream.track!.clone()
            videoTrackClones.forEach((track) => track.stop())
            setVideoTrackClones([newVideoTrack])
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
            const updateAudioTrackClones = audioTrackClones.concat(newAudioTrack)
            setAudioTrackClones(updateAudioTrackClones)
            audioElement!.srcObject = new MediaStream([newAudioTrack])
          }
        }
      })
    }
  }, [audioProducerPaused])

  useEffect(() => {
    mediaStreamState.microphoneGainNode.value?.gain.setTargetAtTime(
      audioState.microphoneGain.value,
      getState(AudioState).audioContext.currentTime,
      0.01
    )
  }, [audioState.microphoneGain])

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
    _setVolume(value)
  }

  const getUsername = () => {
    if (isSelf && !isScreen) return t('user:person.you')
    if (isSelf && isScreen) return t('user:person.yourScreen')
    if (!isSelf && isScreen) return user?.name + "'s Screen"
    return user?.name
  }

  const togglePiP = () => setPiP(!isPiP)

  const username = getUsername()

  const userAvatarDetails = useHookstate(getMutableState(WorldState).userAvatarDetails)

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
    user,
    isPiP,
    volume,
    isScreen,
    username,
    selfUser,
    isSelf,
    videoStream,
    audioStream,
    enableGlobalMute,
    userAvatarDetails,
    videoStreamPaused,
    audioStreamPaused,
    videoProducerPaused,
    audioProducerPaused,
    videoProducerGlobalMute,
    audioProducerGlobalMute,
    videoDisplayReady,
    soundIndicatorOn,
    t,
    togglePiP,
    toggleAudio,
    toggleVideo,
    adjustVolume,
    toggleGlobalMute,
    rendered
  }
}

const UserMediaWindow = ({ peerID, type }: Props): JSX.Element => {
  const {
    user,
    isPiP,
    volume,
    isScreen,
    username,
    selfUser,
    isSelf,
    videoStream,
    audioStream,
    enableGlobalMute,
    userAvatarDetails,
    videoStreamPaused,
    audioStreamPaused,
    videoProducerPaused,
    audioProducerPaused,
    videoProducerGlobalMute,
    audioProducerGlobalMute,
    videoDisplayReady,
    soundIndicatorOn,
    t,
    togglePiP,
    toggleAudio,
    toggleVideo,
    adjustVolume,
    toggleGlobalMute,
    rendered
  } = useUserMediaWindowHook({ peerID, type })

  return (
    <Draggable isPiP={isPiP}>
      <div
        tabIndex={0}
        id={peerID + '_container'}
        className={classNames({
          [styles['resizeable-screen']]: isScreen && !isPiP,
          [styles['resizeable-screen-fullscreen']]: isScreen && isPiP,
          [styles['party-chat-user']]: true,
          [styles['self-user']]: isSelf && !isScreen,
          [styles['no-video']]: videoStream == null,
          [styles['video-paused']]: (videoStream && (videoProducerPaused || videoStreamPaused)) || !videoDisplayReady,
          [styles.pip]: isPiP && !isScreen,
          [styles.screenpip]: isPiP && isScreen
        })}
        style={{
          pointerEvents: 'auto',
          display: isSelf || rendered ? 'auto' : 'none'
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
            !videoDisplayReady) && (
            <img
              src={getAvatarURLForUser(userAvatarDetails, isSelf ? selfUser?.id : user?.id)}
              alt=""
              crossOrigin="anonymous"
              draggable={false}
            />
          )}
          <span key={peerID + '-video-container'} id={peerID + '-video-container'} />
        </div>
        <span key={peerID + '-audio-container'} id={peerID + '-audio-container'} />
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

export default UserMediaWindow
