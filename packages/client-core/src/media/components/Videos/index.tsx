import React, { useEffect } from 'react'
import styles from './Videos.module.scss'
import Button from '@material-ui/core/Button'
import { connect, useDispatch } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { PublicVideo } from '../video/VideoActions'
import { useVideoState } from '../video/VideoState'
import { VideoService } from '../video/VideoService'
import { useTranslation } from 'react-i18next'

const mapStateToProps = (state: any): any => {
  return {}
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({})

interface Props {}

export const VideoList = (props: Props): any => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const videos = useVideoState()

  useEffect(() => {
    dispatch(VideoService.fetchPublicVideos())
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

export default connect(mapStateToProps, mapDispatchToProps)(VideoList)
