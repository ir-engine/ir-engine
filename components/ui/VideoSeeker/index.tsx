import './style.scss'
import { useState, useEffect } from 'react'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'

type Props = {
  playing: boolean,
  onTogglePlay: (playing: boolean) => void,
  onSeekChange?: (seekTimeSeconds: number) => void,
  videoLengthSeconds: number,
  currentTimeSeconds: number,
  bufferPercentage: number
}

const VideoSeeker = ({ playing, onTogglePlay, onSeekChange, videoLengthSeconds, currentTimeSeconds, bufferPercentage }: Props) => {
  const [seekPercentage, setSeekPercentage] = useState(0)

  useEffect(() => {
    setSeekPercentage((currentTimeSeconds / videoLengthSeconds) * 100)
  }, [videoLengthSeconds, currentTimeSeconds])

  return (
    <div className="VideoSeeker">
      <div className="seek-bar-container">
        <div className="seek-bar full-bar" style={{
          width: '100%'
        }} />
        <div className="seek-bar buffer-bar" style={{
          width: bufferPercentage + '%'
        }} />
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
      <div className="play-controls">
        {
          playing ? <PauseIcon onClick={() => onTogglePlay(false)} style={{ color: 'white' }} />
            : <PlayArrowIcon onClick={() => onTogglePlay(true)} style={{ color: 'white' }} />
        }
      </div>
    </div>
  )
}

export default VideoSeeker
