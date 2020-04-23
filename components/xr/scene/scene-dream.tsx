import React from 'react'
// @ts-ignore
import { Scene, Entity } from 'aframe-react'
import Assets from './assets'
import Environment from './environment'
import Player from '../player/player'
import './style.scss'
import SvgVr from '../../icons/svg/Vr'

import { PublicVideo } from '../../../redux/video/actions'

// import getConfig from 'next/config'
import MediaGrid from '../layout/MediaGrid'
import AframeComponentRegisterer from '../aframe/index'
// const config = getConfig().publicRuntimeConfig.xr['networked-scene']

type State = {
  appRendered?: boolean
  color?: string
}

export default class NetworkedScene extends React.Component<State> {
  state: State = {
    appRendered: false,
    color: 'red'
  }

  media: PublicVideo[] = [{
    id: 0,
    original_title: 'Launchpad',
    title: 'Launchpad',
    description: 'Launchpad',
    link: 'https://kaixr.world/8c2oV4s/launchpad',
    thumbnail_url: '/temp_thumbnails/launchpad.jpg',
    production_credit: '',
    rating: 'G',
    categories: '',
    runtime: '',
    tags: ''
  },
  {
    id: 0,
    original_title: 'Microworld',
    title: 'Microworld',
    description: 'Microworld',
    link: 'https://kaixr.world/9NWSBXQ/microworld',
    thumbnail_url: '/temp_thumbnails/microworld.jpg',
    production_credit: '',
    rating: 'G',
    categories: '',
    runtime: '',
    tags: ''
  },
  {
    id: 0,
    original_title: 'Basketball',
    title: 'Basketball',
    description: 'Basketball',
    link: 'https://kaixr.world/UdqF5bz/basketball-stadium',
    thumbnail_url: '/temp_thumbnails/basketballstadium.jpg',
    production_credit: '',
    rating: 'G',
    categories: '',
    runtime: '',
    tags: ''
  },
  {
    id: 0,
    original_title: 'Underwater',
    title: 'Underwater',
    description: 'Underwater',
    link: 'https://kaixr.world/qFQa2ho/underwater',
    thumbnail_url: '/temp_thumbnails/underwater.jpg',
    production_credit: '',
    rating: 'G',
    categories: '',
    runtime: '',
    tags: ''
  },
  {
    id: 0,
    original_title: 'Fairytale Castle',
    title: 'Fairytale Castle',
    description: 'Fairytale Castle',
    link: 'https://kaixr.world/ACfGWd5/fairytale-castle',
    thumbnail_url: '/temp_thumbnails/fairytalecastle.jpg',
    production_credit: '',
    rating: 'G',
    categories: '',
    runtime: '',
    tags: ''
  },
  {
    id: 0,
    original_title: 'Solar System',
    title: 'Solar System',
    description: 'Solar System',
    link: 'https://kaixr.world/k2KFMXu/solar-system',
    thumbnail_url: '/temp_thumbnails/solarsystem.jpg',
    production_credit: '',
    rating: 'G',
    categories: '',
    runtime: '',
    tags: ''
  },
  {
    id: 0,
    original_title: 'Deserted Island',
    title: 'Deserted Island',
    description: 'Deserted Island',
    link: 'https://kaixr.world/wZMeRi2/a-deserted-island',
    thumbnail_url: '/temp_thumbnails/desertedisland.jpg',
    production_credit: '',
    rating: 'G',
    categories: '',
    runtime: '',
    tags: ''
  },
  {
    id: 0,
    original_title: 'Wide Open Space',
    title: 'Wide Open Space',
    description: 'Wide Open Space',
    link: 'https://kaixr.world/P3PJZbZ/wide-open-space',
    thumbnail_url: '/temp_thumbnails/wideopenspace.jpg',
    production_credit: '',
    rating: 'G',
    categories: '',
    runtime: '',
    tags: ''
  }]

  componentDidMount() {
    if (typeof window !== 'undefined') {
      require('aframe')
      // require('networked-aframe')
      this.setState({ appRendered: true })
    }
  }

  render() {
    return (
      <div style={{ height: '100%', width: '100%' }}>
        {this.state.appRendered && (
          <a-scene
            vr-mode-ui="enterVRButton: #enterVRButton"
            loading-screen="dotsColor: red; backgroundColor: black"
            // networked-scene={config}
            className="scene"
            renderer="antialias: true"
          >
            <AframeComponentRegisterer />
            <Entity position="0 0.0 0">
              <MediaGrid linkPrefix="" media={this.media} cellContentHeight=".66666" />
              {/* "gridCellsPerRow": 20,
        "cellWidth": 1,
        "cellHeight": 1.2,
        "cellContentHeight": 1,
        "radius": 4,
        "rows": 3,
        "columns": 5 */}
            </Entity>
            <Assets />
            <Player />
            <Environment />
            <a className="enterVR" id="enterVRButton" href="#">
              <SvgVr className="enterVR" />
            </a>
          </a-scene>
        )}
      </div>
    )
  }
}
