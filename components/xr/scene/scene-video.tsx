import { useState, useEffect } from 'react'
import SceneContainer from './scene-container'
import { Entity } from 'aframe-react'
import AFRAME from 'aframe'
import Assets from './assets'
import Video360 from '../video360/Video360Room'
import './style.scss'

type State = {
  appRendered?: boolean
}

export const VideoScene = () => {
  const [state, setState] = useState({ appRendered: false })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      require('aframe')
      require('networked-aframe')

      setState({ ...state, appRendered: true })
    }
  }, [])

  const isDesktop = (): boolean =>
    !AFRAME.utils.device.isMobile() && !AFRAME.utils.device.checkHeadsetConnected()

  return (
    <div style={{ height: '100%', width: '100%' }}>
      {state.appRendered && (
        <SceneContainer>
          <Assets/>
          <Video360/>
          <Entity camera={{}} look-controls={{}} position={{ x: 0, y: 1.6, z: 0 }} className="video360Camera">
            <Entity visible={ !isDesktop() } cursor={{ rayOrigin: isDesktop() ? 'mouse' : 'entity' }}
              raycaster={{ objects: '#video-player-vr-ui,#videotext' }}
              position={{ x: 0, y: 0, z: -0.8 }} geometry={{ primitive: 'ring', radiusInner: 0.01, radiusOuter: 0.02 }}
              material={{ shader: 'flat', color: 'red' }} />
          </Entity>
        </SceneContainer>
      )}
    </div>
  )
}

export default VideoScene
