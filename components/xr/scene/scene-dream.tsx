import React, { useEffect } from 'react' //
// @ts-ignore
import { Scene, Entity } from 'aframe-react'
import Environment from './environment'
import Player from '../player/player'
import './style.scss'
import SvgVr from '../../icons/svg/Vr'

// eslint-disable-next-line no-unused-vars
import { PublicScene } from '../../../redux/scenes/actions'

import AframeComponentRegisterer from '../aframe/index'
// eslint-disable-next-line no-unused-vars
import { bindActionCreators, Dispatch } from 'redux'

import { connect } from 'react-redux'
import { selectScenesState } from '../../../redux/scenes/selector'
import { fetchPublicScenes } from '../../../redux/scenes/service'

interface DreamProps {
  scenes: any,
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

function DreamScene (props: DreamProps): any {
  const { scenes, fetchPublicScenes } = props

  useEffect(() => {
    if (scenes.get('scenes').size === 0) {
      fetchPublicScenes()
    }
  })
  return (
    <Scene
      vr-mode-ui="enterVRButton: #enterVRButton"
      class="scene"
      renderer="antialias: true"
      background="color: #FAFAFA"
    >
      <AframeComponentRegisterer />
      <Entity position="0 1.6 0">
        <Entity
          primitive="a-grid"
          rows={3}>
          {scenes.get('scenes').map(function (x: PublicScene, i: number) {
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
              ></Entity>
            )
          })}
        </Entity>
      </Entity>
      <Player />
      <Environment />
      <a className="enterVR" id="enterVRButton" href="#">
        <SvgVr className="enterVR" />
      </a>
    </Scene>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DreamScene)
