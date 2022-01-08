import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import InfoIcon from '@mui/icons-material/Info'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import ImageListItemBar from '@mui/material/ImageListItemBar'

import { useVideoState } from '../../media/services/VideoService'
import { useDispatch } from '../../store'
import { useAuthState } from '../../user/services/AuthService'
import { AdminService } from '../services/AdminService'
import styles from './Admin.module.scss'
import VideoModal from './VideoModal'

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
              <ImageList className={styles.grid} cellHeight={200} cols={2}>
                {videos.videos.value.map((video) => (
                  <ImageListItem className={styles.cell} key={video.id} cols={1}>
                    <img src={video.metadata.thumbnailUrl} alt={video.name} />
                    <ImageListItemBar
                      title={video.name}
                      actionIcon={
                        <IconButton className={styles['info-icon']} onClick={() => handleEditModal(video)} size="large">
                          <InfoIcon />
                        </IconButton>
                      }
                    />
                  </ImageListItem>
                ))}
              </ImageList>
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
