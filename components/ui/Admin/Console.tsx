import React from 'react'
import Button from '@material-ui/core/Button'
import GridList from '@material-ui/core/GridList'
import GridListTile from '@material-ui/core/GridListTile'
import GridListTileBar from '@material-ui/core/GridListTileBar'
import IconButton from '@material-ui/core/IconButton'
import InfoIcon from '@material-ui/icons/Info'
import { connect } from 'react-redux'
import Container from '@material-ui/core/Container'
import { bindActionCreators, Dispatch } from 'redux'
import {
  fetchAdminVideos
} from '../../../redux/admin/service'
import './admin.scss'
import EmptyLayout from '../Layout/EmptyLayout'
import { selectAdminState } from '../../../redux/admin/selector'
import { selectVideoState } from '../../../redux/video/selector'
import { selectAuthState } from '../../../redux/auth/selector'
import VideoModal from './VideoModal'

interface Props {
  auth: any,
  videos: any,
  fetchAdminVideos: typeof fetchAdminVideos
}

const mapStateToProps = (state: any) => {
  return {
    auth: selectAuthState(state),
    admin: selectAdminState(state),
    videos: selectVideoState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchAdminVideos: bindActionCreators(fetchAdminVideos, dispatch)
})

class AdminConsole extends React.Component<Props> {
  state = {
    name: '',
    url: '',
    description: '',
    creator: '',
    rating: '',
    category1: '',
    category2: '',
    thumbnail_url: '',
    runtime: '',
    stereoscopic: false,
    subscriptionLevel: 'all',
    modalOpen: false,
    modalMode: '',
    video: {}
  }

  handleCreateModal = () => {
    this.setState({ modalMode: 'create' })
    this.setState({ modalOpen: true })
  }

  handleEditModal = (video) => {
    this.setState({ modalMode: 'edit' })
    this.setState({ video: video })
    this.setState({ modalOpen: true })
  }

  modalClose = () => {
    this.setState({ modalOpen: false })
    this.setState({ video: {} })
    this.setState({ modalMode: '' })
  }

  componentDidMount() {
    this.props.fetchAdminVideos()
  }

  render() {
    return (
      <EmptyLayout>
        {this.props.auth.get('user').userRole === 'admin' && <Container component='main' maxWidth='md'>
          <div className={'paper'}>
            <Button
              onClick={() => this.handleCreateModal()}
            >
              Add a video
            </Button>
            <GridList cellHeight={200} className={'paper'} cols={2}>
              {this.props.videos.get('videos').map((video) => (
                <GridListTile
                  key={video.id}
                >
                  <img src={video.metadata.thumbnail_url} alt={video.name} />
                  <GridListTileBar
                    title={video.name}
                    actionIcon={
                      <IconButton
                        className={'info-icon'}
                        onClick={() => this.handleEditModal(video)}
                      >
                        <InfoIcon />
                      </IconButton>
                    }
                  />
                </GridListTile>
              ))}
            </GridList>
          </div>
          <VideoModal
            open={this.state.modalOpen}
            handleClose={this.modalClose}
            mode={this.state.modalMode}
            video={this.state.video}
          />
        </Container>}
      </EmptyLayout>
    )
  }
}

const AdminConsoleWrapper = (props: any) => {
  return <AdminConsole {...props}/>
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminConsoleWrapper)
