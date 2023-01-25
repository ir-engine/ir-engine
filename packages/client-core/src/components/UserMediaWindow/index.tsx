import { Downgraded, useHookstate } from '@hookstate/core'
import classNames from 'classnames'
import hark from 'hark'
import { Producer } from 'mediasoup-client/lib/Producer'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MediaStreamService, useMediaStreamState } from '@xrengine/client-core/src/media/services/MediaStreamService'
import { useLocationState } from '@xrengine/client-core/src/social/services/LocationService'
import { MediaStreams } from '@xrengine/client-core/src/transports/MediaStreams'
import {
  configureMediaTransports,
  createCamAudioProducer,
  createCamVideoProducer,
  globalMuteProducer,
  globalUnmuteProducer,
  pauseConsumer,
  pauseProducer,
  resumeConsumer,
  resumeProducer,
  stopScreenshare
} from '@xrengine/client-core/src/transports/SocketWebRTCClientFunctions'
import { getAvatarURLForUser } from '@xrengine/client-core/src/user/components/UserMenu/util'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { useNetworkUserState } from '@xrengine/client-core/src/user/services/NetworkUserService'
import { PeerID } from '@xrengine/common/src/interfaces/PeerID'
import { AudioSettingAction, useAudioState } from '@xrengine/engine/src/audio/AudioState'
import { getMediaSceneMetadataState } from '@xrengine/engine/src/audio/systems/MediaSystem'
import { isMobile } from '@xrengine/engine/src/common/functions/isMobile'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { WorldState } from '@xrengine/engine/src/networking/interfaces/WorldState'
import { MediaSettingsState } from '@xrengine/engine/src/networking/MediaSettingsState'
import { applyScreenshareToTexture } from '@xrengine/engine/src/scene/functions/applyScreenshareToTexture'
import { dispatchAction, getState } from '@xrengine/hyperflux'

import {
  Launch,
  Mic,
  MicOff,
  RecordVoiceOver,
  Videocam,
  VideocamOff,
  VoiceOverOff,
  VolumeDown,
  VolumeMute,
  VolumeOff,
  VolumeUp
} from '@mui/icons-material'
import IconButton from '@mui/material/IconButton'
import Slider from '@mui/material/Slider'
import Tooltip from '@mui/material/Tooltip'

import { useMediaInstance, useMediaInstanceConnectionState } from '../../common/services/MediaInstanceConnectionService'
import { SocketWebRTCClientNetwork } from '../../transports/SocketWebRTCClientNetwork'
import Draggable from './Draggable'
import styles from './index.module.scss'

interface Props {
  peerID?: PeerID
  type?: 'screen' | 'cam'
}

export const useUserMediaWindowHook = ({ peerID, type }: Props) => {
  const isPiP = useHookstate(false)
  const videoStream = useHookstate(null as Producer | null)
  const audioStream = useHookstate(null as Producer | null)
  const videoStreamPaused = useHookstate(false)
  const audioStreamPaused = useHookstate(false)
  const videoProducerPaused = useHookstate(true)
  const audioProducerPaused = useHookstate(true)
  const videoProducerGlobalMute = useHookstate(false)
  const audioProducerGlobalMute = useHookstate(false)
  const audioTrackClones = useHookstate<MediaStreamTrack[]>([])
  const videoTrackClones = useHookstate<MediaStreamTrack[]>([])
  const videoTrackId = useHookstate('')
  const audioTrackId = useHookstate('')
  const harkListener = useHookstate(null as hark.Harker | null)
  const soundIndicatorOn = useHookstate(false)
  const videoDisplayReady = useHookstate(false)
  const userState = useNetworkUserState()
  const resumeVideoOnUnhide = useState(false)
  const resumeAudioOnUnhide = useState(false)
  const selfVideoPausedRef = useState(false)
  const selfAudioPausedRef = useState(false)
  const mediastream = useMediaStreamState()
  const { t } = useTranslation()
  const audioState = useAudioState()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [_volume, _setVolume] = useState(1)

  const selfUser = useAuthState().user.value
  const currentLocation = useLocationState().currentLocation.location
  const enableGlobalMute =
    currentLocation?.locationSetting?.locationType?.value === 'showroom' &&
    selfUser?.locationAdmins?.find((locationAdmin) => currentLocation?.id?.value === locationAdmin.locationId) != null

  const mediaNetwork = Engine.instance.currentWorld.mediaNetwork
  const isSelf = !mediaNetwork || peerID === mediaNetwork?.peerID
  const volume = isSelf ? audioState.microphoneGain.value : _volume
  const isScreen = type === 'screen'
  const userId = mediaNetwork ? mediaNetwork?.peers!.get(peerID!)?.userId : ''
  const user = userState.layerUsers.find((user) => user.id.value === userId)?.attach(Downgraded).value

  const isCamVideoEnabled = isScreen ? mediastream.isScreenVideoEnabled : mediastream.isCamVideoEnabled
  const isCamAudioEnabled = isScreen ? mediastream.isScreenAudioEnabled : mediastream.isCamAudioEnabled
  const consumers = mediastream.consumers

  const currentChannelInstanceConnection = useMediaInstance()

  const mediaSettingState = useHookstate(getState(MediaSettingsState))
  const mediaState = getMediaSceneMetadataState(Engine.instance.currentWorld)
  const rendered =
    mediaSettingState.immersiveMediaMode.value === 'off' ||
    (mediaSettingState.immersiveMediaMode.value === 'auto' && !mediaState.immersiveMedia.value)

  const setVideoStream = (value: Producer | null) => {
    videoStream.set(value)
    videoTrackId.set(value?.track?.id ?? '')
  }

  const setAudioStream = (value: Producer | null) => {
    audioStream.set(value)
    audioTrackId.set(value?.track?.id ?? '')
  }

  const pauseConsumerListener = (consumerId: string) => {
    if (consumerId === videoStream.value?.id) videoStreamPaused.set(true)
    else if (consumerId === audioStream.value?.id) audioStreamPaused.set(true)
  }

  const resumeConsumerListener = (consumerId: string) => {
    if (consumerId === videoStream.value?.id) videoStreamPaused.set(false)
    else if (consumerId === audioStream?.value?.id) audioStreamPaused.set(false)
  }

  const pauseProducerListener = ({ producerId, globalMute }: { producerId: string; globalMute: boolean }) => {
    if (producerId === videoStream.value?.id && globalMute) {
      videoProducerPaused.set(true)
      videoProducerGlobalMute.set(true)
    } else if (producerId === audioStream.value?.id && globalMute) {
      audioProducerPaused.set(true)
      audioProducerGlobalMute.set(true)
    } else {
      const network = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
      const videoConsumer = network.consumers?.find(
        (c) =>
          c.appData.peerID === peerID &&
          c.producerId === producerId &&
          c.appData.mediaTag === (isScreen ? 'screen-video' : 'cam-video')
      )
      const audioConsumer = network.consumers?.find(
        (c) =>
          c.appData.peerID === peerID &&
          c.producerId === producerId &&
          c.appData.mediaTag === (isScreen ? 'screen-audio' : 'cam-audio')
      )
      if (videoConsumer) {
        videoConsumer.producerPaused = true
        videoProducerPaused.set(true)
      }
      if (audioConsumer) {
        audioConsumer.producerPaused = true
        audioProducerPaused.set(true)
      }
    }
  }

  const resumeProducerListener = (producerId: string) => {
    if (producerId === videoStream.value?.id) {
      videoProducerPaused.set(false)
      videoProducerGlobalMute.set(false)
    } else if (producerId === audioStream.value?.id) {
      audioProducerPaused.set(false)
      audioProducerGlobalMute.set(false)
    } else {
      const network = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
      const videoConsumer = network.consumers?.find(
        (c) => c.appData.peerID === peerID && c.appData.mediaTag === (isScreen ? 'screen-video' : 'cam-video')
      )
      const audioConsumer = network.consumers?.find(
        (c) => c.appData.peerID === peerID && c.appData.mediaTag === (isScreen ? 'screen-audio' : 'cam-audio')
      )
      if (videoConsumer) {
        videoConsumer.producerPaused = false
        videoProducerPaused.set(false)
      }
      if (audioConsumer) {
        audioConsumer.producerPaused = false
        audioProducerPaused.set(false)
      }
    }
  }

  const closeProducerListener = (producerId: string) => {
    if (producerId === videoStream.value?.id) {
      ;(videoRef.current?.srcObject as MediaStream)?.getVideoTracks()[0].stop()
      if (!isScreen) MediaStreams.instance.videoStream?.getVideoTracks()[0].stop()
      else MediaStreams.instance.localScreen?.getVideoTracks()[0].stop()
    }

    if (producerId === audioStream.value?.id) {
      audioRef.current?.srcObject?.getAudioTracks()[0].stop()
      if (!isScreen) MediaStreams.instance.audioStream.getAudioTracks()[0].stop()
    }
  }

  useEffect(() => {
    if (isSelf && !isScreen) {
      setVideoStream(MediaStreams.instance.camVideoProducer)
      setVideoStreamPaused(MediaStreams.instance.videoPaused)
    } else if (isSelf && isScreen) setVideoStream(MediaStreams.instance.screenVideoProducer)
  }, [isCamVideoEnabled.value])

  useEffect(() => {
    if (isSelf && !isScreen) {
      setAudioStream(MediaStreams.instance.camAudioProducer)
      setAudioStreamPaused(MediaStreams.instance.audioPaused)
    } else if (isSelf && isScreen) setAudioStream(MediaStreams.instance.screenAudioProducer)
  }, [isCamAudioEnabled.value])

  useEffect(() => {
    if (!isSelf) {
      const network = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
      if (network) {
        const videoConsumer = network.consumers?.find(
          (c) => c.appData.peerID === peerID && c.appData.mediaTag === (isScreen ? 'screen-video' : 'cam-video')
        )
        const audioConsumer = network.consumers?.find(
          (c) => c.appData.peerID === peerID && c.appData.mediaTag === (isScreen ? 'screen-audio' : 'cam-audio')
        )
        if (videoConsumer) {
          setVideoProducerPaused((videoConsumer as any).producerPaused)
          setVideoStreamPaused(videoConsumer.paused)
        }
        if (audioConsumer) {
          setAudioProducerPaused((audioConsumer as any).producerPaused)
          setAudioStreamPaused(audioConsumer.paused)
        }
        setVideoStream(videoConsumer)
        setAudioStream(audioConsumer)
      }
    }
  }, [consumers.value])

  useEffect(() => {
    function onUserInteraction() {
      videoRef.current?.play()
      audioRef.current?.play()
      harkListener.value?.resume()
    }
    window.addEventListener('pointerdown', onUserInteraction)
    return () => {
      window.removeEventListener('pointerdown', onUserInteraction)
    }
  }, [videoRef, audioRef, harkListener])

  useEffect(() => {
    if (!currentChannelInstanceConnection?.value) return
    const mediaNetwork = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
    const primus = mediaNetwork.primus
    if (typeof primus?.on === 'function') {
      const responseFunction = (message) => {
        if (message) {
          const { type, data, id } = message
          switch (type) {
            case MessageTypes.WebRTCPauseConsumer.toString():
              pauseConsumerListener(data)
              break
            case MessageTypes.WebRTCResumeConsumer.toString():
              resumeConsumerListener(data)
              break
            case MessageTypes.WebRTCPauseProducer.toString():
              pauseProducerListener(data)
              break
            case MessageTypes.WebRTCResumeProducer.toString():
              resumeProducerListener(data)
              break
            case MessageTypes.WebRTCCloseProducer.toString():
              closeProducerListener(data)
              break
          }
        }
      }
      Object.defineProperty(responseFunction, 'name', { value: `responseFunction${peerID}`, writable: true })
      primus.on('data', responseFunction)
      primus.on('end', () => {
        primus.removeListener('data', responseFunction)
      })
    }
  }, [currentChannelInstanceConnection])

  useEffect(() => {
    if (audioRef.current != null) {
      audioRef.current.id = `${peerID}_audio`
      audioRef.current.autoplay = true
      audioRef.current.setAttribute('playsinline', 'true')
      if (isSelf) {
        audioRef.current.muted = true
      } else {
        audioRef.current.volume = volume
      }
      if (audioStream != null) {
        const newAudioTrack = audioStream.track.clone()
        const updateAudioTrackClones = audioTrackClones.concat(newAudioTrack)
        setAudioTrackClones(updateAudioTrackClones)
        audioRef.current.srcObject = new MediaStream([newAudioTrack])
        const newHark = hark(audioRef.current.srcObject, { play: false })
        newHark.on('speaking', () => {
          setSoundIndicatorOn(true)
        })
        newHark.on('stopped_speaking', () => {
          setSoundIndicatorOn(false)
        })
        setHarkListener(newHark)
        setAudioProducerPaused(audioStream.paused)
      }
    }

    return () => {
      audioTrackClones.forEach((track) => track.stop())
      if (harkListener) (harkListener as any).stop()
    }
  }, [audioTrackId, harkListener])

  useEffect(() => {
    if (videoRef.current != null) {
      videoRef.current.id = `${peerID}_video`
      videoRef.current.autoplay = true
      videoRef.current.muted = true
      videoRef.current.setAttribute('playsinline', 'true')
      if (videoStream != null) {
        setVideoDisplayReady(false)
        if (isSelf) setVideoProducerPaused(false)
        const originalTrackEnabledInterval = setInterval(() => {
          if (videoStream.track.enabled) {
            clearInterval(originalTrackEnabledInterval)

            // if (!videoRef.current?.srcObject?.active || !videoRef.current?.srcObject?.getVideoTracks()[0].enabled) {
            const newVideoTrack = videoStream.track.clone()
            videoTrackClones.forEach((track) => track.stop())
            setVideoTrackClones([newVideoTrack])
            videoRef.current.srcObject = new MediaStream([newVideoTrack])
            if (isScreen) {
              applyScreenshareToTexture(videoRef.current)
            }
            setVideoDisplayReady(true)
            // }
          }
        }, 100)
      }
    }

    return () => {
      videoTrackClones.forEach((track) => track.stop())
    }
  }, [videoTrackId])

  useEffect(() => {
    if (isSelf) {
      setAudioStreamPaused(MediaStreams.instance.audioPaused)
    }
  }, [MediaStreams.instance.audioPaused])

  useEffect(() => {
    if (isSelf) {
      setVideoStreamPaused(MediaStreams.instance.videoPaused)
      if (videoRef.current != null) {
        if (MediaStreams.instance.videoPaused) {
          videoRef.current?.srcObject?.getVideoTracks()[0].stop()
          MediaStreams.instance.videoStream.getVideoTracks()[0].stop()
        }
      }
    }
  }, [MediaStreams.instance.videoPaused])

  useEffect(() => {
    if (!isSelf && !videoProducerPaused && videoStream != null && videoRef.current != null) {
      const originalTrackEnabledInterval = setInterval(() => {
        if (videoStream.track.enabled) {
          clearInterval(originalTrackEnabledInterval)

          if (!videoRef.current?.srcObject?.getVideoTracks()[0].enabled) {
            const newVideoTrack = videoStream.track.clone()
            videoTrackClones.forEach((track) => track.stop())
            setVideoTrackClones([newVideoTrack])
            videoRef.current.srcObject = new MediaStream([newVideoTrack])
          }
        }
      }, 100)
    }
  }, [videoProducerPaused])

  useEffect(() => {
    if (!isSelf && !audioProducerPaused && audioStream != null && audioRef.current != null) {
      const originalTrackEnabledInterval = setInterval(() => {
        if (audioStream.track.enabled) {
          clearInterval(originalTrackEnabledInterval)

          if (!audioRef.current?.srcObject?.getAudioTracks()[0].enabled) {
            const newAudioTrack = audioStream.track.clone()
            const updateAudioTrackClones = audioTrackClones.concat(newAudioTrack)
            setAudioTrackClones(updateAudioTrackClones)
            audioRef.current.srcObject = new MediaStream([newAudioTrack])
          }
        }
      })
    }
  }, [audioProducerPaused])

  useEffect(() => {
    MediaStreams.instance.microphoneGainNode?.gain.setTargetAtTime(
      audioState.microphoneGain.value,
      Engine.instance.audioContext.currentTime,
      0.01
    )
  }, [audioState.microphoneGain])

  const toggleVideo = async (e) => {
    e.stopPropagation()
    const mediaNetwork = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
    if (isSelf && !isScreen) {
      if (await configureMediaTransports(mediaNetwork, ['video'])) {
        if (MediaStreams.instance.camVideoProducer == null) await createCamVideoProducer(mediaNetwork)
        else {
          const videoPaused = MediaStreams.instance.toggleVideoPaused()
          if (videoPaused) await pauseProducer(mediaNetwork, MediaStreams.instance.camVideoProducer)
          else await resumeProducer(mediaNetwork, MediaStreams.instance.camVideoProducer)
        }
        MediaStreamService.updateCamVideoState()
      }
    } else if (isSelf && isScreen) {
      const videoPaused = MediaStreams.instance.toggleScreenShareVideoPaused()
      if (videoPaused) await stopScreenshare(mediaNetwork)
      // else await resumeProducer(mediaNetwork, MediaStreams.instance.screenVideoProducer)
      setVideoStreamPaused(videoPaused)
      MediaStreamService.updateScreenAudioState()
      MediaStreamService.updateScreenVideoState()
    } else {
      if (!videoStreamPausedRef.current) {
        selfVideoPausedRef.current = true
        await pauseConsumer(mediaNetwork, videoStream)
        setVideoStreamPaused(true)
      } else {
        selfVideoPausedRef.current = false
        await resumeConsumer(mediaNetwork, videoStream)
        setVideoStreamPaused(false)
      }
    }
  }

  const toggleAudio = async (e) => {
    e.stopPropagation()
    const mediaNetwork = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
    if (isSelf && !isScreen) {
      if (await configureMediaTransports(mediaNetwork, ['audio'])) {
        if (MediaStreams.instance.camAudioProducer == null) await createCamAudioProducer(mediaNetwork)
        else {
          const audioPaused = MediaStreams.instance.toggleAudioPaused()
          if (audioPaused) await pauseProducer(mediaNetwork, MediaStreams.instance.camAudioProducer)
          else await resumeProducer(mediaNetwork, MediaStreams.instance.camAudioProducer)
        }
        MediaStreamService.updateCamAudioState()
      }
    } else if (isSelf && isScreen) {
      const audioPaused = MediaStreams.instance.toggleScreenShareAudioPaused()
      if (audioPaused) await pauseProducer(mediaNetwork, MediaStreams.instance.screenAudioProducer)
      else await resumeProducer(mediaNetwork, MediaStreams.instance.screenAudioProducer)
      setAudioStreamPaused(audioPaused)
    } else {
      if (!audioStreamPausedRef.current) {
        selfAudioPausedRef.current = true
        await pauseConsumer(mediaNetwork, audioStream)
        setAudioStreamPaused(true)
      } else {
        selfAudioPausedRef.current = false
        await resumeConsumer(mediaNetwork, audioStream)
        setAudioStreamPaused(false)
      }
    }
  }

  const toggleGlobalMute = async (e) => {
    e.stopPropagation()
    const mediaNetwork = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
    if (!audioProducerGlobalMute) {
      await globalMuteProducer(mediaNetwork, { id: audioStream.producerId })
      setAudioProducerGlobalMute(true)
    } else if (audioProducerGlobalMute) {
      await globalUnmuteProducer(mediaNetwork, { id: audioStream.producerId })
      setAudioProducerGlobalMute(false)
    }
  }

  const adjustVolume = (e, value) => {
    if (isSelf) {
      dispatchAction(AudioSettingAction.setMicrophoneVolume({ value }))
    } else {
      audioRef.current.volume = value
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

  const userAvatarDetails = useHookstate(getState(WorldState).userAvatarDetails)

  const handleVisibilityChange = () => {
    if (document.hidden) {
      if (videoStreamRef.current != null && !videoStreamRef.current.paused && !videoStreamPausedRef.current) {
        resumeVideoOnUnhide.current = true
        toggleVideo({
          stopPropagation: () => {}
        })
      }
      if (audioStreamRef.current != null && !audioStreamRef.current.paused && !audioStreamPausedRef.current) {
        resumeAudioOnUnhide.current = true
        toggleAudio({
          stopPropagation: () => {}
        })
      }
    }
    if (!document.hidden) {
      if (videoStreamRef.current != null && resumeVideoOnUnhide.current)
        toggleVideo({
          stopPropagation: () => {}
        })
      if (audioStreamRef.current != null && resumeAudioOnUnhide.current)
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
    audioRef,
    videoRef,
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
    audioRef,
    videoRef,
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
    <Draggable isPiP={isPiP.value}>
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
          <video key={peerID + '_cam'} ref={videoRef} draggable={false} />
        </div>
        <audio key={peerID + '_audio'} ref={audioRef} />
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
                  >
                    {videoStreamPaused ? <VideocamOff /> : <Videocam />}
                  </IconButton>
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
                  >
                    {audioProducerGlobalMute ? <VoiceOverOff /> : <RecordVoiceOver />}
                  </IconButton>
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
                  >
                    {isSelf ? (
                      audioStreamPaused ? (
                        <MicOff />
                      ) : (
                        <Mic />
                      )
                    ) : audioStreamPaused ? (
                      <VolumeOff />
                    ) : (
                      <VolumeUp />
                    )}
                  </IconButton>
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
                >
                  <Launch className={styles.pipBtn} />
                </IconButton>
              </Tooltip>
            </div>
            {audioProducerGlobalMute && <div className={styles['global-mute']}>Muted by Admin</div>}
            {audioStream && !audioProducerPaused && !audioProducerGlobalMute && (
              <div className={styles['audio-slider']}>
                {volume === 0 && <VolumeMute />}
                {volume > 0 && volume < 0.7 && <VolumeDown />}
                {volume >= 0.7 && <VolumeUp />}
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
