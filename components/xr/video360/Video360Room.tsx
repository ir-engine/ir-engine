
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Entity } from 'aframe-react'
import AFRAME from 'aframe'

import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import VideoControls from './VideoControls'
import AframeComponentRegisterer from '../aframe'
import { shakaPropTypes } from './ShakaPlayerComp'
import { selectAppState } from '../../../redux/app/selector'
import { selectVideo360State } from '../../../redux/video360/selector'
import { setVideoPlaying } from '../../../redux/video360/actions'
const THREE = AFRAME.THREE
const ShakaPlayerComp = dynamic(() => import('./ShakaPlayerComp'), { ssr: false })

const dashManifestName = 'manifest.mpd'
const hlsPlaylistName = 'master.m3u8'

// choose dash or hls
function getManifestUri(manifestPath: string): string {
  return AFRAME.utils.device.isIOS() ? manifestPath.replace(dashManifestName, hlsPlaylistName) : manifestPath
}

const barHeight = 0.12

const loader = new THREE.TextureLoader()
// TODO: find if there is an SVGLoader and see if you can use that
// TODO: download image directly into project so it's not referencing external resources
const playBtnImageSrc = '/icons/play.png'
const pauseBtnImageSrc = '/icons/pause.png'
const playBtnImageMap = loader.load(playBtnImageSrc)
const pauseBtnImageMap = loader.load(pauseBtnImageSrc)
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
const videoControlsPosition = {
  y: -2,
  z: -4
}

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
  const dispatch = useDispatch()
  const [videoEl, setVideoEl] = useState(null)
  const [viewport, setViewport] = useState({ width: 1400, height: 900 })
  const [videoCamera, setVideoCamera] = useState(null)
  const [timeline, setTimeline] = useState(null)
  const video360State = useSelector(state => selectVideo360State(state))
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)

  // for resizing bar based on width of screen (window.innerWidth)
  function getBarFullWidth(width) {
    return width / 200
  }
  // creates a plane geometry for the seeker/timeline bars
  function createTimeline({ name, width, height, color, t, opacity = 1 }) {
    const matTimeline = new THREE.MeshBasicMaterial({
      side: THREE.FrontSide,
      transparent: opacity < 1,
      opacity,
      color
    })

    const geomTimeline = new THREE.PlaneBufferGeometry(1, height)
    const meshTimeline = new THREE.Mesh(geomTimeline, matTimeline)
    meshTimeline.name = name
    meshTimeline.position.z = videoControlsPosition.z
    meshTimeline.position.y = videoControlsPosition.y
    // translate geom positions so that it can grow from the left
    meshTimeline.position.x = -width / 2

    setTimelineWidth(meshTimeline, width * t)
    return meshTimeline
  }
  function createTimelineButton({ name, x, size }) {
    const matButton = new THREE.MeshBasicMaterial({
      side: THREE.FrontSide,
      transparent: true,
      opacity: 0.8,
      map: playing ? pauseBtnImageMap : playBtnImageMap
    })

    const geomButton = new THREE.PlaneBufferGeometry(size, size)
    const meshButton = new THREE.Mesh(geomButton, matButton)
    meshButton.name = name
    meshButton.position.z = videoControlsPosition.z
    meshButton.position.y = videoControlsPosition.y
    // translate geom positions so that it can grow from the left
    meshButton.position.x = x
    return meshButton
  }
  // resize timeline, used for seeker and buffer bars
  function setTimelineWidth(mesh, width) {
    const positions = mesh.geometry.attributes.position.array as Array<number>
    // top left x
    positions[0] = 0
    // bottom left x
    positions[6] = 0
    // top right x
    positions[3] = width
    // bottom right x
    positions[9] = width
  }
  // get the video element so we can get the duration and current time, and update the current time with seeker controls.
  useEffect(() => {
    const videoEl = document.querySelector(videosrc) as HTMLElement
    setVideoEl(videoEl)
  }, [videosrc])

  // set video duration and continuously update current time if the video is playing
  useEffect(() => {
    if (videoEl) {
      if (timeline) {
        timeline.button.material.map = playing ? pauseBtnImageMap : playBtnImageMap
      }
      if (playing) {
        // get duration of video so we can render the seeker relative to this
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
    }
  }, [videosrc, playing, videoEl, timeline])

  // get video camera so we can attach video controls to it, so they move with the camera rotation
  useEffect(() => {
    if (!videoCamera) {
      setVideoCamera(document.getElementsByClassName('video360Camera')[0])
    }
  }, [videoCamera])

  // get viewport for width/height
  useEffect(() => {
    setViewport(app.get('viewport'))
  }, [app])
  // get whether video is playing or not from redux state
  useEffect(() => {
    setPlaying(video360State.get('playing'))
  }, [video360State])
  useEffect(() => {
    if (videoEl) {
      if (playing) {
        (videoEl as HTMLVideoElement)?.play()
      } else {
        (videoEl as HTMLVideoElement)?.pause()
      }
    }
  }, [playing, videoEl])

  // create full and seeker bars (3D)
  useEffect(() => {
    if (videoCamera) {
      const fullBar = createTimeline({
        name: 'fullBarTimeline',
        width: getBarFullWidth(viewport.width),
        height: barHeight,
        opacity: 0.5,
        t: 1,
        color: 0xFFFFFF
      })
      const currentTimeBar = createTimeline({
        name: 'currentTimeBarTimeline',
        width: getBarFullWidth(viewport.width),
        height: barHeight,
        opacity: 1,
        t: 1,
        color: 0x00ceff
      })
      // position the current time bar slightly in front of full bar, so it's colour is not changed
      currentTimeBar.position.z += 0.0005

      const timelineButton = createTimelineButton({
        name: 'playPauseButton',
        size: 0.25,
        x: fullBar.position.x - 0.2
      })

      setTimeline({
        fullBar,
        currentTimeBar,
        button: timelineButton
        // bufferBar: bufferBar
      })
      videoCamera.setObject3D(fullBar.name, fullBar)
      videoCamera.setObject3D(currentTimeBar.name, currentTimeBar)
      videoCamera.setObject3D(timelineButton.name, timelineButton)
    }
  }, [videoCamera, viewport])
  // update seeker bar
  function updateSeekBar() {
    if (videoCamera && timeline) {
      const currentTimeBar = timeline.currentTimeBar
      setTimelineWidth(currentTimeBar, getBarFullWidth(viewport.width) * (currentTime / duration))
      currentTimeBar.geometry.attributes.position.needsUpdate = true
    }
  }
  useEffect(() => {
    updateSeekBar()
    // console.log('currentTime:', currentTime, 'duration:', duration)
  }, [videoCamera, timeline, viewport, currentTime, duration])

  // user interaction with seeker
  function onClick(event) {
    // normalize mouse position for three.js vector
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    raycaster.setFromCamera(mouse, videoCamera.getObject3D('camera'))

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects([timeline.fullBar, timeline.button])
    if (intersects.length) {
      // position along x axis between 0 and 1, where the click was made.
      // used for setting the video seeker position
      const timelineIntersection = intersects.find(({ object: { name } }) => name === 'fullBarTimeline')
      const playPauseBtnIntersection = intersects.find(({ object: { name } }) => name === 'playPauseButton')

      if (timelineIntersection) {
        const t = timelineIntersection.uv.x
        // set video element current time
        const newCurrentTime = t * (duration || 0); // default duration to 0 because it is possibly NaN if video metadata not loaded
        (videoEl as HTMLVideoElement).currentTime = newCurrentTime
        setCurrentTime(newCurrentTime)
        updateSeekBar()
      }
      if (playPauseBtnIntersection) {
        dispatch(setVideoPlaying(!playing))
      }
    }
  }
  useEffect(() => {
    if (window && timeline && videoEl) {
      window.addEventListener('click', onClick, false)

      return () => {
        window.removeEventListener('click', onClick, false)
      }
    }
  }, [window, timeline, videoEl, duration, playing])
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
      {/* <Entity
        id="video-player-vr-ui"
        video-player-vr-ui={{}}
        position={{ x: 0, y: 0.98, z: -0.9 }}
      /> */}
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
