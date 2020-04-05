import React from 'react'
// @ts-ignore
import { Entity, Scene } from 'aframe-react'

import Assets from './assets'
import SceneObjects from './scene-objects'

type State = {
  appRendered?: boolean
  color?: string
}

export default class LocalScene extends React.Component<State> {
  state: State = {
    appRendered: false,
    color: 'red'
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      require('aframe')
      require('aframe-particle-system-component')
      this.setState({ appRendered: true })
    }
  }

  render() {
    return (
      <div style={{ height: '100%', width: '100%' }}>
        {this.state.appRendered && (
          <Scene>
            <a-assets>
              <img
                id="groundTexture"
                src="https://cdn.aframe.io/a-painter/images/floor.jpg"
              />
              <img
                id="skyTexture"
                src="https://cdn.aframe.io/a-painter/images/sky.jpg"
              />
            </a-assets>

            <Assets/>
            <SceneObjects/>

            <Entity primitive="a-camera">
              <Entity
                primitive="a-cursor"
                animation__click={{
                  property: 'scale',
                  startEvents: 'click',
                  from: '0.1 0.1 0.1',
                  to: '1 1 1',
                  dur: 150
                }}
              />
            </Entity>
          </Scene>
        )}
      </div>
    )
  }
}
