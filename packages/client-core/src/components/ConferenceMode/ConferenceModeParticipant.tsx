import classNames from 'classnames'
import React from 'react'

import { getAvatarURLForUser } from '@xrengine/client-core/src/user/components/UserMenu/util'

import {
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

import { useUserMediaWindowHook } from '../UserMediaWindow'
import styles from './index.module.scss'

interface Props {
  peerId?: string | 'cam_me' | 'screen_me'
}

const ConferenceModeParticipant = ({ peerId }: Props): JSX.Element => {
  const {
    user,
    volume,
    isScreen,
    username,
    selfUser,
    audioRef,
    videoRef,
    isSelfUser,
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
    t,
    toggleAudio,
    toggleVideo,
    adjustVolume,
    toggleGlobalMute
  } = useUserMediaWindowHook({ peerId })

  return (
    <div
      tabIndex={0}
      id={peerId + '_container'}
      className={classNames({
        [styles['party-chat-user']]: true,
        [styles.pip]: true,
        [styles['self-user']]: peerId === 'cam_me',
        [styles['no-video']]: videoStream == null,
        [styles['video-paused']]: videoStream && (videoProducerPaused || videoStreamPaused)
      })}
    >
      <div
        className={classNames({
          [styles['video-wrapper']]: !isScreen,
          [styles['screen-video-wrapper']]: isScreen
        })}
      >
        {(videoStream == null || videoStreamPaused || videoProducerPaused || videoProducerGlobalMute) && (
          <img
            src={getAvatarURLForUser(userAvatarDetails, isSelfUser ? selfUser?.id : user?.id)}
            alt=""
            crossOrigin="anonymous"
            draggable={false}
          />
        )}
        <video key={peerId + '_cam'} ref={videoRef} draggable={false} />
      </div>
      <audio key={peerId + '_audio'} ref={audioRef} />
      <div className={styles['user-controls']}>
        <div className={styles['username']}>{username}</div>
        <div className={styles['controls']}>
          <div className={styles['mute-controls']}>
            {videoStream && !videoProducerPaused ? (
              <Tooltip title={!videoProducerPaused && !videoStreamPaused ? 'Pause Video' : 'Resume Video'}>
                <IconButton size="small" className={styles['icon-button']} onClick={toggleVideo}>
                  {videoStreamPaused ? <VideocamOff /> : <Videocam />}
                </IconButton>
              </Tooltip>
            ) : null}
            {enableGlobalMute && peerId !== 'cam_me' && peerId !== 'screen_me' && audioStream && (
              <Tooltip
                title={
                  !audioProducerGlobalMute
                    ? (t('user:person.muteForEveryone') as string)
                    : (t('user:person.unmuteForEveryone') as string)
                }
              >
                <IconButton size="small" className={styles['icon-button']} onClick={toggleGlobalMute}>
                  {audioProducerGlobalMute ? <VoiceOverOff /> : <RecordVoiceOver />}
                </IconButton>
              </Tooltip>
            )}
            {audioStream && !audioProducerPaused ? (
              <Tooltip
                title={
                  (isSelfUser && audioStream?.paused === false
                    ? t('user:person.muteMe')
                    : isSelfUser && audioStream?.paused === true
                    ? t('user:person.unmuteMe')
                    : peerId !== 'cam_me' && peerId !== 'screen_me' && audioStream?.paused === false
                    ? t('user:person.muteThisPerson')
                    : t('user:person.unmuteThisPerson')) as string
                }
              >
                <IconButton size="small" className={styles['icon-button']} onClick={toggleAudio}>
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
          </div>
          {audioProducerGlobalMute && <div className={styles['global-mute']}>Muted by Admin</div>}
          {audioStream && !audioProducerPaused && !audioProducerGlobalMute && (
            <div className={styles['audio-slider']}>
              {volume === 0 && <VolumeMute />}
              {volume > 0 && volume < 0.7 && <VolumeDown />}
              {volume >= 0.7 && <VolumeUp />}
              <Slider value={volume} onChange={adjustVolume} aria-labelledby="continuous-slider" />
              <VolumeUp />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConferenceModeParticipant
