import React, { useEffect } from 'react'
import { Entity } from 'aframe-react'
import './style.scss'

import { PublicScene } from '../../../redux/scenes/actions'

import { bindActionCreators, Dispatch } from 'redux'

import { connect } from 'react-redux'
import { selectScenesState } from '../../../redux/scenes/selector'
import { fetchPublicScenes } from '../../../redux/scenes/service'

interface DreamProps {
  scenes: any
  fetchPublicScenes: typeof fetchPublicScenes
}

const mapStateToProps = (state: any) => {
  return {
    scenes: selectScenesState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchPublicScenes: bindActionCreators(fetchPublicScenes, dispatch)
})

const DreamScene = (props: DreamProps): any => {
  const { scenes, fetchPublicScenes } = props

  useEffect(() => {
    if (scenes.get('scenes').size === 0) {
      fetchPublicScenes()
    }
  })
  return (
    <Entity position="0 1.6 0">
      <Entity primitive="a-grid" rows={3}>
        {scenes.get('scenes').map((x: PublicScene, i: number) => {
          return (
            <Entity
              key={i}
              primitive="a-media-cell"
              title={x.name}
              media-url={x.url}
              thumbnail-url={x.thumbnailUrl}
              cellHeight={0.6666}
              cellWidth={1}
              cellContentHeight={0.5}
              mediatype="scene"
            />
          )
        })}
      </Entity>
    </Entity>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(DreamScene)
