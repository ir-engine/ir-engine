import React, { useState, useEffect } from 'react'
import SceneContainer from './scene-container'
import Assets from './assets'
import Environment from './environment'
import Player from '../player/player'
import './style.scss'
import SvgVr from '../../icons/svg/Vr'

import AframeComponentRegisterer from '../aframe/index'

import LandingScene from './landing'
import ExploreScene from './explore'
import DreamScene from './dream'
import DreamSceneScene from './dream-scene'
import VideoScene, { VideoProps } from './video'

import isExternalUrl from '../../../utils/isExternalUrl'

interface Props {
  startingScene?: string,
  manifest?: string,
  title?: string,
  format?: string,
  dreamUrl?: string
}

export default function RootScene (props: Props): any {
  const [sceneName, setSceneName] = useState(props.startingScene || 'landing')
  const [videoProps, setVideoProps] = useState({
    manifest: props.manifest || '',
    title: props.title || '',
    format: props.format || ''
  } as VideoProps)
  const [dreamUrl, setDreamUrl] = useState(props.dreamUrl || '')

  const navigationHandler = e => {
    const url = e.detail.url

    if (isExternalUrl(url)) {
      window.location.href = url
    } else {
      if (/^\/?explore/g.test(url)) setSceneName('explore')
      else if (/^\/?dreamscene/g.test(url)) {
        const urlRegex = /url=(.*)&?/g
        const urlMatch = urlRegex.exec(url)
        // const dreamurl = urlRegex.test(url) ? urlMatch[1] : ''

        setDreamUrl(urlMatch[1])
        setSceneName('dreamscene')
      } else if (/^\/?dream/g.test(url)) setSceneName('dream')
      else if (/^\/?video/g.test(url)) {
        const manifestRegex = /manifest=(.*\.mpd)&?/
        const manifestMatch = manifestRegex.exec(url)
        const manifest = manifestMatch != null ? manifestMatch[1] : ''

        const titleRegex = /title=([\w\s]+)&?/
        const titleMatch = titleRegex.exec(url)
        const title = titleMatch != null ? titleMatch[1] : ''

        const formatRegex = /format=([\w]+)&?/
        const formatMatch = formatRegex.exec(url)
        const format = formatMatch != null ? formatMatch[1] : ''

        const videoProps: VideoProps = {
          manifest: manifest,
          title: title,
          format: format
        }
        setVideoProps(videoProps)
        setSceneName('video')
      } else setSceneName('landing')
    }
  }
  useEffect(() => {
    document.addEventListener('navigate', navigationHandler, { once: true })
    return () => {
      document.removeEventListener('navigate', navigationHandler)
    }
  }, [navigationHandler])

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <SceneContainer>
        <AframeComponentRegisterer />
        <Assets />
        { sceneName !== 'video' && <Player /> }
        { sceneName !== 'video' && sceneName !== 'dreamscene' && <Environment /> }

        { sceneName === 'landing' && <LandingScene /> }
        { sceneName === 'explore' && <ExploreScene /> }
        { sceneName === 'dream' && <DreamScene /> }
        { sceneName === 'dreamscene' && <DreamSceneScene url={dreamUrl}/> }
        { sceneName === 'video' &&
          <VideoScene
            manifest={videoProps.manifest}
            title={videoProps.title}
            format={videoProps.format}/> }
        <a className="enterVR" id="enterVRButton" href="#">
          <SvgVr className="enterVR" />
        </a>
      </SceneContainer>
    </div>
  )
}
