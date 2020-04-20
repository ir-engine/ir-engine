import React from 'react'
// @ts-ignore
import { Entity } from 'aframe-react'
import { CylindricalGrid } from '../../../classes/aframe/layout/GridUtils'

// eslint-disable-next-line no-unused-vars
import { PublicVideo } from '../../../redux/video/actions'

import getConfig from 'next/config'
const config = getConfig().publicRuntimeConfig.xr.grid
const playerHeight = getConfig().publicRuntimeConfig.xr.playerHeight

interface Props {
  linkPrefix?: string
  gridCellsPerRow?: number
  cellHeight?: number
  radius?: number
  rows?: number
  columns?: number
  media?: any
  cellWidth?: number
  cellContentHeight?: number
}
function MediaGrid(props: Props): any {
  const cylindricalGrid: CylindricalGrid = new CylindricalGrid(
    props.gridCellsPerRow ?? config.gridCellsPerRow,
    props.cellHeight ?? config.cellHeight,
    props.radius ?? config.radius,
    props.rows ?? config.rows,
    props.columns ?? config.columns
  )
  const gridRotation = () => 180 - (360 / (props.gridCellsPerRow ?? config.gridCellsPerRow)) * 2

  const gridOffsetY = () => (1 - (props.rows ?? config.rows) / 2) * (props.cellHeight ?? config.cellHeight)

  function getSource(media:any) {
    return media.thumbnail_url && media.thumbnail_url.length > 0 ? media.thumbnail_url : '#placeholder'
  }

  const gridCellRotation = (itemNum: number) => {
    const rot = cylindricalGrid.cellRotation(itemNum)
    return `${rot.x} ${rot.y + 180} ${rot.z}`
  }

  const gridCellPosition = (itemNum: number) => {
    const pos = cylindricalGrid.cellPosition(itemNum)
    return `${pos.x} ${pos.y} ${pos.z}`
  }

  const gridRotationString = (): string => '0 ' + gridRotation() + ' 0'

  const gridOffsetString = (): string =>
    '0 ' + (gridOffsetY() + playerHeight) + ' 0'

  return (
    <Entity
      class="grid-cylinder"
      rotation={gridRotationString()}
      position={gridOffsetString()}
    >
      {props.media.map((media: PublicVideo, i: number) => {
        return (
          <Entity
            key={i}
            position={gridCellPosition(i)}
            rotation={gridCellRotation(i)}
          >
            <Entity
              primitive="a-image"
              class="clickable"
              src={getSource(media)}
              width={props.cellWidth ?? config.cellWidth}
              height={props.cellContentHeight ?? config.cellContentHeight}
              events={{ click: () => { window.location.href = media.link } }}
            ></Entity>
          </Entity>
        )
      })}
    </Entity>
  )
}

export default MediaGrid
