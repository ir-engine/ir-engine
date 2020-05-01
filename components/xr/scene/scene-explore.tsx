import React, { useEffect, useState } from 'react'
// @ts-ignore
import { Scene, Entity } from 'aframe-react'
import Assets from './assets'
import Environment from './environment'
import Player from '../player/player'
import './style.scss'
import SvgVr from '../../icons/svg/Vr'

// eslint-disable-next-line no-unused-vars
import { PublicVideo } from '../../../redux/video/actions'

import AframeComponentRegisterer from '../aframe/index'

// eslint-disable-next-line no-unused-vars
import { bindActionCreators, Dispatch } from 'redux'

import { connect } from 'react-redux'
import { selectVideoState } from '../../../redux/video/selector'
import { fetchPublicVideos } from '../../../redux/video/service'

interface VideoProps {
  videos: any,
  fetchPublicVideos: typeof fetchPublicVideos
}

interface ExploreState {
  focusedCell: HTMLElement | null,
}

const mapStateToProps = (state: any) => {
  return {
    videos: selectVideoState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchPublicVideos: bindActionCreators(fetchPublicVideos, dispatch)
})

function ExploreScene (props: VideoProps): any {
  const { videos, fetchPublicVideos } = props

  const [exploreState, setExploreState] = useState<ExploreState>({ focusedCell: null })

  const focusCell = (event: any) => {
    setExploreState({ focusedCell: event.originalTarget.parentEl })
  }

  const unFocusCell = () => {
    setExploreState({ focusedCell: null })
  }

  const watchVideo = () => {
    if (exploreState.focusedCell === null) return
    const url = (exploreState.focusedCell.attributes as any)['media-url'].value
    const title = (exploreState.focusedCell.attributes as any).title.value
    const videoformat = (exploreState.focusedCell.attributes as any).videoformat.value
    window.location.href = 'video360?manifest=' + url +
      '&title=' + title +
      // '&runtime=' + runtime +
      // '&credit=' + productionCredit +
      // '&rating=' + rating +
      // '&categories=' categories.join(',') +
      // '&tags=' + tags.join(',') +
      '&videoformat=' + videoformat
  }

  useEffect(() => {
    if (videos.get('videos').size === 0) {
      fetchPublicVideos()
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
          rows={5}
          colunns={6}>

          {videos.get('videos').map(function (video: PublicVideo, i: number) {
            return (
              <Entity
                key={i}
                id={'explore-cell-' + i}
                primitive="a-media-cell"
                // original-title={video.original_title}
                title={video.name}
                description={video.description}
                media-url={video.url}
                thumbnail-url={video.metadata.thumbnail_url || '#placeholder'}
                // production-credit={video.production_credit}
                // rating={video.rating}
                // categories={video.categories}
                // runtime={video.runtime}
                // tags={video.tags}
                cellHeight={0.6666}
                cellWidth={1}
                cellContentHeight={0.5}
                mediatype="video360"
                videoformat={video.metadata['360_format']}
                link-enabled={false}
                class="clickable"
                events={{
                  click: focusCell
                }}
              ></Entity>
            )
          })}

        </Entity>
        { exploreState.focusedCell !== null &&
          <Entity
            position="0 0 -1.5">
            <Entity
              id="focused-cell"
              primitive="a-media-cell"
              position="-0.75 0 0"
              scale="1.5 1.5 1.5"
              mediatype="video360"
              title={(exploreState.focusedCell.attributes as any).name}
              description={(exploreState.focusedCell.attributes as any).description}
              videoformat={(exploreState.focusedCell.attributes as any).videoformat.value}
              media-url={(exploreState.focusedCell.attributes as any)['media-url'].value}
              thumbnail-url={(exploreState.focusedCell.attributes as any)['thumbnail-url'].value}>
            </Entity>
            <Entity id="video-details"
              position="0.75 0 0"
            >
              <Entity id="video-details-text"
                text={{
                  font: 'mozillavr',
                  width: 2,
                  align: 'center',
                  baseline: 'center',
                  color: 'white',
                  transparent: false,
                  value: exploreState.focusedCell.title + '\n\n' +
                    (exploreState.focusedCell.attributes as any).description.value
                }}>
                <Entity
                  primitive="a-plane"
                  position={{ x: 0, y: -0.0625, z: -0.01 }}
                  color="black"
                  width={1}
                  height={0.75}
                />
              </Entity>
              <Entity id="video-details-watch"
                position={{ x: -0.25, y: -0.5, z: 0 }}
                text={{
                  font: 'mozillavr',
                  width: 2,
                  align: 'center',
                  baseline: 'center',
                  color: 'white',
                  transparent: false,
                  value: 'watch'
                }}>
                <Entity
                  primitive="a-plane"
                  position={{ x: 0, y: -0.0625, z: -0.01 }}
                  color="green"
                  width={0.5}
                  height={0.125}
                  class="clickable"
                  events={{
                    click: watchVideo
                  }}
                />
              </Entity>
              <Entity id="video-details-back"
                position={{ x: 0.25, y: -0.5, z: 0 }}
                text={{
                  font: 'mozillavr',
                  width: 2,
                  align: 'center',
                  baseline: 'center',
                  color: 'white',
                  transparent: false,
                  value: 'back'
                }}>
                <Entity
                  primitive="a-plane"
                  position={{ x: 0, y: -0.0625, z: -0.01 }}
                  color="red"
                  width={0.5}
                  height={0.125}
                  class="clickable"
                  events={{
                    click: unFocusCell
                  }}
                />
              </Entity>
            </Entity>
          </Entity>
        }
      </Entity>
      <Assets />
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
)(ExploreScene)
