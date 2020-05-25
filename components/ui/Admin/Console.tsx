import { useState, useEffect } from 'react'
import Button from '@material-ui/core/Button'
import GridList from '@material-ui/core/GridList'
import GridListTile from '@material-ui/core/GridListTile'
import GridListTileBar from '@material-ui/core/GridListTileBar'
import IconButton from '@material-ui/core/IconButton'
import InfoIcon from '@material-ui/icons/Info'
import { connect } from 'react-redux'
import Container from '@material-ui/core/Container'
import { bindActionCreators, Dispatch } from 'redux'
import { fetchAdminVideos } from '../../../redux/admin/service'
import './admin.scss'
import EmptyLayout from '../Layout/EmptyLayout'
import { selectAdminState } from '../../../redux/admin/selector'
import { selectVideoState } from '../../../redux/video/selector'
import { selectAuthState } from '../../../redux/auth/selector'
import VideoModal from './VideoModal'

interface Props {
  auth: any
  videos: any
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

const AdminConsole = (props: Props) => {
  const { fetchAdminVideos, auth, videos } = props
  const initialState = {
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

  const [state, setState] = useState(initialState)

  useEffect(() => {
    fetchAdminVideos()
  }, [])

  const handleCreateModal = () => {
    setState({
      ...state,
      modalMode: 'create',
      modalOpen: true
    })
  }

  const handleEditModal = (video) => {
    setState({
      ...state,
      modalMode: 'edit',
      video: video,
      modalOpen: true
    })
  }

  const modalClose = () => {
    setState({
      ...state,
      modalOpen: false,
      video: {},
      modalMode: ''
    })
  }

  return (
    <EmptyLayout>
      {auth.get('user').userRole === 'admin' && (
        <Container component="main" maxWidth="md">
          <div className={'admin'}>
            <Button onClick={() => handleCreateModal()}>
              Add a video
            </Button>
            <GridList className={'grid'} cellHeight={200} cols={2}>
              {videos.get('videos').map((video) => (
                <GridListTile className={'paper'} key={video.id}>
                  <img src={video.metadata.thumbnail_url} alt={video.name} />
                  <GridListTileBar
                    title={video.name}
                    actionIcon={
                      <IconButton
                        className={'info-icon'}
                        onClick={() => handleEditModal(video)}
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
            open={state.modalOpen}
            handleClose={modalClose}
            mode={state.modalMode}
            video={state.video}
          />
        </Container>
      )}
    </EmptyLayout>
  )
}

const AdminConsoleWrapper = (props: any) => {
  return <AdminConsole {...props} />
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminConsoleWrapper)
