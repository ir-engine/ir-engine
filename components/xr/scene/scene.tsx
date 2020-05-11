import React from 'react'
// @ts-ignore
import { Scene } from 'aframe-react'
import Environment from './environment'
import Player from '../player/player'
import './style.scss'
import SvgVr from '../../icons/svg/Vr'

import AframeComponentRegisterer from '../aframe/index'

type Props = {
  children?: any
}

type State = {
  color?: string
}

export default class SceneRoot extends React.Component<Props> {
  state: State = {
    color: 'red'
  }

  render() {
    document.querySelector('a-loader-title').style.setProperty('opacity', '0')

    return (
      <div style={{ height: '100%', width: '100%' }}>
        <Scene
          vr-mode-ui="enterVRButton: #enterVRButton"
          loading-screen="dotsColor: purple; backgroundColor: black; enabled: true"
          class="scene"
          renderer="antialias: true"
        >
          <AframeComponentRegisterer />
          <Player />
          <Environment />
          {this.props.children}
          <a className="enterVR" id="enterVRButton" href="#">
            <SvgVr className="enterVR" />
          </a>
        </Scene>
      </div>
    )
  }
}
