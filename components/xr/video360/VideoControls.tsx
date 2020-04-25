import React from 'react'
import Router from 'next/router'
import './VideoControls.scss'

type Props = {
  videosrc: string,
  videotext: string,
  videovrui: string
}
type State = {
  playing: boolean,
  end: boolean
}

export default class Video360Room extends React.Component<Props, State> {
  state: State = {
    playing: false,
    end: false
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
  }

  render() {
    return (
      <div onClick={ this.clickHandler.bind(this) }
        id="videoplayercontrols"
        className="videoplayercontrols active">
      </div>
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
  }

  pauseHandler() {
    (this.videoEl as HTMLVideoElement)?.pause()
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
    this.videovruiEl?.setAttribute('player-vr-ui', {
      isPlaying: true
    })
  }

  private videoPauseHandler() {
    this.videovruiEl?.setAttribute('player-vr-ui', {
      isPlaying: false
    })
  }

  private exitVideoHandler() {
    Router.push('/')
  }
}
