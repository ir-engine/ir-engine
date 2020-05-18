import React from 'react'
import Router from 'next/router'
import './VideoControls.scss'
import VideoSeeker from '../../ui/VideoSeeker'
import { connect } from 'react-redux'
import { setVideoPlaying } from '../../../redux/video360/actions'

type Props = {
  videosrc: string,
  videotext: string,
  videovrui: string,
  setVideoPlaying: (playing: boolean) => void
}
type State = {
  playing: boolean,
  end: boolean,
  // setInterval id
  tickId: any,
  // duration of video in seconds
  duration: number,
  // current time of video in seconds
  currentTime: number,
}

class VideoControls extends React.Component<Props, State> {
  state: State = {
    playing: false,
    end: false,
    tickId: null,
    duration: 0,
    currentTime: 0
  }

  videoEl: HTMLElement | null = null
  videovruiEl: HTMLElement | null = null
  textEl: HTMLElement | null = null

  componentDidMount() {
    this.videoEl = document.querySelector(this.props.videosrc) as HTMLElement
    this.videoEl?.addEventListener('play', this.videoPlayHandler.bind(this))
    this.videoEl?.addEventListener('pause', this.videoPauseHandler.bind(this))
    this.textEl = document.querySelector(this.props.videotext) as HTMLElement
    this.videovruiEl = document.querySelector(this.props.videovrui) as HTMLElement
    this.videovruiEl?.addEventListener('triggerplay', this.playHandler.bind(this))
    this.videovruiEl?.addEventListener('triggerpause', this.pauseHandler.bind(this))
    this.videovruiEl?.addEventListener('triggerback', this.exitVideoHandler.bind(this))
  }

  render() {
    return (
      <>
        <div onClick={this.clickHandler.bind(this)}
          id="videoplayercontrols"
          className="videoplayercontrols active">
        </div>
        <VideoSeeker
          playing={this.state.playing}
          videoLengthSeconds={this.state.duration}
          currentTimeSeconds={this.state.currentTime}
          bufferPercentage={0}
          onTogglePlay={playing => {
            if (playing) {
              this.playHandler()
            } else {
              this.pauseHandler()
            }
          }}
          onSeekChange={t => {
            (this.videoEl as HTMLVideoElement).currentTime = t
            this.setState({
              currentTime: t
            })
          }}
        />
      </>
    )
  }

  private clickHandler() {
    if (this.state.end) {
      this.exitVideoHandler()
    } else if (!this.state.playing) {
      this.playHandler()
    }
  }

  private playHandler() {
    (this.videoEl as HTMLVideoElement)?.play()
    const controller = document.querySelector('#videoplayercontrols')
    controller.classList.remove('active')
    controller.classList.add('disabled')

    this.textEl?.setAttribute('visible', false)
    this.videoEl?.addEventListener('ended', this.videoEndHandler.bind(this), { once: true })
    this.setState({ playing: true })
    this.props.setVideoPlaying(true)
  }

  pauseHandler() {
    (this.videoEl as HTMLVideoElement)?.pause()
    this.setState({ playing: false })
    this.props.setVideoPlaying(false)
  }

  private videoEndHandler() {
    (this.videoEl as HTMLVideoElement)?.pause()
    const controller = document.querySelector('#videoplayercontrols')
    this.textEl?.addEventListener('click', this.exitVideoHandler)
    controller.classList.remove('disabled')
    controller.classList.add('active')
    this.textEl?.setAttribute('text', { value: 'END\n\nclick to exit' })
    this.textEl?.setAttribute('visible', true)
    this.setState({ playing: false, end: true })
  }

  private videoPlayHandler() {
    this.videovruiEl?.setAttribute('video-player-vr-ui', {
      isPlaying: true
    })
    // if duration has not been set in state, get this from the video element.
    if (!this.state.duration) {
      this.setState({
        duration: (this.videoEl as HTMLVideoElement).duration
      })
    }
    // when playing, every 1/3 second, update current time in state.
    this.setState({
      tickId: setInterval(() => {
        this.setState({
          currentTime: (this.videoEl as HTMLVideoElement).currentTime
        })
      }, 333)
    })
  }

  private videoPauseHandler() {
    this.videovruiEl?.setAttribute('video-player-vr-ui', {
      isPlaying: false
    })
    // when paused, don't continue updating current time in state.
    clearInterval(this.state.tickId)
  }

  private exitVideoHandler() {
    Router.push('/explore')
  }
}
const mapDispatchToProps = {
  setVideoPlaying
}

export default connect(null, mapDispatchToProps)(VideoControls)
