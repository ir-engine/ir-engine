import React from 'react'
// @ts-ignore
import { Scene } from 'aframe-react'
import Assets from './assets'
import Environment from './environment'
import Player from '../player/player'
import './index.scss'

type State = {
  appRendered?: boolean
  color?: string
}

export default class EnvironmentScene extends React.Component<State> {
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
            <Environment/>
            <Player/>
          </Scene>
        )}
      </div>
    )
  }
}
