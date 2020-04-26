import React from 'react'
// @ts-ignore
import { Entity, Scene } from 'aframe-react'
import AFRAME from 'aframe'
import Assets from './assets'
import Video360 from '../video360/Video360Room'
import './style.scss'

type State = {
  appRendered?: boolean
  color?: string
}

export default class VideoScene extends React.Component<State> {
  state: State = {
    appRendered: false,
    color: 'red'
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      require('aframe')
      require('networked-aframe')

      this.setState({ appRendered: true })
    }
  }

  isDesktop() {
    const mobile = AFRAME.utils.device.isMobile()
    const headset = AFRAME.utils.device.checkHeadsetConnected()
    return !(mobile) && !(headset)
  }

  render() {
    return (
      <div style={{ height: '100%', width: '100%' }}>
        {this.state.appRendered && (
          <Scene
            class="scene"
            renderer="antialias: true"
            background="color: #FAFAFA"
          >
            <Assets/>
            <Video360/>
            <Entity camera={{}} look-controls={{}} position={{ x: 0, y: 1.6, z: 0 }}>
              <Entity visible={ !this.isDesktop() } cursor={{ rayOrigin: this.isDesktop() ? 'mouse' : 'entity' }}
                raycaster={{ objects: '#player-vr-ui,#videotext' }}
                position={{ x: 0, y: 0, z: -0.8 }} geometry={{ primitive: 'ring', radiusInner: 0.01, radiusOuter: 0.02 }}
                material={{ shader: 'flat', color: 'red' }}>
              </Entity>
            </Entity>
          </Scene>
        )}
      </div>
    )
  }
}
