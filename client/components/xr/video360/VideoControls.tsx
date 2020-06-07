import { Component } from 'react'
import Router from 'next/router'
import './VideoControls.scss'
import VideoSeeker from '../../ui/VideoSeeker'
import { connect } from 'react-redux'
import { setVideoPlaying } from '../../../redux/video360/actions'
import { selectVideo360State } from '../../../redux/video360/selector'

import getConfig from 'next/config'
const config = getConfig().publicRuntimeConfig.xr.videoGrid

type Props = {
  videosrc: string
  videotext: string
  videovrui: string
  setVideoPlaying: (playing: boolean) => void
  playing: boolean,
  backButtonHref: string
}
type State = {
  end: boolean
  // setInterval id
  tickId: any
  // duration of video in seconds
  duration: number
  // current time of video in seconds
  currentTime: number,
  bufferedBars: Array<{start: number, end: number}>
}
class VideoControls extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      end: false,
      tickId: null,
      duration: 0,
      currentTime: 0,
      bufferedBars: []
    }
    this.videoPlayHandler = this.videoPlayHandler.bind(this)
    this.videoPauseHandler = this.videoPauseHandler.bind(this)
    this.playHandler = this.playHandler.bind(this)
    this.pauseHandler = this.pauseHandler.bind(this)
    this.exitVideoHandler = this.exitVideoHandler.bind(this)
    this.videoEndHandler = this.videoEndHandler.bind(this)

    this.handleBufferedArr = this.handleBufferedArr.bind(this)
  }

  componentDidMount() {
    this.videoEl = document.getElementById(this.props.videosrc) as HTMLElement
    this.videoEl?.addEventListener('play', this.videoPlayHandler)
    this.videoEl?.addEventListener('pause', this.videoPauseHandler)
    this.textEl = document.querySelector(this.props.videotext) as HTMLElement
    this.videovruiEl = document.querySelector(this.props.videovrui) as HTMLElement
    this.videovruiEl?.addEventListener('triggerplay', this.playHandler)
    this.videovruiEl?.addEventListener('triggerpause', this.pauseHandler)
    this.videovruiEl?.addEventListener('triggerback', this.exitVideoHandler)
    this.videoEl?.addEventListener('buffer-change', this.handleBufferedArr)
    return () => {
      this.videoEl?.removeEventListener('buffer-change', this.handleBufferedArr)
      this.videoEl?.removeEventListener('play', this.videoPlayHandler)
      this.videoEl?.removeEventListener('pause', this.videoPauseHandler)
      this.videovruiEl?.removeEventListener('triggerplay', this.playHandler)
      this.videovruiEl?.removeEventListener('triggerpause', this.pauseHandler)
      this.videovruiEl?.removeEventListener('triggerback', this.exitVideoHandler)
      this.videoEl?.removeEventListener('ended', this.videoEndHandler)
      this.textEl?.removeEventListener('click', this.exitVideoHandler)
    }
  }

  componentWillUnmount() {
    this.videoEl?.removeEventListener('play', this.videoPlayHandler)
    this.videoEl?.removeEventListener('pause', this.videoPauseHandler)
    this.videovruiEl?.removeEventListener('triggerplay', this.playHandler)
    this.videovruiEl?.removeEventListener('triggerpause', this.pauseHandler)
    this.videovruiEl?.removeEventListener('triggerback', this.exitVideoHandler)
    this.videoEl?.removeEventListener('buffer-change', this.handleBufferedArr)
    this.videoEl?.removeEventListener('ended', this.videoEndHandler)
    this.textEl?.removeEventListener('click', this.exitVideoHandler)
    ;(this.videoEl as any)?.pause()

    this.videoEl = null
    this.videovruiEl = null
    this.textEl = null
    this.props.setVideoPlaying(false)
  }

  videoEl: HTMLElement | null = null
  videovruiEl: HTMLElement | null = null
  textEl: HTMLElement | null = null

  handleBufferedArr(e) {
    const bufferedArr = e.detail.bufferedArr
    const duration = (this.videoEl as HTMLVideoElement).duration || 9999
    this.setState({
      bufferedBars: bufferedArr.map(({ start, end }) => ({
        start: start / duration,
        end: end / duration
      }))
    })
  }

  private clickHandler() {
    if (this.state.end) {
      this.exitVideoHandler()
    } else if (!this.props.playing) {
      this.playHandler()
    }
  }

  private playHandler() {
    ;(this.videoEl as HTMLVideoElement)?.play()
    const controller = document.querySelector('#videoplayercontrols')
    controller.classList.remove('active')
    controller.classList.add('disabled')

    this.textEl?.setAttribute('visible', false)
    this.videoEl?.addEventListener('ended', this.videoEndHandler, {
      once: true
    })
    // set playing in redux
    this.props.setVideoPlaying(true)
  }

  pauseHandler() {
    ;(this.videoEl as HTMLVideoElement)?.pause()
    this.props.setVideoPlaying(false)
  }

  private videoEndHandler() {
    ;(this.videoEl as HTMLVideoElement)?.pause()
    const controller = document.querySelector('#videoplayercontrols')
    this.textEl?.addEventListener('click', this.exitVideoHandler)
    controller.classList.remove('disabled')
    controller.classList.add('active')
    this.textEl?.setAttribute('text', { value: 'END\n\nclick to exit' })
    this.textEl?.setAttribute('visible', true)
    this.setState({ end: true })
    this.props.setVideoPlaying(false)
  }

  private videoPlayHandler() {
    if (!this.videoEl) return
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
        if (this.videoEl) {
          this.setState({
            currentTime: (this.videoEl as HTMLVideoElement).currentTime
          })
        }
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
    Router.push(config.link)
  }

  render() {
    return (
      <>
        <div
          onClick={this.clickHandler.bind(this)}
          id="videoplayercontrols"
          className="videoplayercontrols active"
        />
        <VideoSeeker
          backButtonHref={this.props.backButtonHref}
          playing={this.props.playing}
          videoLengthSeconds={this.state.duration}
          currentTimeSeconds={this.state.currentTime}
          bufferedBars={this.state.bufferedBars}
          onTogglePlay={(playing) => {
            if (playing) {
              this.playHandler()
            } else {
              this.pauseHandler()
            }
          }}
          onSeekChange={(t) => {
            ;(this.videoEl as HTMLVideoElement).currentTime = t
            this.setState({
              currentTime: t
            })
          }}
        />
      </>
    )
  }
}
const mapDispatchToProps = {
  setVideoPlaying
}
const mapStateToProps = (state) => {
  return {
    playing: selectVideo360State(state).get('playing')
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(VideoControls)
