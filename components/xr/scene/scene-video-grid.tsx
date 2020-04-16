import React from 'react'
// @ts-ignore
import { Scene, Entity } from 'aframe-react'
import Assets from './assets'
import Grid from '../layout/Grid'
import Skybox from './skybox-grid'
import './index.scss'
import SvgVr from '../../icons/svg/Vr'

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

  render() {
    return (
      <div style={{ height: '100%', width: '100%' }}>
        {this.state.appRendered && (
          <Scene
            vr-mode-ui="enterVRButton: #enterVRButton"
            class="scene"
            renderer="antialias: true"
            background="color: #FAFAFA"
            embedded
          >
            <Assets />
            <Grid />
            <Skybox />
            <a-plane
              color="#000"
              height="20000"
              width="200000"
              rotation="-90 0 0"
            ></a-plane>
            <Entity player="fuseCursor: true" />
            <a className="enterVR" id="enterVRButton" href="#">
              <SvgVr className="enterVR" />
            </a>
          </Scene>
        )}
      </div>
    )
  }
}
