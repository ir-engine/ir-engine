import React from 'react'
// @ts-ignore
import { Scene } from 'aframe-react'
import Landing from './landing'
import Assets from './assets'
import './index.scss'

import dynamic from 'next/dynamic'

const AframeComponentRegisterer = dynamic(() => import('../aframe/index'), {
  ssr: false
})

type State = {
  appRendered?: boolean
  color?: string
}

export default class LandingScene extends React.Component<State> {
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
        <AframeComponentRegisterer/>
        {typeof window !== 'undefined' && (
          <Scene
            class="scene"
            renderer="antialias: true"
            background="color: #FAFAFA"
          >
            <Assets/>
            <Landing/>
          </Scene>
        )}
      </div>
    )
  }
}
