import styles from './VideoSeeker.module.scss'
import React, { useState, useEffect } from 'react'
// import PlayArrowIcon from '@material-ui/icons/PlayArrow'
// import PauseIcon from '@material-ui/icons/Pause'
// import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import triggerNavigation from '@xrengine/common/src/utils/triggerNavigation'
import secondsToString from '@xrengine/common/src/utils/secondsToString'
import classNames from 'classnames'
const playBtnImageSrc = '/icons/play-shadow.png'
const pauseBtnImageSrc = '/icons/pause-shadow.png'
const backBtnImageSrc = '/icons/back-btn-shadow.png'

interface ButtonProps {
  [prop: string]: any
  imageSrc?: string
}
const ButtonIcon = ({ imageSrc, ...props }: ButtonProps): any => {
  return (
    <div {...props}>
      <img src={imageSrc} style={{ width: '36px' }} />
    </div>
  )
}
const PlayArrowIcon = (props: ButtonProps): any => <ButtonIcon imageSrc={playBtnImageSrc} {...props} />
const PauseIcon = (props: ButtonProps): any => <ButtonIcon imageSrc={pauseBtnImageSrc} {...props} />
const ArrowBackIcon = (props: ButtonProps): any => <ButtonIcon imageSrc={backBtnImageSrc} {...props} />

interface Props {
  playing: boolean
  onTogglePlay: (playing: boolean) => void
  onSeekChange?: (seekTimeSeconds: number) => void
  videoLengthSeconds: number
  currentTimeSeconds: number
  bufferedBars: Array<{ start: number; end: number }>
  backButtonHref: string
}

const VideoSeeker = ({
  playing,
  onTogglePlay,
  onSeekChange,
  videoLengthSeconds,
  currentTimeSeconds,
  bufferedBars,
  backButtonHref
}: Props): any => {
  const [seekPercentage, setSeekPercentage] = useState(0)

  useEffect(() => {
    setSeekPercentage((currentTimeSeconds / videoLengthSeconds) * 100)
  }, [videoLengthSeconds, currentTimeSeconds])
  const backButton = (
    <ArrowBackIcon
      style={{ color: 'white' }}
      onClick={() => {
        triggerNavigation(backButtonHref)
      }}
    />
  )
  const timeRemaining = videoLengthSeconds - currentTimeSeconds
  return (
    <div
      className={classNames({
        [styles.VideoSeeker]: true,
        [styles.clickable]: true
      })}
    >
      <div className={styles['seek-bar-container']}>
        <div
          className={classNames({
            [styles['seek-bar']]: true,
            [styles['full-bar']]: true
          })}
          style={{
            width: '100%'
          }}
        />
        {bufferedBars.map(({ start, end }, index) => (
          <div
            className={classNames({
              [styles['seek-bar']]: true,
              [styles['buffer-bar']]: true
            })}
            key={`buffered-bar${index}`}
            style={{
              left: `${start * 100}%`,
              width: `${(end - start) * 100}%`
            }}
          />
        ))}
        <div
          className={classNames({
            [styles['seek-bar']]: true,
            [styles['current-time-bar']]: true
          })}
          style={{
            width: `${seekPercentage}%`
          }}
        />
        <div
          className={classNames({
            [styles['seek-bar']]: true,
            [styles['clickable-bar']]: true
          })}
          onClick={(e) => {
            if (typeof onSeekChange === 'function') {
              const rect = (e.target as HTMLElement).getBoundingClientRect()
              const left = rect.left
              const width = rect.width
              const t = ((e.clientX - left) / width) * videoLengthSeconds
              onSeekChange(t)
            }
          }}
        />
      </div>
      {
        <div
          className={classNames({
            [styles['back-button-container']]: true,
            [styles['video-control-button']]: true
          })}
        >
          {backButton}
        </div>
      }
      <div
        className={classNames({
          [styles['play-controls']]: true,
          [styles['video-control-button']]: true
        })}
      >
        {playing ? (
          <PauseIcon onClick={() => onTogglePlay(false)} style={{ color: 'white' }} />
        ) : (
          <PlayArrowIcon onClick={() => onTogglePlay(true)} style={{ color: 'white' }} />
        )}
      </div>
      {!playing && (
        <div className={styles['time-remaining-text']}>{timeRemaining ? `-${secondsToString(timeRemaining)}` : ''}</div>
      )}
    </div>
  )
}

export default VideoSeeker
