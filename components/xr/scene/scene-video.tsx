import React from 'react'
// @ts-ignore
import { Entity, Scene } from 'aframe-react'
import AFRAME from 'aframe'
import Assets from './assets'
import './style.scss'
// @ts-ignore
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import VideoControls from '../video360/VideoControls'
import AframeComponentRegisterer from '../aframe'
const ShakaPlayerComp = dynamic(() => import('../video360/ShakaPlayerComp'), { ssr: false })

type State = {
  appRendered?: boolean
  color?: string
}

export default class VideoScene extends React.Component<State> {
  state: State = {
    appRendered: false,
    color: 'red'
  }

  router = useRouter()
  title = this.router.query.title as string
  format = this.router.query.videoformat as string
  videospherePrimitive = this.format === 'eac' ? 'a-eaccube' : 'a-videosphere'
  text = `${this.title || ''}\n\n(click to play)`

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
    return !mobile && !headset
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
            <Assets />
            <Entity>
              <AframeComponentRegisterer />
              <ShakaPlayerComp />
              <Entity id="videoPlayerContainer"></Entity>
              <Entity
                primitive={this.videospherePrimitive}
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
                videosrc="#video360Shaka"
                videotext="#videotext"
                videovrui="#video-player-vr-ui"
              />
              <Entity
                id="videotext"
                text={{
                  font: 'mozillavr',
                  width: 2,
                  align: 'center',
                  baseline: 'center',
                  color: 'black',
                  transparent: false,
                  value: this.text
                }}
                position={{ x: 0, y: 1.6, z: -0.8 }}
              />
            </Entity>
            <Entity
              camera={{}}
              look-controls={{}}
              position={{ x: 0, y: 1.6, z: 0 }}
            >
              <Entity
                visible={!this.isDesktop()}
                cursor={{ rayOrigin: this.isDesktop() ? 'mouse' : 'entity' }}
                raycaster={{ objects: '#video-player-vr-ui,#videotext' }}
                position={{ x: 0, y: 0, z: -0.8 }}
                geometry={{
                  primitive: 'ring',
                  radiusInner: 0.01,
                  radiusOuter: 0.02
                }}
                material={{ shader: 'flat', color: 'red' }}
              ></Entity>
            </Entity>
          </Scene>
        )}
      </div>
    )
  }
}
