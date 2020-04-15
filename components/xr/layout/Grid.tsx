import React from 'react'
import { useRouter } from 'next/router'
// @ts-ignore
import { Entity } from 'aframe-react'
import { CylindricalGrid } from '../../../classes/aframe/layout/GridUtils'

import getConfig from 'next/config'
const config = getConfig().publicRuntimeConfig.xr.grid
const playerHeight = getConfig().publicRuntimeConfig.xr.playerHeight

const range = (n: number) => Array.from(Array(n).keys())
const numbers = range(config.rows * config.columns)

function GridLayout () {
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

  function followLink() {
    console.log('image clicked!')
    router.push('/video360?manifest=%2Fvideo360%2Fstone%2Fstream.mpd')
  }

  function Grid(props: any) {
    const numbers = props.numbers

    const gridItems = numbers.map((number: number) =>
      <Entity key={number.toString()}
        position={ gridCellPosition(number) }
        rotation={ gridCellRotation(number) }>
        <Entity
          primitive="a-image"
          class='clickable'
          src="#placeholder"
          width={ config.cellWidth }
          height={ config.cellContentHeight }
          events={{ click: followLink } }>
        </Entity>
      </Entity>
    )
    return gridItems
  }

  return (
    <Entity
      class="grid-cylinder"
      rotation={gridRotationString()}
      position={gridOffsetString()}>

      { Grid({ numbers: numbers }) }

    </Entity>
  )
}

export default GridLayout
