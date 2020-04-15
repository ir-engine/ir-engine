import React from 'react'
// @ts-ignore
import { Scene, Entity } from 'aframe-react'
import Assets from './assets'
import Grid from '../layout/Grid'
import Skybox from './skybox-grid'
import './index.scss'
import dynamic from 'next/dynamic'

import getConfig from 'next/config'
const config = getConfig().publicRuntimeConfig.xr['networked-scene']

const AframeComponentRegisterer = dynamic(() => import('../aframe/index'), {
  ssr: false
})

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
        <AframeComponentRegisterer/>
        {this.state.appRendered && (
          <Scene
            networked-scene={config}
            class="scene"
            renderer="antialias: true"
            background="color: #FAFAFA"
            embedded
          >
            <Assets/>
            <Grid/>
            <Skybox/>
            <Entity
              player="fuseCursor: true"/>
          </Scene>
        )}
      </div>
    )
  }
}
