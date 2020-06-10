import './style.scss'
import { useState, useEffect } from 'react'
// import PlayArrowIcon from '@material-ui/icons/PlayArrow'
// import PauseIcon from '@material-ui/icons/Pause'
// import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import triggerNavigation from '../../../utils/triggerNavigation'
import secondsToString from '../../../utils/secondsToString'
const playBtnImageSrc = '/icons/play-shadow.png'
const pauseBtnImageSrc = '/icons/pause-shadow.png'
const backBtnImageSrc = '/icons/back-btn-shadow.png'

type ButtonIconProps = {
  [prop: string]: any,
  imageSrc: string
}
const ButtonIcon = ({ imageSrc, ...props }: ButtonIconProps) => {
  return (<div {...props}><img src={imageSrc} style={{ width: '36px' }} /></div>)
}
const PlayArrowIcon = props => (<ButtonIcon imageSrc={playBtnImageSrc} {...props} />)
const PauseIcon = props => (<ButtonIcon imageSrc={pauseBtnImageSrc} {...props} />)
const ArrowBackIcon = props => (<ButtonIcon imageSrc={backBtnImageSrc} {...props} />)

type Props = {
  playing: boolean,
  onTogglePlay: (playing: boolean) => void,
  onSeekChange?: (seekTimeSeconds: number) => void,
  videoLengthSeconds: number,
  currentTimeSeconds: number,
  bufferedBars: Array<{ start: number, end: number }>,
  backButtonHref: string
}

const VideoSeeker = ({ playing, onTogglePlay, onSeekChange, videoLengthSeconds, currentTimeSeconds, bufferedBars, backButtonHref }: Props) => {
  const [seekPercentage, setSeekPercentage] = useState(0)

  useEffect(() => {
    setSeekPercentage((currentTimeSeconds / videoLengthSeconds) * 100)
  }, [videoLengthSeconds, currentTimeSeconds])
  const backButton = <ArrowBackIcon style={{ color: 'white' }} onClick={() => {
    triggerNavigation(backButtonHref)
  }} />
  const timeRemaining = videoLengthSeconds - currentTimeSeconds
  return (
    <div className="VideoSeeker clickable">
      <div className="seek-bar-container">
        <div className="seek-bar full-bar" style={{
          width: '100%'
        }} />
        {bufferedBars.map(({ start, end }, index) => <div
          className="seek-bar buffer-bar"
          key={'buffered-bar' + index}
          style={{
            left: start * 100 + '%',
            width: (end - start) * 100 + '%'
          }} />)}
        <div className="seek-bar current-time-bar" style={{
          width: seekPercentage + '%'
        }} />
        <div className="seek-bar clickable-bar" onClick={e => {
          if (typeof onSeekChange === 'function') {
            const rect = (e.target as HTMLElement).getBoundingClientRect()
            const left = rect.left
            const width = rect.width
            const t = ((e.clientX - left) / width) * videoLengthSeconds
            onSeekChange(t)
          }
        }} />
      </div>
      {(<div className="back-button-container video-control-button">
        {backButton}
      </div>)}
      <div className="play-controls video-control-button">
        {
          playing ? <PauseIcon onClick={() => onTogglePlay(false)} style={{ color: 'white' }} />
            : <PlayArrowIcon onClick={() => onTogglePlay(true)} style={{ color: 'white' }} />
        }
      </div>
      {!playing && (<div className="time-remaining-text">
        {timeRemaining ? `-${secondsToString(timeRemaining)}` : ''}
      </div>)}
    </div>
  )
}

export default VideoSeeker
