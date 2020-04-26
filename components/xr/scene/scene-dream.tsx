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
                original-title={video.original_title}
                title={video.title}
                description={video.description}
                media-link={video.link}
                thumbnail-url={video.thumbnail_url}
                production-credit={video.production_credit}
                rating={video.rating}
                categories={video.categories}
                runtime={video.runtime}
                tags={video.tags}
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
