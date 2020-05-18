import React from 'react'
import SceneContainer from './scene-container'
import Assets from './assets'
import Environment from './environment'
import Player from '../player/player'
import './style.scss'

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
          <SceneContainer>
            <Assets/>
            <Environment/>
            <Player/>
          </SceneContainer>
        )}
      </div>
    )
  }
}
