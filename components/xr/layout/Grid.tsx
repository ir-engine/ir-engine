import React from 'react'
// @ts-ignore
import { Entity } from 'aframe-react'
import { CylindricalGrid } from '../../../classes/aframe/layout/GridUtils'

import getConfig from 'next/config'
const config = getConfig().publicRuntimeConfig.xr.grid
const playerHeight = getConfig().publicRuntimeConfig.xr.playerHeight

const range = (n: number) => Array.from(Array(n).keys())
const numbers = range(config.rows * config.columns)

export default class GridLayout extends React.Component {
  cylindricalGrid: CylindricalGrid

  constructor(props: any) {
    super(props)
    this.cylindricalGrid = new CylindricalGrid(config.gridCellsPerRow, config.cellHeight,
      config.radius, config.rows, config.columns)

    this.gridRotation = this.gridRotation.bind(this)
    this.gridOffsetY = this.gridOffsetY.bind(this)
    this.gridCellRotation = this.gridCellRotation.bind(this)
    this.gridCellPosition = this.gridCellPosition.bind(this)
    this.gridRotationString = this.gridRotationString.bind(this)
    this.gridOffsetString = this.gridOffsetString.bind(this)
    this.Grid = this.Grid.bind(this)
    this.followLink = this.followLink.bind(this)
  }

  gridRotation() {
    return (180 - (360 / config.gridCellsPerRow) * 2)
  }

  gridOffsetY() {
    console.log((1 - config.rows / 2) * config.cellHeight)
    return (1 - config.rows / 2) * config.cellHeight
  }

  gridCellRotation (itemNum: number) {
    const rot = this.cylindricalGrid.cellRotation(itemNum)
    return `${rot.x} ${rot.y + 180} ${rot.z}`
  }

  gridCellPosition (itemNum: number) {
    const pos = this.cylindricalGrid.cellPosition(itemNum)
    return `${pos.x} ${pos.y} ${pos.z}`
  }

  gridRotationString (): string {
    return '0 ' + this.gridRotation() + ' 0'
  }

  gridOffsetString (): string {
    return '0 ' + (this.gridOffsetY() + playerHeight) + ' 0'
  }

  followLink() {
    console.log('image clicked!')
  }

  Grid(props: any) {
    const numbers = props.numbers

    const gridItems = numbers.map((number: number) =>
      <Entity key={number.toString()}
        position={ this.gridCellPosition(number) }
        rotation={ this.gridCellRotation(number) }>
        <Entity
          primitive="a-image"
          class='clickable'
          src="#placeholder"
          width={ config.cellWidth }
          height={ config.cellContentHeight }
          events={{ click: this.followLink } }>
        </Entity>
      </Entity>
    )
    return gridItems
  }

  render() {
    return (
      <Entity
        class="grid-cylinder"
        rotation={this.gridRotationString()}
        position={this.gridOffsetString()}>

        { this.Grid({ numbers: numbers }) }

      </Entity>
    )
  }
}
