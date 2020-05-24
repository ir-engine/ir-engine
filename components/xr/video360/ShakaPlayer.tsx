import React from 'react'
import shaka from 'shaka-player'
import AFRAME from 'aframe'

const initApp = (manifestUri: string) => {
  shaka.polyfill.installAll()

  if (shaka.Player.isBrowserSupported()) {
    initPlayer(manifestUri)
  } else {
    console.error('Browser not supported!')
  }
}

const initPlayer = (manifestUri: string) => {
  const video: HTMLVideoElement = document.getElementById('video360Shaka') as HTMLVideoElement
  const player = new shaka.Player(video)

  player.load(manifestUri).then(() => {
    console.log('The video has now been loaded!')
  })
  video.addEventListener('loadeddata', loadedDataVideoHandler)
}

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
  }

  componentDidMount() {
    const sceneEl = document.querySelector('a-scene')
    if (sceneEl?.hasLoaded) initApp(this.props.manifestUri)
    else sceneEl?.addEventListener('loaded', initApp.bind(this, this.props.manifestUri))
  }

  props: shakaPropTypes

  render() {
    return ''
  }
}

export interface shakaPropTypes extends React.Props<any> {
  manifestUri: string,
}
