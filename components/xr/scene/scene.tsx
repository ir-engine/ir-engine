import React, { useState, useEffect } from 'react'
import SceneContainer from './scene-container'
import Assets from './assets'
import Environment from './environment'
import Player from '../player/player'
import './style.scss'
import SvgVr from '../../icons/svg/Vr'

import AframeComponentRegisterer from '../aframe/index'

import LandingScene from './scene-landing'
import ExploreScene from './scene-explore'
import DreamScene from './scene-dream'
import DreamSceneScene from './scene-dream-scene'
import VideoScene, { VideoProps } from './scene-video'

import isExternalUrl from '../../../utils/isExternalUrl'

export default function RootScene (): any {
  const [sceneName, setSceneName] = useState('landing')
  const [videoProps, setVideoProps] = useState({} as VideoProps)
  const [dreamUrl, setDreamUrl] = useState('#placeholder')

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
        const manifestRegex = /manifest=(.*\.mpd)&?/g
        const manifestMatch = manifestRegex.exec(url)
        const manifest = manifestRegex.test(url) ? manifestMatch[1] : ''

        const titleRegex = /title=(.*)&?/g
        const titleMatch = titleRegex.exec(url)
        const title = titleRegex.test(url) ? titleMatch[1] : ''

        const formatRegex = /format=(.*)&?/g
        const formatMatch = formatRegex.exec(url)
        const format = formatRegex.test(url) ? formatMatch[1] : ''

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
