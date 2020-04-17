import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
// @ts-ignore
import { Entity } from 'aframe-react'
import { CylindricalGrid } from '../../../classes/aframe/layout/GridUtils'

// eslint-disable-next-line no-unused-vars
import { bindActionCreators, Dispatch } from 'redux'

import { connect } from 'react-redux'
import { selectVideoState } from '../../../redux/video/selector'
import { fetchPublicVideos } from '../../../redux/video/service'
// eslint-disable-next-line no-unused-vars
import { PublicVideo } from '../../../redux/video/actions'

import getConfig from 'next/config'
const config = getConfig().publicRuntimeConfig.xr.grid
const playerHeight = getConfig().publicRuntimeConfig.xr.playerHeight

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

  function followLink(link: string, title: string) {
    router.push('/video360?manifest=' + link + '&title=' + title)
  }

  function getSource(video:any) {
    return video.thumbnail_url && video.thumbnail_url.length > 0 ? video.thumbnail_url : '#placeholder'
  }

  const { videos, fetchPublicVideos } = props

  useEffect(() => {
    if (videos.get('videos').size === 0) {
      fetchPublicVideos()
    }
  })

  return ( <Entity
          class="grid-cylinder"
          rotation={gridRotationString()}
          position={gridOffsetString()}>
        {videos.get('videos').map(function (video: PublicVideo, i: number) {
          const cb = function() {
            followLink(video.link, video.title)
          }
          return (
              <Entity key= {i}
                      position={ gridCellPosition(i) }
                      rotation={ gridCellRotation(i) }>
                <Entity
                    primitive="a-image"
                    class='clickable'
                    src={ getSource(video) }
                    width={ config.cellWidth }
                    height={ config.cellContentHeight }
                    events={{ click: cb } }>
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
