// import NavItem from '../NavItem'
import React, { Component } from 'react'
import Link from 'next/link'

// import { siteTitle } from '../../../config/server'

import './style.scss'
import Button from '@material-ui/core/Button'
import { connect } from 'react-redux'
import { selectVideoState } from '../../../redux/video/selector'
// eslint-disable-next-line no-unused-vars
import { bindActionCreators, Dispatch } from 'redux'
import { fetchPublicVideos } from '../../../redux/video/service'
// eslint-disable-next-line no-unused-vars
import { PublicVideo } from '../../../redux/video/actions'
// TODO: Generate nav items from a config file

interface VideoProps {
  videos: any
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

class VideoList extends Component<VideoProps> {
  render() {
    const { videos } = this.props

    return (
      <div>
        <Button variant="contained" color="primary" className={'back'} href="/">
          Back
        </Button>
        <div className="video-container">
          {videos.get('videos').map(function (video: PublicVideo, i: number) {
            return (
              <div className="box" key={i}>
                <Link href={'/video360?manifest=' + video.url + '&title=' + video.name}>
                  {video.name}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  componentDidMount() {
    this.props.fetchPublicVideos()
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(VideoList)
