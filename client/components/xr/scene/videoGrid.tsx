import React, { useEffect, useState } from 'react'
import { Entity } from 'aframe-react'
import './style.scss'

import { PublicVideo } from '../../../redux/video/actions'

import { bindActionCreators, Dispatch } from 'redux'

import { connect } from 'react-redux'
import { selectVideoState } from '../../../redux/video/selector'
import { fetchPublicVideos } from '../../../redux/video/service'

import getConfig from 'next/config'
const config = getConfig().publicRuntimeConfig.xr.videoGrid
const style = getConfig().publicRuntimeConfig.xr.style
const borderColor = Number(style.borderColor)
const hoverColor = Number(style.hoverColor)
const activeColor = Number(style.activeColor)

const contentHeight: number = config.contentHeight
const contentWidth: number = config.contentWidth
const borderSize: number = config.borderSize
const cellMargin: number = config.cellMargin

const cellHeight: number = contentHeight + borderSize + cellMargin
const cellWidth: number = contentWidth + borderSize + cellMargin

const rows: number = config.rows
const columns: number = config.columns

const x: number = config.offset.x
const y: number = config.offset.y
const z: number = config.offset.z
const pos = `${x} ${2} ${z}`
console.log(y)
const sx: number = config.scale.x
const sy: number = config.scale.y
const sz: number = config.scale.z
const scale = `${sx} ${sy} ${sz}`
console.log(scale)

const fx: number = config.focusedOffset.x
const fy: number = config.focusedOffset.y
const fz: number = config.focusedOffset.z
const fpos = `${fx} ${fy} ${fz}`

interface VideoProps {
  videos?: any
  fetchPublicVideos?: typeof fetchPublicVideos
}

interface CellData {
  title: string
  description: string
  videoformat: string
  mediaUrl: string
  thumbnailUrl: string
  productionCredit: string
  rating: string
  categories: string[]
  runtime: string
}

interface VideoGridState {
  focusedCellEl: HTMLElement | null
  focusedCell: CellData | null
}

const mapStateToProps = (state: any): any => {
  return {
    videos: selectVideoState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  fetchPublicVideos: bindActionCreators(fetchPublicVideos, dispatch)
})

const VideoGridScene = (props: VideoProps): any => {
  const { videos, fetchPublicVideos } = props
  const [videosArr, setVideosArr] = useState([])
  const [videoGridState, setVideoGridState] = useState<VideoGridState>({ focusedCellEl: null, focusedCell: null })
  const [pageOffset, setPageOffset] = useState(0)
  const [visitedPages, setVisitedPages] = useState([])

  const focusCell = (event: any): any => {
    const focusCellEl = event.target.parentEl
    event.stopPropagation()
    setVideoGridState({
      focusedCellEl: focusCellEl,
      focusedCell: {
        title: (focusCellEl.attributes).title.value,
        description: (focusCellEl.attributes).description?.value,
        videoformat: (focusCellEl.attributes).videoformat?.value,
        mediaUrl: (focusCellEl.attributes)['media-url'].value,
        thumbnailUrl: (focusCellEl.attributes)['thumbnail-url'].value,
        productionCredit: (focusCellEl.attributes)['production-credit'].value,
        rating: (focusCellEl.attributes).rating?.value,
        categories: (focusCellEl.attributes).categories?.value,
        runtime: (focusCellEl.attributes).runtime.value
      }
    })
  }

  const unFocusCell = (): void => {
    setVideoGridState({ focusedCellEl: null, focusedCell: null })
  }

  useEffect(() => {
    // if this page was not visited before, fetch videos for next pages
    if (!visitedPages.find(visitedPageOffset => visitedPageOffset === pageOffset)) {
      fetchPublicVideos(pageOffset)
    }
  }, [visitedPages, pageOffset])

  useEffect(() => {
    document.addEventListener('backbutton', unFocusCell)
    return () => {
      document.removeEventListener('backbutton', unFocusCell)
    }
  }, [unFocusCell])

  const pageLeftHandler = (): void => {
    setPageOffset(pageOffset - 1)
  }
  // only loading videos on right handler, because you start on page 0
  const pageRightHandler = (): void => {
    const nextPage = pageOffset + 1
    // if next page has not been visited before, fetch videos for the page
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
    <Entity>
      <Entity
        primitive="a-gltf-model"
        src={`#${config['scene-gltf'].name as string}`}
      />
      <Entity
        position={pos}>
        { videosArr.length && videoGridState.focusedCellEl === null &&
        <Entity
          id="videoGrid-grid"
          class="grid"
          primitive="a-grid"
          rows={rows}
          columns={columns}
          cell-height={cellHeight}
          cell-width={cellWidth}
          grid-shape="rectangle"
          back-ground={true}>

          {videosArr.map((video: PublicVideo, i: number) => {
            return (
              <Entity
                key={i}
                // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                id={'videoGrid-cell-' + i}
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
                content-height={contentHeight}
                content-width={contentWidth}
                border-size={borderSize}
                mediatype="video360"
                videoformat={video.metadata['360_format']}
                link-enabled={false}
                high-light={true}
                border-color={borderColor}
                hover-color={hoverColor}
                active-color={activeColor}
                class="clickable"
                events={{
                  click: focusCell
                }}
              />
            )
          })}
        </Entity>
        }
        { videoGridState.focusedCellEl !== null &&
          <Entity
            position={fpos}>
            <Entity
              id="focused-cell"
              primitive="a-video-details"
              mediatype="video360"
              title={videoGridState.focusedCell?.title}
              description={videoGridState.focusedCell?.description}
              videoformat={videoGridState.focusedCell?.videoformat}
              media-url={videoGridState.focusedCell?.mediaUrl}
              thumbnail-url={videoGridState.focusedCell?.thumbnailUrl}
              production-credit={videoGridState.focusedCell?.productionCredit}
              rating={videoGridState.focusedCell?.rating}
              categories={videoGridState.focusedCell?.categories}
              runtime={videoGridState.focusedCell?.runtime}
              cell-height={cellHeight}
              cell-width={cellWidth}
              details-width={cellWidth * 2}
              content-height={contentHeight}
              class="clickable" />
          </Entity>
        }
      </Entity>
    </Entity>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VideoGridScene)
