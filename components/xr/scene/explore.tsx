import React, { useEffect, useState } from 'react'
import { Entity } from 'aframe-react'
import './style.scss'

import { PublicVideo } from '../../../redux/video/actions'

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

const ExploreScene = (props: VideoProps): any => {
  const { videos, fetchPublicVideos } = props
  const [videosArr, setVideosArr] = useState([])
  const [exploreState, setExploreState] = useState<ExploreState>({ focusedCellEl: null, focusedCell: null })
  const [pageOffset, setPageOffset] = useState(0)
  const [visitedPages, setVisitedPages] = useState([0])

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

  useEffect(() => {
    if (videos.get('videos').size === 0) {
      fetchPublicVideos()
    }
  }, [videos])

  useEffect(() => {
    document.addEventListener('backbutton', unFocusCell)
    return () => {
      document.removeEventListener('backbutton', unFocusCell)
    }
  }, [unFocusCell])

  const pageLeftHandler = () => {
    setPageOffset(pageOffset - 1)
  }
  // only loading videos on right handler, because you start on page 0
  const pageRightHandler = () => {
    const nextPage = pageOffset + 1
    // if next page has not been visited before, fetch videos for the page
    if (!visitedPages.find(pageOffset => pageOffset === nextPage)) {
      fetchPublicVideos()
    }
    setPageOffset(nextPage)
    setVisitedPages(pages => Array.from(new Set([...pages, nextPage])))
  }
  useEffect(() => {
    document.addEventListener('pageleft', pageLeftHandler)
    document.addEventListener('pageright', pageRightHandler)
    return () => {
      document.removeEventListener('pageleft', pageLeftHandler)
      document.removeEventListener('pageright', pageRightHandler)
    }
  }, [pageOffset, visitedPages])
  useEffect(() => {
    setVideosArr(videos.get('videos'))
  }, [videos, pageOffset])

  // grid entity doesn't adapt to changes in children.length, so only place grid when there are videos so the right pagination shows
  // TODO: possible more robust solution is use MutationObserver to look for changes in children of grid el
  return (
    <Entity position="0 1.6 0">
      { videosArr.length && exploreState.focusedCellEl === null &&
        <Entity
          id="explore-grid"
          class="grid"
          primitive="a-grid"
          rows={3}
          columns={5}>

          {videosArr.map((video: PublicVideo, i: number) => {
            return (
              <Entity
                key={i}
                id={'explore-cell-' + i}
                primitive="a-media-cell"
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
              />
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
              class="clickable" />
          </Entity>
      }
    </Entity>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExploreScene)
