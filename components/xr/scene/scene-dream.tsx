import { useEffect } from 'react'
import SceneContainer from './scene-container'
import { Entity } from 'aframe-react'
import Assets from './assets'
import { Environment } from './environment'
import Player from '../player/player'
import './style.scss'

import { PublicScene } from '../../../redux/scenes/actions'

import AframeComponentRegisterer from '../aframe/index'
import { bindActionCreators, Dispatch } from 'redux'

import { connect } from 'react-redux'
import { selectScenesState } from '../../../redux/scenes/selector'
import { fetchPublicScenes } from '../../../redux/scenes/service'

interface Props {
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

const DreamScene = (props: Props) => {
  const { scenes, fetchPublicScenes } = props

  useEffect(() => {
    if (scenes.get('scenes').size === 0) {
      fetchPublicScenes()
    }
  }, [])

  return (
    <SceneContainer>
      <AframeComponentRegisterer />
      <Assets />
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
      <Player />
      <Environment />
    </SceneContainer>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(DreamScene)
