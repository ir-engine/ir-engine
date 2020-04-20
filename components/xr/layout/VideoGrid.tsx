import React, { useEffect } from 'react'
// eslint-disable-next-line no-unused-vars
import { bindActionCreators, Dispatch } from 'redux'

import { connect } from 'react-redux'
import { selectVideoState } from '../../../redux/video/selector'
import { fetchPublicVideos } from '../../../redux/video/service'
// eslint-disable-next-line no-unused-vars
import { PublicVideo } from '../../../redux/video/actions'

import MediaGrid from './MediaGrid'

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

function VideoGridLayout (props: VideoProps): any {
  const { videos, fetchPublicVideos } = props

  useEffect(() => {
    if (videos.get('videos').size === 0) {
      fetchPublicVideos()
    }
  })

  return (
    <MediaGrid media={props.videos} cellContentHeight={0.66666} />
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VideoGridLayout)
