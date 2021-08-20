import React, { useEffect } from 'react'
import styles from './Videos.module.scss'
import Button from '@material-ui/core/Button'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { PublicVideo } from '../video/actions'
import { selectVideoState } from '../video/selector'
import { fetchPublicVideos } from '../video/service'
import { useTranslation } from 'react-i18next'

const mapStateToProps = (state: any): any => {
  return {
    videos: selectVideoState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  fetchPublicVideos: bindActionCreators(fetchPublicVideos, dispatch)
})

interface Props {
  videos: any
  fetchPublicVideos: typeof fetchPublicVideos
}

export const VideoList = (props: Props): any => {
  const { videos, fetchPublicVideos } = props
  const { t } = useTranslation()
  useEffect(() => {
    fetchPublicVideos()
  }, [])
  return (
    <div>
      <Button variant="contained" color="primary" className={styles.back} href="/">
        {t('social:video.back')}
      </Button>
      <div className={styles['video-container']}>
        {videos.get('videos').map((video: PublicVideo, i: number) => {
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
