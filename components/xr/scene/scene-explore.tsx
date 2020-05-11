import React, { useEffect, useState } from 'react'
// @ts-ignore
import { Scene, Entity } from 'aframe-react'
import Assets from './assets'
import Environment from './environment'
import Player from '../player/player'
import './style.scss'
import SvgVr from '../../icons/svg/Vr'

import { PublicVideo } from '../../../redux/video/actions'

import AframeComponentRegisterer from '../aframe/index'

import { bindActionCreators, Dispatch } from 'redux'

import { connect } from 'react-redux'
import { selectVideoState } from '../../../redux/video/selector'
import { fetchPublicVideos } from '../../../redux/video/service'

interface VideoProps {
  videos: any,
  fetchPublicVideos: typeof fetchPublicVideos
}

interface CellData {
  title: string,
  description: string,
  videoformat: string,
  mediaUrl: string,
  thumbnailUrl: string,
  productionCredit: string,
  rating: string,
  categories: string[],
  runtime: string
}

interface ExploreState {
  focusedCellEl: HTMLElement | null,
  focusedCell: CellData | null
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

  const [exploreState, setExploreState] = useState<ExploreState>({ focusedCellEl: null, focusedCell: null })

  const focusCell = (event: any) => {
    const focusCellEl = event.target.parentEl
    setExploreState({
      focusedCellEl: focusCellEl,
      focusedCell: {
        title: (focusCellEl.attributes as any).title.value,
        description: (focusCellEl.attributes as any).description.value,
        videoformat: (focusCellEl.attributes as any).videoformat.value,
        mediaUrl: (focusCellEl.attributes as any)['media-url'].value,
        thumbnailUrl: (focusCellEl.attributes as any)['thumbnail-url'].value,
        productionCredit: (focusCellEl.attributes as any)['production-credit'].value,
        rating: (focusCellEl.attributes as any).rating.value,
        categories: (focusCellEl.attributes as any).categories.value,
        runtime: (focusCellEl.attributes as any).runtime.value
      }
    })
  }

  const unFocusCell = () => {
    setExploreState({ focusedCellEl: null, focusedCell: null })
  }

  const watchVideo = () => {
    if (exploreState.focusedCellEl === null) return
    const url = exploreState.focusedCell?.mediaUrl
    const title = exploreState.focusedCell?.title
    const videoformat = exploreState.focusedCell?.videoformat
    window.location.href = 'video360?manifest=' + url +
      '&title=' + title +
      // '&runtime=' + runtime +
      // '&credit=' + productionCredit +
      // '&rating=' + rating +
      // '&categories=' categories.join(',') +
      // '&tags=' + tags.join(',') +
      '&videoformat=' + videoformat
  }

  const pageLeft = () => {
    const grids = document.querySelectorAll('.grid')
    grids[0].dispatchEvent(new Event('pageleft'))
  }

  const pageRight = () => {
    const grids = document.querySelectorAll('.grid')
    grids[0].dispatchEvent(new Event('pageright'))
  }

  useEffect(() => {
    if (videos.get('videos').size === 0) {
      fetchPublicVideos()
    }
    document.addEventListener('pageleft', pageLeft)
    document.addEventListener('pageright', pageRight)
    document.addEventListener('watchbutton', watchVideo)
    document.addEventListener('backbutton', unFocusCell)
    return () => {
      document.removeEventListener('pageleft', pageLeft)
      document.removeEventListener('pageright', pageRight)
      document.removeEventListener('watchbutton', watchVideo)
      document.removeEventListener('backbutton', unFocusCell)
    }
  }, [watchVideo, unFocusCell])

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
          id="leftarrow"
          position="-3 0 -6"
          primitive="a-arrow"
          direction="left"
          width={0.35}
          height={0.2}
          clickable="clickevent: pageleft"
          highlight={{
            type: 'color',
            borderbaseopacity: 0.7,
            disabledopacity: 0.2,
            color: 0xe8f1ff
          }}
        />
        <Entity
          id="rightarrow"
          position="3 0 -6"
          primitive="a-arrow"
          direction="right"
          width={0.35}
          height={0.2}
          clickable="clickevent: pageright"
          highlight={{
            type: 'color',
            borderbaseopacity: 0.7,
            disabledopacity: 0.2,
            color: 0xe8f1ff
          }}
        />
        { exploreState.focusedCellEl === null &&
        <Entity
          class="grid"
          primitive="a-grid"
          rows={3}
          colunns={5}
          page={0}
          pages={2}
          numberOfCells={15}>

          {videos.get('videos').map(function (video: PublicVideo, i: number) {
            return (
              <Entity
                key={i}
                id={'explore-cell-' + i}
                primitive="a-media-cell"
                // original-title={video.original_title}
                title={video.name}
                description={video.description}
                media-url={video.url}
                thumbnail-url={video.metadata.thumbnail_url || '#placeholder'}
                production-credit={video.attribution?.creator}
                rating={video.metadata.rating}
                categories={video.metadata.categories}
                runtime={video.metadata.runtime}
                // tags={video.tags}
                cellHeight={0.6666}
                cellWidth={1}
                cellContentHeight={0.5}
                mediatype="video360"
                videoformat={video.metadata['360_format']}
                link-enabled={false}
                class="clickable"
                events={{
                  click: focusCell
                }}
              ></Entity>
            )
          })}
        </Entity>
        }
        { exploreState.focusedCellEl !== null &&
          <Entity
            position="0 0 -6">
            <Entity
              id="focused-cell"
              primitive="a-video-details"
              mediatype="video360"
              title={exploreState.focusedCell?.title}
              description={exploreState.focusedCell?.description}
              videoformat={exploreState.focusedCell?.videoformat}
              media-url={exploreState.focusedCell?.mediaUrl}
              thumbnail-url={exploreState.focusedCell?.thumbnailUrl}
              production-credit={exploreState.focusedCell?.productionCredit}
              rating={exploreState.focusedCell?.rating}
              categories={exploreState.focusedCell?.categories}
              runtime={exploreState.focusedCell?.runtime}
              class="clickable">
            </Entity>
          </Entity>
        }
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
