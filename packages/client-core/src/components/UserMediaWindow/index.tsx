import { Downgraded, State, useHookstate } from '@hookstate/core'
import classNames from 'classnames'
import hark from 'hark'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useMediaStreamState } from '@xrengine/client-core/src/media/services/MediaStreamService'
import { useLocationState } from '@xrengine/client-core/src/social/services/LocationService'
import {
  globalMuteProducer,
  globalUnmuteProducer,
  pauseConsumer,
  resumeConsumer,
  toggleMicrophonePaused,
  toggleScreenshareAudioPaused,
  toggleScreenshareVideoPaused,
  toggleWebcamPaused
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
import Icon from '@xrengine/ui/src/Icon'
import IconButton from '@xrengine/ui/src/IconButton'
import Slider from '@xrengine/ui/src/Slider'
import Tooltip from '@xrengine/ui/src/Tooltip'

import { useMediaInstance } from '../../common/services/MediaInstanceConnectionService'
import { MediaStreamState } from '../../transports/MediaStreams'
import { PeerMediaStreamInterface, PeerMediaStreamState } from '../../transports/PeerMediaStreamState'
import { ConsumerExtension, SocketWebRTCClientNetwork } from '../../transports/SocketWebRTCClientNetwork'
import Draggable from './Draggable'
import styles from './index.module.scss'

interface Props {
  peerID: PeerID
  type: 'screen' | 'cam'
}

/** @todo separate all media state from UI state and move it to hookstate record keyed to peerID */
export const useUserMediaWindowHook = ({ peerID, type }: Props) => {
  const peerMediaStreamState = useHookstate(
    getState(PeerMediaStreamState)[peerID][type] as State<PeerMediaStreamInterface>
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
  } = peerMediaStreamState.value

  useEffect(() => {
    videoElement.draggable = false
    document.getElementById(peerID + '-video-container')!.append(videoElement)
    document.getElementById(peerID + '-audio-container')!.append(audioElement)
  }, [])

  /** Logic */
  const [audioTrackClones, setAudioTrackClones] = useState<any[]>([])
  const [videoTrackClones, setVideoTrackClones] = useState<any[]>([])
  const [videoTrackId, setVideoTrackId] = useState('')
  const [audioTrackId, setAudioTrackId] = useState('')

  /** UI */
  const [harkListener, setHarkListener] = useState(null)
  const [soundIndicatorOn, setSoundIndicatorOn] = useState(false)
  const [isPiP, setPiP] = useState(false)
  const [videoDisplayReady, setVideoDisplayReady] = useState<boolean>(false)

  const userState = useNetworkUserState()
  const resumeVideoOnUnhide = useRef<boolean>(false)
  const resumeAudioOnUnhide = useRef<boolean>(false)
  const selfVideoPausedRef = useRef<boolean>(false)
  const selfAudioPausedRef = useRef<boolean>(false)

  const mediastream = useMediaStreamState()
  const { t } = useTranslation()
  const audioState = useAudioState()

  const [_volume, _setVolume] = useState(1)

  const userHasInteracted = useEngineState().userHasInteracted
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

  const mediaStreamState = useHookstate(getState(MediaStreamState))
  const mediaSettingState = useHookstate(getState(MediaSettingsState))
  const mediaState = getMediaSceneMetadataState(Engine.instance.currentWorld)
  const rendered =
    mediaSettingState.immersiveMediaMode.value === 'off' ||
    (mediaSettingState.immersiveMediaMode.value === 'auto' && !mediaState.immersiveMedia.value)

  const setVideoStream = (value) => {
    if (value?.track) setVideoTrackId(value.track.id)
    peerMediaStreamState.videoStream.set(value)
  }

  const setAudioStream = (value) => {
    if (value?.track) setAudioTrackId(value.track.id)
    peerMediaStreamState.audioStream.set(value)
  }

  const pauseConsumerListener = (consumerId: string) => {
    if (consumerId === videoStream?.id) peerMediaStreamState.videoStreamPaused.set(true)
    else if (consumerId === audioStream?.id) peerMediaStreamState.audioStreamPaused.set(true)
  }

  const resumeConsumerListener = (consumerId: string) => {
    if (consumerId === videoStream?.id && !selfVideoPausedRef.current) peerMediaStreamState.videoStreamPaused.set(false)
    else if (consumerId === audioStream?.id && !selfAudioPausedRef.current)
      peerMediaStreamState.audioStreamPaused.set(false)
  }

  const pauseProducerListener = ({ producerId, globalMute }: { producerId: string; globalMute: boolean }) => {
    if (producerId === videoStream?.id && globalMute) {
      peerMediaStreamState.videoProducerPaused.set(true)
      peerMediaStreamState.videoProducerGlobalMute.set(true)
    } else if (producerId === audioStream?.id && globalMute) {
      peerMediaStreamState.audioProducerPaused.set(true)
      peerMediaStreamState.audioProducerGlobalMute.set(true)
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
        ;(videoConsumer as any).producerPaused = true
        peerMediaStreamState.videoProducerPaused.set(true)
      }
      if (audioConsumer) {
        ;(audioConsumer as any).producerPaused = true
        peerMediaStreamState.audioProducerPaused.set(true)
      }
    }
  }

  const resumeProducerListener = (producerId: string) => {
    console.log('resumeProducerListener', producerId, videoStream?.id)
    if (producerId === videoStream?.id) {
      peerMediaStreamState.videoProducerPaused.set(false)
      peerMediaStreamState.videoProducerGlobalMute.set(false)
    } else if (producerId === audioStream?.id) {
      peerMediaStreamState.audioProducerPaused.set(false)
      peerMediaStreamState.audioProducerGlobalMute.set(false)
    } else {
      const network = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
      const videoConsumer = network.consumers?.find(
        (c) => c.appData.peerID === peerID && c.appData.mediaTag === (isScreen ? 'screen-video' : 'cam-video')
      )
      const audioConsumer = network.consumers?.find(
        (c) => c.appData.peerID === peerID && c.appData.mediaTag === (isScreen ? 'screen-audio' : 'cam-audio')
      )
      if (videoConsumer) {
        ;(videoConsumer as any).producerPaused = false
        peerMediaStreamState.videoProducerPaused.set(false)
      }
      if (audioConsumer) {
        ;(audioConsumer as any).producerPaused = false
        peerMediaStreamState.audioProducerPaused.set(false)
      }
    }
  }

  const closeProducerListener = (producerId: string) => {
    if (producerId === videoStream?.id) {
      ;(videoElement?.srcObject as MediaStream)?.getVideoTracks()[0].stop()
      if (!isScreen) mediaStreamState.videoStream.value!.getVideoTracks()[0].stop()
      else mediaStreamState.localScreen.value!.getVideoTracks()[0].stop
    }

    if (producerId === audioStream?.id) {
      ;(audioElement?.srcObject as MediaStream)?.getAudioTracks()[0].stop()
      if (!isScreen) mediaStreamState.audioStream.value!.getAudioTracks()[0].stop()
    }
  }

  useEffect(() => {
    if (isSelf && !isScreen) {
      setVideoStream(mediaStreamState.camVideoProducer.value)
      peerMediaStreamState.videoStreamPaused.set(mediaStreamState.videoPaused.value)
    } else if (isSelf && isScreen) setVideoStream(mediaStreamState.screenVideoProducer.value)
  }, [isCamVideoEnabled])

  useEffect(() => {
    if (isSelf && !isScreen) {
      setAudioStream(mediaStreamState.camAudioProducer.value)
      peerMediaStreamState.audioStreamPaused.set(mediaStreamState.audioPaused.value)
    } else if (isSelf && isScreen) setAudioStream(mediaStreamState.screenAudioProducer.value)
  }, [isCamAudioEnabled])

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
          peerMediaStreamState.videoProducerPaused.set((videoConsumer as any).producerPaused)
          peerMediaStreamState.videoStreamPaused.set(videoConsumer.paused)
        }
        if (audioConsumer) {
          peerMediaStreamState.audioProducerPaused.set((audioConsumer as any).producerPaused)
          peerMediaStreamState.audioStreamPaused.set(audioConsumer.paused)
        }
        setVideoStream(videoConsumer)
        setAudioStream(audioConsumer)
      }
    }
  }, [consumers])

  useEffect(() => {
    if (userHasInteracted.value && !isSelf) {
      videoElement?.play()
      audioElement?.play()
      if (harkListener) (harkListener as any).resume()
    }
  }, [userHasInteracted])

  useEffect(() => {
    if (!currentChannelInstanceConnection?.value) return
    const mediaNetwork = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
    const primus = mediaNetwork.primus
    if (typeof primus?.on === 'function') {
      console.log('responseFunction')
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
              console.log(type, data, id)
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
        peerMediaStreamState.audioProducerPaused.set(audioStream.paused)
      }
    }

    return () => {
      audioTrackClones.forEach((track) => track.stop())
      if (harkListener) (harkListener as any).stop()
    }
  }, [audioTrackId])

  useEffect(() => {
    console.log('useEffect videoTrackId', videoTrackId, videoElement)
    videoElement.id = `${peerID}_video`
    videoElement.autoplay = true
    videoElement.muted = true
    videoElement.setAttribute('playsinline', 'true')
    if (videoStream != null) {
      console.log('setVideoDisplayReady', false)
      setVideoDisplayReady(false)
      if (isSelf) peerMediaStreamState.videoProducerPaused.set(false)
      const originalTrackEnabledInterval = setInterval(() => {
        console.log('videoStream.track!.enabled', videoStream.track?.enabled)
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
          console.log('setVideoDisplayReady', true)
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
    if (isSelf) {
      peerMediaStreamState.audioStreamPaused.set(mediaStreamState.audioPaused.value)
    }
  }, [mediaStreamState.audioPaused])

  useEffect(() => {
    if (isSelf) {
      peerMediaStreamState.videoStreamPaused.set(mediaStreamState.videoPaused.value)
      if (videoElement != null) {
        if (mediaStreamState.videoPaused.value) {
          ;(videoElement?.srcObject as MediaStream)?.getVideoTracks()[0].stop()
          mediaStreamState.videoStream.value!.getVideoTracks()[0].stop()
        }
      }
    }
  }, [mediaStreamState.videoPaused])

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
      Engine.instance.audioContext.currentTime,
      0.01
    )
  }, [audioState.microphoneGain])

  const toggleVideo = async (e) => {
    e.stopPropagation()
    const mediaNetwork = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
    if (isSelf && !isScreen) {
      toggleWebcamPaused()
    } else if (isSelf && isScreen) {
      toggleScreenshareVideoPaused()
    } else {
      if (!videoStreamPaused) {
        selfVideoPausedRef.current = true
        await pauseConsumer(mediaNetwork, videoStream as ConsumerExtension)
        peerMediaStreamState.videoStreamPaused.set(true)
      } else {
        selfVideoPausedRef.current = false
        await resumeConsumer(mediaNetwork, videoStream as ConsumerExtension)
        peerMediaStreamState.videoStreamPaused.set(false)
      }
    }
  }

  const toggleAudio = async (e) => {
    e.stopPropagation()
    const mediaNetwork = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
    if (isSelf && !isScreen) {
      toggleMicrophonePaused()
    } else if (isSelf && isScreen) {
      toggleScreenshareAudioPaused()
    } else {
      if (!audioStreamPaused) {
        selfAudioPausedRef.current = true
        await pauseConsumer(mediaNetwork, audioStream as ConsumerExtension)
        peerMediaStreamState.audioStreamPaused.set(true)
      } else {
        selfAudioPausedRef.current = false
        await resumeConsumer(mediaNetwork, audioStream as ConsumerExtension)
        peerMediaStreamState.audioStreamPaused.set(false)
      }
    }
  }

  const toggleGlobalMute = async (e) => {
    e.stopPropagation()
    const mediaNetwork = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
    const audioStreamProducer = audioStream as ConsumerExtension
    if (!audioProducerGlobalMute) {
      await globalMuteProducer(mediaNetwork, { id: audioStreamProducer.producerId })
      peerMediaStreamState.audioProducerGlobalMute.set(true)
    } else if (audioProducerGlobalMute) {
      await globalUnmuteProducer(mediaNetwork, { id: audioStreamProducer.producerId })
      peerMediaStreamState.audioProducerGlobalMute.set(false)
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

  const userAvatarDetails = useHookstate(getState(WorldState).userAvatarDetails)

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
            [styles['border-lit']]: soundIndicatorOn
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
