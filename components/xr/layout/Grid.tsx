import React from 'react'
import { useRouter } from 'next/router'
// @ts-ignore
import { Entity } from 'aframe-react'
import { CylindricalGrid } from '../../../classes/aframe/layout/GridUtils'

// eslint-disable-next-line no-unused-vars
import { bindActionCreators, Dispatch } from 'redux'

import { connect } from 'react-redux'
import { selectVideoState } from '../../../redux/video/selector'
import { fetchPulicVideos } from '../../../redux/video/service'
// eslint-disable-next-line no-unused-vars
import { PublicVideo } from '../../../redux/video/actions'

import getConfig from 'next/config'
const config = getConfig().publicRuntimeConfig.xr.grid
const playerHeight = getConfig().publicRuntimeConfig.xr.playerHeight

const range = (n: number) => Array.from(Array(n).keys())
const numbers = range(config.rows * config.columns)

interface VideoProps {
  videos: any,
  fetchPublicVideos: typeof fetchPulicVideos
}

const mapStateToProps = (state: any) => {
  return {
    videos: selectVideoState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchPublicVideos: bindActionCreators(fetchPulicVideos, dispatch)
})

function GridLayout (props: VideoProps): any {
  const router = useRouter()
  const cylindricalGrid: CylindricalGrid = new CylindricalGrid(config.gridCellsPerRow, config.cellHeight,
    config.radius, config.rows, config.columns)

  function gridRotation() {
    return (180 - (360 / config.gridCellsPerRow) * 2)
  }

  function gridOffsetY() {
    console.log((1 - config.rows / 2) * config.cellHeight)
    return (1 - config.rows / 2) * config.cellHeight
  }

  function gridCellRotation (itemNum: number) {
    const rot = cylindricalGrid.cellRotation(itemNum)
    return `${rot.x} ${rot.y + 180} ${rot.z}`
  }

  function gridCellPosition (itemNum: number) {
    const pos = cylindricalGrid.cellPosition(itemNum)
    return `${pos.x} ${pos.y} ${pos.z}`
  }

  function gridRotationString (): string {
    return '0 ' + gridRotation() + ' 0'
  }

  function gridOffsetString (): string {
    return '0 ' + (gridOffsetY() + playerHeight) + ' 0'
  }

  function followLink(link: any) {
    router.push('/video360?manifest=' + link)
  }

  const { videos } = props
  console.log(videos.get('videos'))

  return (videos.get('videos').size > 0
    ? <Entity
      class="grid-cylinder"
      rotation={gridRotationString()}
      position={gridOffsetString()}>
      {videos.get('videos').map(function (video: PublicVideo, i: number) {
        const cb = followLink.bind(video.link)
        return (
          <Entity key= {i}
            position={ gridCellPosition(i) }
            rotation={ gridCellRotation(i) }>
            <Entity
              primitive="a-image"
              class='clickable'
              src="#placeholder"
              width={ config.cellWidth }
              height={ config.cellContentHeight }
              events={{ click: cb } }>
            </Entity>
          </Entity>
        )
      })}
    </Entity>
    : <Entity
      class="grid-cylinder"
      rotation={gridRotationString()}
      position={gridOffsetString()}>
      {numbers.map(function (i: number) {
        return (
          <Entity key= {i}
            position={ gridCellPosition(i) }
            rotation={ gridCellRotation(i) }>
            <Entity
              primitive="a-image"
              class='clickable'
              src="#placeholder"
              width={ config.cellWidth }
              height={ config.cellContentHeight }>
            </Entity>
          </Entity>
        )
      })}
    </Entity>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GridLayout)
