import React, { useEffect } from 'react'
import { Entity } from 'aframe-react'
import './style.scss'

import { PublicScene } from '../../../redux/scenes/actions'

import { bindActionCreators, Dispatch } from 'redux'

import { connect } from 'react-redux'
import { selectScenesState } from '../../../redux/scenes/selector'
import { fetchPublicScenes } from '../../../redux/scenes/service'

import getConfig from 'next/config'
const config = getConfig().publicRuntimeConfig.xr.vrRoomGrid
const style = getConfig().publicRuntimeConfig.xr.style

const cellHeight = config.cellHeight
const cellContentHeight = config.cellContentHeight
const cellWidth = config.cellWidth
const rows = config.rows
const columns = config.columns

const x: number = config.offset.x
const y: number = config.offset.y
const z: number = config.offset.z
const pos = `${x} ${y} ${z}`

interface Props {
  scenes?: any
  fetchPublicScenes?: typeof fetchPublicScenes
}

const mapStateToProps = (state: any): any => {
  return {
    scenes: selectScenesState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  fetchPublicScenes: bindActionCreators(fetchPublicScenes, dispatch)
})

const VrRoomGridScene = (props: Props): any => {
  const { scenes, fetchPublicScenes } = props

  useEffect(() => {
    if (scenes.get('scenes').size === 0) {
      fetchPublicScenes()
    }
  })
  return (
    <Entity position={pos}>
      <Entity primitive="a-grid"
        rows={rows}
        columns={columns}
        cell-height={cellHeight}
        cell-width={cellWidth}
        cell-content-height={cellContentHeight}>
        {scenes.get('scenes').map((x: PublicScene, i: number) => {
          return (
            <Entity
              key={i}
              primitive="a-media-cell"
              title={x.name}
              media-url={x.url}
              thumbnail-url={x.thumbnailUrl}
              cell-height={cellHeight}
              cell-width={cellWidth}
              cell-content-height={cellContentHeight}
              mediatype="scene"
              scene-link-prefix={config.name}
              border-color={Number(style.borderColor)}
              hover-color={Number(style.hoverColor)}
              active-color={Number(style.activeColor)}
            />
          )
        })}
      </Entity>
    </Entity>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(VrRoomGridScene)
