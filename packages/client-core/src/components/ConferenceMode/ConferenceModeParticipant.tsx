import classNames from 'classnames'
import { t } from 'i18next'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { getAvatarURLForUser } from '@etherealengine/client-core/src/user/components/UserMenu/util'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'
import Slider from '@etherealengine/ui/src/primitives/mui/Slider'
import Tooltip from '@etherealengine/ui/src/primitives/mui/Tooltip'

import { useUserMediaWindowHook } from '../UserMediaWindow'
import styles from './index.module.scss'

interface Props {
  peerID: PeerID
  type: 'cam' | 'screen'
}

const { t } = useTranslation()

const ConferenceModeParticipant = ({ peerID, type }: Props): JSX.Element => {
  const {
    userId,
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
    toggleAudio,
    toggleVideo,
    adjustVolume,
    toggleGlobalMute
  } = useUserMediaWindowHook({ peerID, type })

  return (
    <div
      tabIndex={0}
      id={peerID + '_container'}
      className={classNames({
        [styles['party-chat-user']]: true,
        [styles.pip]: true,
        [styles['self-user']]: isSelf,
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
            src={getAvatarURLForUser(userAvatarDetails, isSelf ? selfUser?.id : userId)}
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
                  size="small"
                  className={styles['icon-button']}
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
                  size="small"
                  className={styles['icon-button']}
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
                  size="small"
                  className={styles['icon-button']}
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
          </div>
          {audioProducerGlobalMute && <div className={styles['global-mute']}>Muted by Admin</div>}
          {audioStream && !audioProducerPaused && !audioProducerGlobalMute && (
            <div className={styles['audio-slider']}>
              {volume === 0 && <Icon type="VolumeMute" />}
              {volume > 0 && volume < 0.7 && <Icon type="VolumeDown" />}
              {volume >= 0.7 && <Icon type="VolumeUp" />}
              <Slider value={volume} onChange={adjustVolume} aria-labelledby="continuous-slider" />
              <Icon type="VolumeUp" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConferenceModeParticipant
