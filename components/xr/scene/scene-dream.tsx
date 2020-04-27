import React from 'react'
// @ts-ignore
import { Scene, Entity } from 'aframe-react'
import Assets from './assets'
import Environment from './environment'
import Player from '../player/player'
import './style.scss'
import SvgVr from '../../icons/svg/Vr'

// eslint-disable-next-line no-unused-vars
import { PublicVideo } from '../../../redux/video/actions'

import AframeComponentRegisterer from '../aframe/index'

const media: PublicVideo[] = [{
  id: 0,
  // original_title: 'Launchpad',
  name: 'Launchpad',
  description: 'Launchpad',
  url: 'https://kaixr.world/8c2oV4s/launchpad',
  metadata: {
    thumbnail_url: '/temp_thumbnails/launchpad.jpg'
  }
  // production_credit: '',
  // rating: 'G',
  // categories: '',
  // runtime: '',
  // tags: ''
},
{
  id: 0,
  // original_title: 'Microworld',
  name: 'Microworld',
  description: 'Microworld',
  url: 'https://kaixr.world/9NWSBXQ/microworld',
  metadata: {
    thumbnail_url: '/temp_thumbnails/microworld.jpg'
  }
  // production_credit: '',
  // rating: 'G',
  // categories: '',
  // runtime: '',
  // tags: ''
},
{
  id: 0,
  // original_title: 'Basketball',
  name: 'Basketball',
  description: 'Basketball',
  url: 'https://kaixr.world/UdqF5bz/basketball-stadium',
  metadata: {
    thumbnail_url: '/temp_thumbnails/basketballstadium.jpg'
  }
  // production_credit: '',
  // rating: 'G',
  // categories: '',
  // runtime: '',
  // tags: ''
},
{
  id: 0,
  // original_title: 'Underwater',
  name: 'Underwater',
  description: 'Underwater',
  url: 'https://kaixr.world/qFQa2ho/underwater',
  metadata: {
    thumbnail_url: '/temp_thumbnails/underwater.jpg'
  }
  // original_title: '',
  // rating: 'G',
  // categories: '',
  // runtime: '',
  // tags: ''
},
{
  id: 0,
  // original_title: 'Fairytale Castle',
  name: 'Fairytale Castle',
  description: 'Fairytale Castle',
  url: 'https://kaixr.world/ACfGWd5/fairytale-castle',
  metadata: {
    thumbnail_url: '/temp_thumbnails/fairytalecastle.jpg'
  }
  // production_credit: '',
  // rating: 'G',
  // categories: '',
  // runtime: '',
  // tags: ''
},
{
  id: 0,
  // original_title: 'Solar System',
  name: 'Solar System',
  description: 'Solar System',
  url: 'https://kaixr.world/k2KFMXu/solar-system',
  metadata: {
    thumbnail_url: '/temp_thumbnails/solarsystem.jpg'
  }
  // production_credit: '',
  // rating: 'G',
  // categories: '',
  // runtime: '',
  // tags: ''
},
{
  id: 0,
  // original_title: 'Deserted Island',
  name: 'Deserted Island',
  description: 'Deserted Island',
  url: 'https://kaixr.world/wZMeRi2/a-deserted-island',
  metadata: {
    thumbnail_url: '/temp_thumbnails/desertedisland.jpg'
  }
  // production_credit: '',
  // rating: 'G',
  // categories: '',
  // runtime: '',
  // tags: ''
},
{
  id: 0,
  // original_title: 'Wide Open Space',
  name: 'Wide Open Space',
  description: 'Wide Open Space',
  url: 'https://kaixr.world/P3PJZbZ/wide-open-space',
  metadata: {
    thumbnail_url: '/temp_thumbnails/wideopenspace.jpg'
  }
  // production_credit: '',
  // rating: 'G',
  // categories: '',
  // runtime: '',
  // tags: ''
}]

export default function DreamScene (): any {
  return (
    <Scene
      vr-mode-ui="enterVRButton: #enterVRButton"
      class="scene"
      renderer="antialias: true"
      background="color: #FAFAFA"
    >
      <AframeComponentRegisterer />
      <Entity position="0 1.6 0">
        <Entity
          primitive="a-grid"
          rows={3}>
          {media.map((video: any, i: number) => {
            return (
              <Entity
                key={i}
                primitive="a-media-cell"
                // original-title={video.original_title}
                title={video.name}
                description={video.description}
                media-url={video.url}
                // thumbnail-url={video.thumbnail_url}
                // production-credit={video.production_credit}
                // rating={video.rating}
                // categories={video.categories}
                // runtime={video.runtime}
                // tags={video.tags}
                cellHeight={0.6666}
                cellWidth={1}
                cellContentHeight={0.5}
                mediatype="scene"
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
  )
}
