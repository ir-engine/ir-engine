import React from 'react'
// @ts-ignore
import { Scene } from 'aframe-react' // Entity,
import AFRAME from 'aframe'
// import Assets from './assets'
import Environment from './environment-dream'
import Player from '../player/player'
import SvgVr from '../../icons/svg/Vr'
import './style.scss'

type State = {
  appRendered?: boolean
  color?: string
}

export default class DreamSceneScene extends React.Component<State> {
  state: State = {
    appRendered: false,
    color: 'red'
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      require('aframe')

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
            vr-mode-ui="enterVRButton: #enterVRButton"
            class="scene"
            renderer="antialias: true"
            background="color: #FAFAFA"
          >
            <Environment/>
            <Player/>
            <a className="enterVR" id="enterVRButton" href="#">
              <SvgVr className="enterVR" />
            </a>
          </Scene>
        )}
      </div>
    )
  }
}
