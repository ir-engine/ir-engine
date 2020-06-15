import React from 'react'
import shaka from 'shaka-player'
import AFRAME from 'aframe'

const loadedDataVideoHandler = () => {
  if (AFRAME.utils.device.isIOS()) {
    // fix Safari iPhone bug with black screen
    forceIOSCanvasRepaint()
  }
}

const forceIOSCanvasRepaint = () => {
  const sceneEl = document.querySelector('a-scene')
  const canvasEl = sceneEl.canvas
  const width = canvasEl.width
  const height = canvasEl.height

  canvasEl.width = width + 1
  canvasEl.height = height + 1
  canvasEl.width = width
  canvasEl.height = height
}

export default class ShakaPlayer extends React.Component {
  constructor(props: shakaPropTypes) {
    super(props)

    this.props = props
    this.initApp = this.initApp.bind(this)
    this.initPlayer = this.initPlayer.bind(this)
  }

  componentDidMount() {
    const sceneEl = document.querySelector('a-scene')
    if (sceneEl?.hasLoaded) this.initApp()
    else sceneEl?.addEventListener('loaded', this.initApp)
    return () => {
      sceneEl?.removeEventListener('loaded', this.initApp)
    }
  }

  componentWillUnmount() {
    const sceneEl = document.querySelector('a-scene')
    sceneEl?.removeEventListener('loaded', this.initApp)

    const video: HTMLVideoElement = document.getElementById(this.props.videosrc) as HTMLVideoElement
    video?.removeEventListener('loadeddata', loadedDataVideoHandler)
  }

  props: shakaPropTypes

  private initApp () {
    shaka.polyfill.installAll()
    if (shaka.Player.isBrowserSupported()) {
      this.initPlayer()
    } else {
      console.error('Browser not supported!')
    }
  }

  private initPlayer () {
    const video: HTMLVideoElement = document.getElementById(this.props.videosrc) as HTMLVideoElement
    const player = new shaka.Player(video)
    player.load(this.props.manifestUri).then(() => {
      console.log('The video has now been loaded!')
    })
    video.addEventListener('loadeddata', loadedDataVideoHandler)
  }

  render() {
    return ''
  }
}

export interface shakaPropTypes extends React.Props<any> {
  manifestUri: string,
  videosrc: string
}
