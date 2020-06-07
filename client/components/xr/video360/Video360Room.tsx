
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Entity } from 'aframe-react'
import AFRAME from 'aframe'

import dynamic from 'next/dynamic'
import VideoControls from './VideoControls'
import { selectAppState, selectInVrModeState } from '../../../redux/app/selector'
import { setViewportSize } from '../../../redux/app/actions'
import { selectVideo360State } from '../../../redux/video360/selector'
import { setVideoPlaying } from '../../../redux/video360/actions'
import { shakaPropTypes } from './ShakaPlayer'

import getConfig from 'next/config'
const config = getConfig().publicRuntimeConfig.xr.videoGrid

const ShakaPlayerComp = dynamic(() => import('./ShakaPlayer'), { ssr: false })

const dashManifestName = 'manifest.mpd'
const hlsPlaylistName = 'master.m3u8'

// choose dash or hls
function getManifestUri(manifestPath: string): string {
  return AFRAME.utils.device.isIOS() ? manifestPath.replace(dashManifestName, hlsPlaylistName) : manifestPath
}

const backButtonHref = config.name

export interface Video360Props {
  manifest: string
  title: string
  format: string
}

function Video360Room(props: Video360Props) {
  const text = `${props.title || ''}\n\n(click to play)`

  const videospherePrimitive = props.format === 'eac' ? 'a-eaccube' : 'a-videosphere'
  const videosrc = 'video360Shaka-' + props.title.replace(/[\s]+/g, '').replace(/\W+/g, '-')

  const shakaProps: shakaPropTypes = {
    manifestUri: getManifestUri(props.manifest),
    videosrc: videosrc
  }
  const app = useSelector(state => selectAppState(state))
  const inVrMode = useSelector(state => selectInVrModeState(state))
  const dispatch = useDispatch()
  const [videoEl, setVideoEl] = useState(null)
  const [viewport, setViewport] = useState(app.get('viewport'))
  const video360State = useSelector(state => selectVideo360State(state))
  const [playing, setPlaying] = useState(false)

  // get viewport for width/height
  useEffect(() => {
    setViewportSize(window.innerWidth, window.innerHeight)
    setViewport(app.get('viewport'))
  }, [app])

  useEffect(() => {
    setPlaying(video360State.get('playing'))
  }, [video360State])

  function playPauseHandler(e) {
    dispatch(setVideoPlaying(e.detail))
  }

  useEffect(() => {
    document.addEventListener('setPlaying', playPauseHandler)
    return () => {
      document.removeEventListener('setPlaying', playPauseHandler)
    }
  }, [playPauseHandler])

  // get or create video asset
  useEffect(() => {
    let videoEl = document.getElementById(videosrc) as HTMLElement
    if (videoEl === null) {
      videoEl = document.createElement('video')
      videoEl.setAttribute('id', videosrc)
      const assets = document.querySelector('a-assets')
      assets?.appendChild(videoEl)
    }
    setVideoEl(videoEl)

    return () => {
      const videoEl = document.getElementById(videosrc)
      videoEl?.parentElement.removeChild(videoEl)
    }
  }, [videosrc])

  return (
    <Entity>
      { videoEl && <ShakaPlayerComp {...shakaProps} /> }
      { videoEl &&
      <Entity
        primitive={videospherePrimitive}
        class="videosphere"
        src={'#' + videosrc}
        loop="false"
      /> }
      { videoEl && !inVrMode &&
      <VideoControls
        videosrc={videosrc} videotext="#videotext" videovrui="#video-player-vr-ui" backButtonHref={backButtonHref} />
      }
      { videoEl && viewport.width && inVrMode &&
      <Entity
        primitive='a-video-controls'
        position="0 -1 -4"
        videosrc={'#' + videosrc}
        viewport-width={viewport.width}
        bar-height={0.12}
        back-button-href={backButtonHref}
        playing={playing}
      />
      }
      { !inVrMode &&
      <Entity id="videotext"
        className="clickable"
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
      }
    </Entity>
  )
}

export default Video360Room
