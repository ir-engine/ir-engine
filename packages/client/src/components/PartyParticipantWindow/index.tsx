import IconButton from '@material-ui/core/IconButton'
import Slider from '@material-ui/core/Slider'
import Tooltip from '@material-ui/core/Tooltip'
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
} from '@material-ui/icons'
import { selectAppState } from '@xrengine/client-core/src/common/reducers/app/selector'
import { selectLocationState } from '@xrengine/client-core/src/social/reducers/location/selector'
import { getAvatarURLFromNetwork } from '@xrengine/client-core/src/user/components/UserMenu/util'
import { selectAuthState } from '@xrengine/client-core/src/user/reducers/auth/selector'
import { useUserState } from '@xrengine/client-core/src/user/store/UserState'
import { updateCamAudioState, updateCamVideoState } from '../../reducers/mediastream/service'
import { PositionalAudioSystem } from '@xrengine/engine/src/audio/systems/PositionalAudioSystem'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import classNames from 'classnames'
import React, { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { selectMediastreamState } from '../../reducers/mediastream/selector'
import {
  globalMuteProducer,
  globalUnmuteProducer,
  pauseConsumer,
  pauseProducer,
  resumeConsumer,
  resumeProducer
} from '../../transports/SocketWebRTCClientFunctions'
import Draggable from './Draggable'
import styles from './PartyParticipantWindow.module.scss'
import { Downgraded } from '@hookstate/core'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

interface ContainerProportions {
  width: number | string
  height: number | string
}

interface Props {
  harmony?: boolean
  containerProportions?: ContainerProportions
  peerId?: string
  appState?: any
  authState?: any
  locationState?: any
  mediastream?: any
}

const mapStateToProps = (state: any): any => {
  return {
    appState: selectAppState(state),
    authState: selectAuthState(state),
    locationState: selectLocationState(state),
    mediastream: selectMediastreamState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({})

const PartyParticipantWindow = (props: Props): JSX.Element => {
  const [videoStream, _setVideoStream] = useState(null)
  const [audioStream, _setAudioStream] = useState(null)
  const [videoStreamPaused, setVideoStreamPaused] = useState(false)
  const [audioStreamPaused, setAudioStreamPaused] = useState(false)
  const [videoProducerPaused, setVideoProducerPaused] = useState(false)
  const [audioProducerPaused, setAudioProducerPaused] = useState(false)
  const [videoProducerGlobalMute, setVideoProducerGlobalMute] = useState(false)
  const [audioProducerGlobalMute, setAudioProducerGlobalMute] = useState(false)
  const [audioTrackClones, setAudioTrackClones] = useState([])
  const [videoTrackClones, setVideoTrackClones] = useState([])
  const [toggle, setToggle] = useState(0)
  const [volume, setVolume] = useState(100)
  const { harmony, peerId, appState, authState, locationState, mediastream } = props
  const userState = useUserState()
  const videoRef = React.createRef<HTMLVideoElement>()
  const audioRef = React.createRef<HTMLAudioElement>()
  const videoStreamRef = useRef(videoStream)
  const audioStreamRef = useRef(audioStream)

  const userHasInteracted = appState.get('userHasInteracted')
  const selfUser = authState.get('user')
  const currentLocation = locationState.get('currentLocation').get('location')
  const enableGlobalMute =
    currentLocation?.locationSettings?.locationType === 'showroom' &&
    selfUser?.locationAdmins?.find((locationAdmin) => currentLocation.id === locationAdmin.locationId) != null
  const user = userState.layerUsers.find((user) => user.id.value === peerId)?.attach(Downgraded).value

  const isCamVideoEnabled = mediastream.get('isCamVideoEnabled')
  const isCamAudioEnabled = mediastream.get('isCamAudioEnabled')
  const consumers = mediastream.get('consumers')

  const setVideoStream = (value) => {
    videoStreamRef.current = value
    _setVideoStream(value)
  }

  const setAudioStream = (value) => {
    audioStreamRef.current = value
    _setAudioStream(value)
  }

  const pauseConsumerListener = (consumerId: string) => {
    if (consumerId === videoStreamRef?.current?.id) {
      setVideoProducerPaused(true)
    } else if (consumerId === audioStreamRef?.current?.id) {
      setAudioProducerPaused(true)
    }
  }

  const resumeConsumerListener = (consumerId: string) => {
    if (consumerId === videoStreamRef?.current?.id) {
      setVideoProducerPaused(false)
    } else if (consumerId === audioStreamRef?.current?.id) {
      setAudioProducerPaused(false)
    }
  }

  const pauseProducerListener = (producerId: string, globalMute: boolean) => {
    if (producerId === videoStreamRef?.current?.id && globalMute === true) {
      setVideoProducerPaused(true)
      setVideoProducerGlobalMute(true)
    } else if (producerId === audioStreamRef?.current?.id && globalMute === true) {
      setAudioProducerPaused(true)
      setAudioProducerGlobalMute(true)
    }
  }

  const resumeProducerListener = (producerId: string) => {
    if (producerId === videoStreamRef?.current?.id) {
      setVideoProducerPaused(false)
      setVideoProducerGlobalMute(false)
    } else if (producerId === audioStreamRef?.current?.id) {
      setAudioProducerPaused(false)
      setAudioProducerGlobalMute(false)
    }
  }

  useEffect(() => {
    if (peerId === 'me_cam') {
      setVideoStream(MediaStreams.instance?.camVideoProducer)
      setVideoStreamPaused(MediaStreams.instance?.videoPaused)
    } else if (peerId === 'me_screen') setVideoStream(MediaStreams.instance?.screenVideoProducer)
  }, [isCamVideoEnabled])

  useEffect(() => {
    if (peerId === 'me_cam') {
      setAudioStream(MediaStreams.instance?.camAudioProducer)
      setAudioStreamPaused(MediaStreams.instance?.audioPaused)
    } else if (peerId === 'me_screen') setAudioStream(MediaStreams.instance?.screenAudioProducer)
  }, [isCamAudioEnabled])

  useEffect(() => {
    if (peerId !== 'me_cam' && peerId !== 'me_screen') {
      setVideoStream(
        MediaStreams.instance?.consumers?.find(
          (c: any) => c.appData.peerId === peerId && c.appData.mediaTag === 'cam-video'
        )
      )
      setAudioStream(
        MediaStreams.instance?.consumers?.find(
          (c: any) => c.appData.peerId === peerId && c.appData.mediaTag === 'cam-audio'
        )
      )
    }
  }, [consumers])

  useEffect(() => {
    if (userHasInteracted === true && peerId !== 'me_cam' && peerId !== 'me_screen') {
      videoRef.current?.play()
      audioRef.current?.play()
    }
  }, [userHasInteracted])

  useEffect(() => {
    if (
      harmony !== true &&
      (selfUser?.user_setting?.spatialAudioEnabled === true || selfUser?.user_setting?.spatialAudioEnabled === 1) &&
      audioRef.current != null
    )
      audioRef.current.volume = 0
    else if (
      harmony === true
      // (selfUser?.user_setting?.spatialAudioEnabled === false || selfUser?.user_setting?.spatialAudioEnabled === 0) &&
      // Engine.spatialAudio
    )
      audioRef.current.volume = volume / 100
  }, [selfUser])

  useEffect(() => {
    const socket =
      (Network.instance?.transport as any)?.channelType === 'instance'
        ? (Network.instance?.transport as any)?.instanceSocket
        : (Network.instance?.transport as any)?.channelSocket
    if (typeof socket?.on === 'function') socket?.on(MessageTypes.WebRTCPauseConsumer.toString(), pauseConsumerListener)
    if (typeof socket?.on === 'function')
      socket?.on(MessageTypes.WebRTCResumeConsumer.toString(), resumeConsumerListener)
    if (typeof socket?.on === 'function') socket?.on(MessageTypes.WebRTCPauseProducer.toString(), pauseProducerListener)
    if (typeof socket?.on === 'function')
      socket?.on(MessageTypes.WebRTCResumeProducer.toString(), resumeProducerListener)
  }, [])

  useEffect(() => {
    if (audioRef.current != null) {
      audioRef.current.id = `${peerId}_audio`
      audioRef.current.autoplay = true
      audioRef.current.setAttribute('playsinline', 'true')
      if (peerId === 'me_cam' || peerId === 'me_screen') {
        audioRef.current.muted = true
      }
      if (audioStream != null) {
        const newAudioTrack = audioStream.track.clone()
        const updateAudioTrackClones = audioTrackClones.concat(newAudioTrack)
        setAudioTrackClones(updateAudioTrackClones)
        audioRef.current.srcObject = new MediaStream([newAudioTrack])
      }
      // TODO: handle 3d audio switch on/off
      if (
        harmony !== true &&
        (selfUser?.user_setting?.spatialAudioEnabled === true || selfUser?.user_setting?.spatialAudioEnabled === 1)
      )
        audioRef.current.volume = 0
      if (
        harmony === true
        // selfUser?.user_setting?.spatialAudioEnabled === false ||
        // (selfUser?.user_setting?.spatialAudioEnabled === 0 && Engine.spatialAudio)
      ) {
        audioRef.current.volume = volume / 100
        // PositionalAudioSystem.instance?.suspend()
      }
      setVolume(volume)
    }

    return () => {
      audioTrackClones.forEach((track) => track.stop())
    }
  }, [audioStream])

  useEffect(() => {
    if (videoRef.current != null) {
      videoRef.current.id = `${peerId}_video`
      videoRef.current.autoplay = true
      videoRef.current.muted = true
      videoRef.current.setAttribute('playsinline', 'true')
      if (videoStream != null) {
        const newVideoTrack = videoStream.track.clone()
        const updateVideoTrackClones = videoTrackClones.concat(newVideoTrack)
        setVideoTrackClones(updateVideoTrackClones)
        videoRef.current.srcObject = new MediaStream([newVideoTrack])
        setVideoProducerPaused(false)
      }
    }

    return () => {
      videoTrackClones.forEach((track) => track.stop())
    }
  }, [videoStream])

  useEffect(() => {
    if (peerId === 'me_cam' || peerId === 'me_screen') setAudioStreamPaused(MediaStreams.instance?.audioPaused)
    if (harmony === true && audioStream != null && audioRef.current != null) {
      const newAudioTrack = audioStream.track.clone()
      const updateAudioTrackClones = audioTrackClones.concat(newAudioTrack)
      setAudioTrackClones(updateAudioTrackClones)
      audioRef.current.srcObject = new MediaStream([newAudioTrack])
    }
  }, [MediaStreams.instance?.audioPaused])

  useEffect(() => {
    if (peerId === 'me_cam' || peerId === 'me_screen') setVideoStreamPaused(MediaStreams.instance?.videoPaused)
    if (harmony === true && videoStream != null && videoRef.current != null) {
      const newVideoTrack = videoStream.track.clone()
      const updateVideoTrackClones = videoTrackClones.concat(newVideoTrack)
      setVideoTrackClones(updateVideoTrackClones)
      videoRef.current.srcObject = new MediaStream([newVideoTrack])
    }
  }, [MediaStreams.instance?.videoPaused])

  const toggleVideo = async (e) => {
    e.stopPropagation()
    if (peerId === 'me_cam') {
      const videoPaused = MediaStreams.instance.toggleVideoPaused()
      if (videoPaused === true) await pauseProducer(MediaStreams.instance?.camVideoProducer)
      else await resumeProducer(MediaStreams.instance?.camVideoProducer)
      updateCamVideoState()
    } else if (peerId === 'me_screen') {
      const videoPaused = MediaStreams.instance.toggleScreenShareVideoPaused()
      if (videoPaused === true) await pauseProducer(MediaStreams.instance.screenVideoProducer)
      else await resumeProducer(MediaStreams.instance.screenVideoProducer)
      setVideoStreamPaused(videoPaused)
    } else {
      if (videoStream.paused === false) await pauseConsumer(videoStream)
      else await resumeConsumer(videoStream)
      setVideoStreamPaused(videoStream.paused)
    }
  }

  const toggleAudio = async (e) => {
    e.stopPropagation()
    if (peerId === 'me_cam') {
      const audioPaused = MediaStreams.instance.toggleAudioPaused()
      if (audioPaused === true) await pauseProducer(MediaStreams.instance?.camAudioProducer)
      else await resumeProducer(MediaStreams.instance?.camAudioProducer)
      updateCamAudioState()
    } else if (peerId === 'me_screen') {
      const audioPaused = MediaStreams.instance.toggleScreenShareAudioPaused()
      if (audioPaused === true) await pauseProducer(MediaStreams.instance.screenAudioProducer)
      else await resumeProducer(MediaStreams.instance.screenAudioProducer)
      setAudioStreamPaused(audioPaused)
    } else {
      if (audioStream.paused === false) await pauseConsumer(audioStream)
      else await resumeConsumer(audioStream)
      setAudioStreamPaused(audioStream.paused)
    }
  }

  const toggleGlobalMute = async (e) => {
    e.stopPropagation()
    if (audioProducerGlobalMute === false) {
      await globalMuteProducer({ id: audioStream.producerId })
      setAudioProducerGlobalMute(true)
    } else if (audioProducerGlobalMute === true) {
      await globalUnmuteProducer({ id: audioStream.producerId })
      setAudioProducerGlobalMute(false)
    }
  }

  const adjustVolume = (e, newValue) => {
    if (peerId === 'me_cam' || peerId === 'me_screen') {
      MediaStreams.instance.audioGainNode.gain.setValueAtTime(
        newValue / 100,
        MediaStreams.instance.audioGainNode.context.currentTime + 1
      )
    } else {
      audioRef.current.volume = newValue / 100
    }
    setVolume(newValue)
  }

  const [isPiP, setPiP] = useState(false)

  const togglePiP = () => setPiP(!isPiP)

  const isSelfUser = peerId === 'me_cam' || peerId === 'me_screen'

  return (
    <Draggable isPiP={isPiP}>
      <div
        tabIndex={0}
        id={peerId + '_container'}
        className={classNames({
          [styles['party-chat-user']]: true,
          [styles['harmony']]: harmony === true,
          [styles['self-user']]: isSelfUser,
          [styles['no-video']]: videoStream == null,
          [styles['video-paused']]: videoStream && (videoProducerPaused === true || videoStreamPaused === true),
          [styles.pip]: isPiP
        })}
      >
        <div className={styles['video-wrapper']}>
          {(videoStream == null ||
            videoStreamPaused == true ||
            videoProducerPaused == true ||
            videoProducerGlobalMute == true) && (
            <img
              src={getAvatarURLFromNetwork(Network.instance, isSelfUser ? selfUser?.id : user?.id)}
              draggable={false}
            />
          )}
          <video key={peerId + '_cam'} ref={videoRef} draggable={false} />
        </div>
        <audio key={peerId + '_audio'} ref={audioRef} />
        <div className={styles['user-controls']}>
          <div className={styles['username']}>{peerId === 'me_cam' ? 'You' : user?.name}</div>
          <div className={styles['controls']}>
            <div className={styles['mute-controls']}>
              {videoStream && videoProducerPaused === false ? (
                <Tooltip
                  title={videoProducerPaused === false && videoStreamPaused === false ? 'Pause Video' : 'Resume Video'}
                >
                  <IconButton color="secondary" size="small" className={styles['video-control']} onClick={toggleVideo}>
                    {videoStreamPaused ? <VideocamOff /> : <Videocam />}
                  </IconButton>
                </Tooltip>
              ) : null}
              {enableGlobalMute && peerId !== 'me_cam' && peerId !== 'me_screen' && audioStream && (
                <Tooltip title={audioProducerGlobalMute === false ? 'Mute for everyone' : 'Unmute for everyone'}>
                  <IconButton
                    color="secondary"
                    size="small"
                    className={styles['audio-control']}
                    onClick={toggleGlobalMute}
                  >
                    {audioProducerGlobalMute ? <VoiceOverOff /> : <RecordVoiceOver />}
                  </IconButton>
                </Tooltip>
              )}
              {audioStream && audioProducerPaused === false ? (
                <Tooltip
                  title={
                    isSelfUser && audioStream?.paused === false
                      ? 'Mute me'
                      : isSelfUser && audioStream?.paused === true
                      ? 'Unmute me'
                      : peerId !== 'me_cam' && peerId !== 'me_screen' && audioStream?.paused === false
                      ? 'Mute this person'
                      : 'Unmute this person'
                  }
                >
                  <IconButton color="secondary" size="small" className={styles['audio-control']} onClick={toggleAudio}>
                    {isSelfUser ? (
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
              {harmony !== true && (
                <Tooltip title="Open Picture in Picture">
                  <IconButton color="secondary" size="small" className={styles['audio-control']} onClick={togglePiP}>
                    <Launch className={styles.pipBtn} />
                  </IconButton>
                </Tooltip>
              )}
            </div>
            {audioProducerGlobalMute === true && <div className={styles['global-mute']}>Muted by Admin</div>}
            {audioStream &&
              audioProducerPaused === false &&
              audioProducerGlobalMute === false &&
              (harmony === true ||
                selfUser?.user_setting?.spatialAudioEnabled === false ||
                selfUser?.user_setting?.spatialAudioEnabled === 0) && (
                <div className={styles['audio-slider']}>
                  {volume > 0 && <VolumeDown />}
                  {volume === 0 && <VolumeMute />}
                  <Slider value={volume} onChange={adjustVolume} aria-labelledby="continuous-slider" />
                  <VolumeUp />
                </div>
              )}
          </div>
        </div>
      </div>
    </Draggable>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(PartyParticipantWindow)
