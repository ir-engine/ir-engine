
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Entity } from 'aframe-react'
import AFRAME from 'aframe'

import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import VideoControls from './VideoControls'
import AframeComponentRegisterer from '../aframe'
import { shakaPropTypes } from './ShakaPlayerComp'
import { selectAppState } from '../../../redux/app/selector'
import { selectVideo360State } from '../../../redux/video360/selector'
const THREE = AFRAME.THREE
const ShakaPlayerComp = dynamic(() => import('./ShakaPlayerComp'), { ssr: false })

const dashManifestName = 'manifest.mpd'
const hlsPlaylistName = 'master.m3u8'

// choose dash or hls
function getManifestUri(manifestPath: string): string {
  return AFRAME.utils.device.isIOS() ? manifestPath.replace(dashManifestName, hlsPlaylistName) : manifestPath
}

const barHeight = 0.12

function Video360Room() {
  const router = useRouter()
  const manifest = router.query.manifest as string
  const title = router.query.title as string
  // const runtime = router.query.runtime as string
  // const credit = router.query.credit as string
  // const rating = router.query.rating as string
  // const categories = router.query.categories as string
  // const tags = router.query.tags as string
  const format = router.query.videoformat as string

  const text = `${title || ''}\n\n(click to play)`
  // \n\n${runtime || ''}\n${credit || ''}\n${'rating: ' + rating}\n${categories || ''}\n${tags || ''}

  const shakaProps: shakaPropTypes = { manifestUri: getManifestUri(manifest) }
  const videospherePrimitive = format === 'eac' ? 'a-eaccube' : 'a-videosphere'
  const videosrc = '#video360Shaka'
  const app = useSelector(state => selectAppState(state))
  const [viewport, setViewport] = useState({ width: 1400, height: 900 })
  const [videoCamera, setVideoCamera] = useState(null)
  const [timeline, setTimeline] = useState(null)
  const video360State = useSelector(state => selectVideo360State(state))
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  function getBarFullWidth(width) {
    return width / 200
  }
  function createTimeline({ name, width, height, color, t }) {
    const matTimeline = new THREE.MeshBasicMaterial({
      side: THREE.FrontSide,
      transparent: true,
      opacity: 0.5,
      color
    })

    const geomTimeline = new THREE.PlaneBufferGeometry(1, height)
    const meshTimeline = new THREE.Mesh(geomTimeline, matTimeline)
    meshTimeline.name = name
    meshTimeline.position.z = -4
    meshTimeline.position.y = -2
    // translate geom positions so that it can grow from the left
    meshTimeline.position.x = -width / 2

    const positions = geomTimeline.attributes.position.array as Array<number>
    setTimelineWidth(positions, width * t)
    return meshTimeline
  }
  function setTimelineWidth(positions, width) {
    // top left x
    positions[0] = 0
    // bottom left x
    positions[6] = 0
    // top right x
    positions[3] = width
    // bottom right x
    positions[9] = width
  }
  useEffect(() => {
    console.log('playing', playing)
    if (playing) {
      const videoEl = document.querySelector(videosrc) as HTMLElement

      setDuration((videoEl as HTMLVideoElement).duration)
      // get current time of playing video on seconds
      // could use videoEl.requestVideoFrameCallback instead when there is support
      const tickId = setInterval(() => {
        setCurrentTime((videoEl as HTMLVideoElement).currentTime)
      }, 333)
      return () => {
        clearInterval(tickId)
      }
    }
  }, [videosrc, playing])
  useEffect(() => {
    if (!videoCamera) {
      setVideoCamera(document.getElementsByClassName('video360Camera')[0])
    }
  }, [videoCamera])
  useEffect(() => {
    setViewport(app.get('viewport'))
  }, [app])
  useEffect(() => {
    setPlaying(video360State.get('playing'))
  }, [video360State])
  useEffect(() => {
    if (videoCamera && !timeline) {
      const fullBar = createTimeline({
        name: 'fullBarTimeline',
        width: getBarFullWidth(viewport.width),
        height: barHeight,
        t: 1,
        color: 0xFFFFFF
      })

      const currentTimeBar = createTimeline({
        name: 'currentTimeBarTimeline',
        width: getBarFullWidth(viewport.width),
        height: barHeight,
        t: 1,
        color: 0xFF0000
      })
      setTimeline({
        fullBar,
        currentTimeBar
        // bufferBar: bufferBar
      })

      videoCamera.setObject3D(fullBar.name, fullBar)
      videoCamera.setObject3D(currentTimeBar.name, currentTimeBar)
    }
  }, [videoCamera, timeline, viewport])
  useEffect(() => {
    if (videoCamera && timeline) {
      const currentTimeBar = timeline.currentTimeBar
      const positions = currentTimeBar.geometry.attributes.position.array as Array<number>
      setTimelineWidth(positions, getBarFullWidth(viewport.width) * (currentTime / duration))
      currentTimeBar.geometry.attributes.position.needsUpdate = true
    }
    console.log('currentTime:', currentTime, 'duration:', duration)
  }, [videoCamera, timeline, viewport, currentTime, duration])
  return (
    <Entity>
      <AframeComponentRegisterer />
      <ShakaPlayerComp {...shakaProps} />
      <Entity
        id="videoPlayerContainer"
      ></Entity>
      <Entity
        primitive={videospherePrimitive}
        class="videosphere"
        src="#video360Shaka"
        loop="false"
      />
      <Entity
        id="video-player-vr-ui"
        video-player-vr-ui={{}}
        position={{ x: 0, y: 0.98, z: -0.9 }}
      />
      <VideoControls
        videosrc="#video360Shaka" videotext="#videotext" videovrui="#video-player-vr-ui" />
      <Entity id="videotext"
        text={{
          font: 'roboto',
          width: 2,
          align: 'center',
          baseline: 'center',
          color: 'white',
          transparent: false,
          value: text
        }}
        position={{ x: 0, y: 1.6, z: -0.8 }}
      />
    </Entity>
  )
}

export default Video360Room
