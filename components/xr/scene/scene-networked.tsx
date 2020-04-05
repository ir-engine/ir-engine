import React from 'react'
// @ts-ignore
import { Scene } from 'aframe-react'
// import 'networked-aframe'
import Assets from './assets'
import SceneObjects from './scene-objects'
import Player from '../player/player'

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
      // require('aframe-particle-system-component')
      this.setState({ appRendered: true })
    }
  }

  render() {
    return (
      <div style={{ height: '100%', width: '100%' }}>
        {this.state.appRendered && (
          <Scene
            networked-scene="room: 1;
                audio: true;
                adapter: janus;
                serverURL: ws://localhost:3000;// To do- this will be replaced by the shard manager
            "
            renderer="antialias: true"
            background="color: #FAFAFA"
          >
            <Assets/>
            <Player/>
            <SceneObjects/>
          </Scene>
        )}
      </div>
    )
  }
}
