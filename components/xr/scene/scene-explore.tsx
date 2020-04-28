import React, { useEffect } from 'react'
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

// eslint-disable-next-line no-unused-vars
import { bindActionCreators, Dispatch } from 'redux'

import { connect } from 'react-redux'
import { selectVideoState } from '../../../redux/video/selector'
import { fetchPublicVideos } from '../../../redux/video/service'

interface VideoProps {
  videos: any,
  fetchPublicVideos: typeof fetchPublicVideos
}

const mapStateToProps = (state: any) => {
  return {
    videos: selectVideoState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchPublicVideos: bindActionCreators(fetchPublicVideos, dispatch)
})

function ExploreScene (props: VideoProps): any {
  const { videos, fetchPublicVideos } = props

  useEffect(() => {
    if (videos.get('videos').size === 0) {
      fetchPublicVideos()
    }
  })
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
          rows={5}
          colunns={6}>

          {videos.get('videos').map(function (video: PublicVideo, i: number) {
            return (
              <Entity
                key={i}
                primitive="a-media-cell"
                // original-title={video.original_title}
                title={video.name}
                description={video.description}
                media-url={video.url}
                thumbnail-url={video.metadata.thumbnail_url}
                // production-credit={video.production_credit}
                // rating={video.rating}
                // categories={video.categories}
                // runtime={video.runtime}
                // tags={video.tags}
                cellHeight={0.6666}
                cellWidth={1}
                cellContentHeight={0.5}
                mediatype="video360"
                videoformat={video.metadata['360_format']}
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExploreScene)
