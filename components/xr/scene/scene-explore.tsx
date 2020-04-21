import React from 'react'
// @ts-ignore
import { Scene, Entity } from 'aframe-react'
import Assets from './assets'
import Environment from './environment'
import Player from '../player/player'
import './index.scss'
import SvgVr from '../../icons/svg/Vr'

import { PublicVideo } from '../../../redux/video/actions'

import AframeComponentRegisterer from '../aframe/index'

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
    thumbnail_url: 'https://kaixrworld-nearspark.kaixr.world/thumbnail/aHR0cHM6Ly9rYWl4cndvcmxkLWFzc2V0cy5rYWl4ci53b3JsZC9maWxlcy9lZGM3ZDkwYy03ZWZkLTRmZDItYjE3ZS1mYTYzMTRlMmQ5YjguanBn.jpg?w=355&h=200',
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
    thumbnail_url: 'https://kaixrworld-nearspark.kaixr.world/thumbnail/aHR0cHM6Ly9rYWl4cndvcmxkLWFzc2V0cy5rYWl4ci53b3JsZC9maWxlcy80NDJiNjhjMC0wY2UwLTRjYWMtOWJhOS1jN2M0N2FlNDQxYTEuanBn.jpg?w=355&h=200',
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
    link: 'https://kaixr.world/8c2oV4s/launchpad',
    thumbnail_url: 'https://kaixrworld-nearspark.kaixr.world/thumbnail/aHR0cHM6Ly9rYWl4cndvcmxkLWFzc2V0cy5rYWl4ci53b3JsZC9maWxlcy84MjE2MzExMS1iYmI0LTQ3MzYtOTBkMS03NjhkNGM3YmI5MzcuanBn.jpg?w=355&h=200',
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
    thumbnail_url: 'https://kaixrworld-nearspark.kaixr.world/thumbnail/aHR0cHM6Ly9rYWl4cndvcmxkLWFzc2V0cy5rYWl4ci53b3JsZC9maWxlcy9jOTYxM2E3Mi0yM2YxLTQzYWYtODRlZi1hZDU3YTU5NGU1ZjAuanBn.jpg?w=355&h=200',
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
    thumbnail_url: 'https://kaixrworld-nearspark.kaixr.world/thumbnail/aHR0cHM6Ly9rYWl4cndvcmxkLWFzc2V0cy5rYWl4ci53b3JsZC9maWxlcy81MjY1N2ExOC1lZTk3LTQ1NDYtOTg3YS1kNzZiOWQ3OTU4MDEuanBn.jpg?w=355&h=200',
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
    thumbnail_url: 'https://kaixrworld-nearspark.kaixr.world/thumbnail/aHR0cHM6Ly9rYWl4cndvcmxkLWFzc2V0cy5rYWl4ci53b3JsZC9maWxlcy9iODcyMDcwMS1kZGUxLTRkNjctYTY2MS04MDg0YjgzYWJhZWMuanBn.jpg?w=355&h=200',
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
    thumbnail_url: 'https://kaixrworld-nearspark.kaixr.world/thumbnail/aHR0cHM6Ly9rYWl4cndvcmxkLWFzc2V0cy5rYWl4ci53b3JsZC9maWxlcy83YjIxZjk4My0wMDM5LTRmODgtYWUzZS03MTZjZWM0ZjFjYmUuanBn.jpg?w=355&h=200',
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
    thumbnail_url: 'https://kaixrworld-nearspark.kaixr.world/thumbnail/aHR0cHM6Ly9rYWl4cndvcmxkLWFzc2V0cy5rYWl4ci53b3JsZC9maWxlcy80OTU3ZWFjOS1mMjQ4LTRiMTYtYjViOC1kYWJjYzg5MTcyMzQuanBn.jpg?w=355&h=200',
    production_credit: '',
    rating: 'G',
    categories: '',
    runtime: '',
    tags: ''
  }]

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
            vr-mode-ui="enterVRButton: #enterVRButton"
            class="scene"
            renderer="antialias: true"
            background="color: #FAFAFA"
          >
            <AframeComponentRegisterer />
            <Entity position="0 1.6 0">
              <Entity
                primitive="a-grid">

                {this.media.map((media: PublicVideo, i: number) => {
                  return (
                    <Entity
                      key={i}
                      primitive="a-media-cell"
                      original-title={media.original_title}
                      title={media.title}
                      description={media.description}
                      media-link={media.link}
                      thumbnail-url={media.thumbnail_url}
                      production-credit={media.production_credit}
                      rating={media.rating}
                      categories={media.categories}
                      runtime={media.runtime}
                      tags={media.tags}
                      cellHeight={0.6666}
                      cellWidth={1}
                      cellContentHeight={0.5}
                    ></Entity>
                  )
                })}

              </Entity>
            </Entity>
            <Assets />
            <Player />
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
