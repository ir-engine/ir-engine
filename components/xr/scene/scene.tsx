import React from 'react'
// @ts-ignore
import { Scene, Entity } from 'aframe-react'
import Assets from './assets'
import Environment from './environment'
import Player from '../player/player'
import './index.scss'
import SvgVr from '../../icons/svg/Vr'

import getConfig from 'next/config'
import Grid from '../layout/Grid'
import AframeComponentRegisterer from '../../xr/aframe/index'
const config = getConfig().publicRuntimeConfig.xr['networked-scene']

type State = {
  appRendered?: boolean
  color?: string
}

export default class NetworkedScene extends React.Component<State> {
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

  render() {
    return (
      <div style={{ height: '100%', width: '100%' }}>
        {this.state.appRendered && (
          <Scene
            vr-mode-ui="enterVRButton: #enterVRButton"
            networked-scene={config}
            class="scene"
            renderer="antialias: true"
            background="color: #FAFAFA"
          >
            <AframeComponentRegisterer/>
            <Entity position="0 0.6 0">
              <Grid />
            </Entity>
            <Assets />
            <Player
              fuseCursor="true" />
            <Environment />
            <a className="enterVR" id="enterVRButton" href="#">
              <SvgVr className="enterVR" />
            </a>
          </Scene>
        )}
      </div>
    )
  }
}
