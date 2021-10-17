import React, { useState, useEffect } from 'react'
import Button from '@material-ui/core/Button'
import GridList from '@material-ui/core/GridList'
import GridListTile from '@material-ui/core/GridListTile'
import GridListTileBar from '@material-ui/core/GridListTileBar'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import IconButton from '@material-ui/core/IconButton'
import InfoIcon from '@material-ui/icons/Info'
import { useDispatch } from '@xrengine/client-core/src/store'
import Container from '@material-ui/core/Container'
import { bindActionCreators, Dispatch } from 'redux'
import styles from './Admin.module.scss'
import VideoModal from './VideoModal'
import { useHistory } from 'react-router-dom'
import { useVideoState } from '../../media/components/video/VideoState'
import { useAuthState } from '../../user/state/AuthState'
import { AdminService } from '../state/AdminService'

interface Props {}

const AdminConsole = (props: Props): any => {
  const auth = useAuthState()
  const dispatch = useDispatch()
  const initialState = {
    name: '',
    url: '',
    description: '',
    creator: '',
    rating: '',
    category1: '',
    category2: '',
    thumbnailUrl: '',
    runtime: '',
    stereoscopic: false,
    modalOpen: false,
    modalMode: '',
    video: {}
  }

  const router = useHistory()
  const [state, setState] = useState(initialState)
  const videos = useVideoState()
  useEffect(() => {
    AdminService.fetchAdminVideos()
  }, [])

  const handleCreateModal = (): void => {
    setState({
      ...state,
      modalMode: 'create',
      modalOpen: true
    })
  }

  const handleEditModal = (video): void => {
    setState({
      ...state,
      modalMode: 'edit',
      video: video,
      modalOpen: true
    })
  }

  const modalClose = (): void => {
    setState({
      ...state,
      modalOpen: false,
      video: {},
      modalMode: ''
    })
  }

  const goToRoot = (): void => {
    router.push('/')
  }

  return (
    <div>
      {auth.user.userRole.value === 'admin' && (
        <div className={styles['page-container']}>
          <div className={styles.header}>
            <Button variant="contained" color="primary" onClick={() => goToRoot()}>
              <ArrowBackIcon />
            </Button>
            <Button onClick={() => handleCreateModal()}>Add a video</Button>
            <Button />
          </div>
          <Container component="main" maxWidth="md">
            <div className={styles.admin}>
              <GridList className={styles.grid} cellHeight={200} cols={2}>
                {videos.videos.value.map((video) => (
                  <GridListTile className={styles.cell} key={video.id} cols={1}>
                    <img src={video.metadata.thumbnailUrl} alt={video.name} />
                    <GridListTileBar
                      title={video.name}
                      actionIcon={
                        <IconButton className={styles['info-icon']} onClick={() => handleEditModal(video)}>
                          <InfoIcon />
                        </IconButton>
                      }
                    />
                  </GridListTile>
                ))}
              </GridList>
            </div>
            <VideoModal open={state.modalOpen} handleClose={modalClose} mode={state.modalMode} video={state.video} />
          </Container>
        </div>
      )}
    </div>
  )
}

const AdminConsoleWrapper = (props: any): any => {
  return <AdminConsole {...props} />
}

export default AdminConsoleWrapper
