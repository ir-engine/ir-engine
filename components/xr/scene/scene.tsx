import React from 'react'
// @ts-ignore
import { Scene, Entity } from 'aframe-react'
import Assets from './assets'
import Environment from './environment'
import Player from '../player/player'
import './style.scss'
import SvgVr from '../../icons/svg/Vr'

import Grid from '../layout/Grid'
import AframeComponentRegisterer from '../../xr/aframe/index'

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
    return (
      <div style={{ height: '100%', width: '100%' }}>
        <Scene
          vr-mode-ui="enterVRButton: #enterVRButton"
          loading-screen="dotsColor: purple; backgroundColor: black; enabled: true"
          class="scene"
          renderer="antialias: true"
        >
          <AframeComponentRegisterer/>
          <Entity position="0 0.6 0">
            <Grid />
          </Entity>
          <Assets />
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
