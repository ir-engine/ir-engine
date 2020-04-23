import React from 'react'
import shaka from 'shaka-player'
import AFRAME from 'aframe'

function initApp(manifestUri: string) {
  shaka.polyfill.installAll()

  if (shaka.Player.isBrowserSupported()) {
    initPlayer(manifestUri)
  } else {
    console.error('Browser not supported!')
  }
}

function initPlayer(manifestUri: string) {
  var video: HTMLVideoElement = document.getElementById('video360Shaka') as HTMLVideoElement
  var player = new shaka.Player(video)

  player.load(manifestUri).then(function() {
    console.log('The video has now been loaded!')
  })
  video.addEventListener('loadeddata', loadedDataVideoHandler)
}

function loadedDataVideoHandler() {
  if (AFRAME.utils.device.isIOS()) {
    // fix for iPhone
    forceIOSCanvasRepaint()
  }
}

function forceIOSCanvasRepaint() {
  const sceneEl = document.querySelector('a-scene')
  const canvasEl = sceneEl.canvas
  const width = canvasEl.width
  const height = canvasEl.height

  canvasEl.width = width + 1
  canvasEl.height = height + 1
  canvasEl.width = width
  canvasEl.height = height
}

export default class Video360Room extends React.Component {
  props: propTypes

  constructor(props: propTypes) {
    super(props)

    this.props = props
  }

  componentDidMount() {
    var sceneEl = document.querySelector('a-scene')
    if (sceneEl?.hasLoaded) initApp(this.props.manifestUri)
    else sceneEl?.addEventListener('loaded', initApp.bind(this, this.props.manifestUri))
  }

  render() {
    return ''
  }
}

type propTypes = {
  manifestUri: string,
}
