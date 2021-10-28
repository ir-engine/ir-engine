import React, { useEffect } from 'react'
import styles from './Videos.module.scss'
import Button from '@mui/material/Button'
import { useDispatch } from '../../../store'
import { PublicVideo } from '../../state/VideoActions'
import { useVideoState } from '../../state/VideoState'
import { VideoService } from '../../state/VideoService'
import { useTranslation } from 'react-i18next'

interface Props {}

export const VideoList = (props: Props): any => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const videos = useVideoState()

  useEffect(() => {
    VideoService.fetchPublicVideos()
  }, [])
  return (
    <div>
      <Button variant="contained" color="primary" className={styles.back} href="/">
        {t('social:video.back')}
      </Button>
      <div className={styles['video-container']}>
        {videos.videos.value.map((video: PublicVideo, i: number) => {
          return (
            <div className={styles.box} key={i}>
              {/* <Link
                href={
                  '/video?manifest=' + video.url + '&title=' + video.name
                }
              >
              </Link> */}
              {video.name}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default VideoList
