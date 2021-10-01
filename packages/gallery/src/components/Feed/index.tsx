import React, { useEffect, useCallback, ElementType } from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Button, Card, Typography, CardContent, CardMedia } from '@material-ui/core'
import { selectFeedsState } from '../../reducers/post/selector'
import { getFeed } from '../../reducers/post/service'
import FileViewer from 'react-file-viewer'

import styles from './Feed.module.scss'

const mapStateToProps = (state: any): any => {
  return {
    feedsState: selectFeedsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getFeed: bindActionCreators(getFeed, dispatch)
})

export const getComponentTypeForMedia = (mime) => {
  switch (true) {
    case mime.startsWith('image'):
      return 'img'
      break
    case mime.startsWith('video'):
      return 'video'
      break
    case mime.startsWith('audio'):
      return 'audio'
      break
    case mime === 'application/pdf':
      return 'pdf'
      break
    default:
      return 'img'
      break
  }
}

interface Props {
  feedsState?: any
  getFeed?: any
  feedId?: string
}
const Feed = ({ feedsState, getFeed, feedId }: Props) => {
  let feed = null as any
  const { t } = useTranslation()

  useEffect(() => getFeed(feedId), [])
  feed = feedsState && feedsState.get('fetching') === false && feedsState.get('feed')

  const componentType = getComponentTypeForMedia(feed.previewType || 'image')

  return (
    <section className={styles.feedContainer}>
      {feed && (
        <Card className={styles.card}>
          {componentType !== 'pdf' ? (
            <CardMedia
              component={componentType === 'audio' ? 'audio' : 'img'}
              src={feed.previewUrl}
              alt={feed.title}
              className={styles.previewImage}
              controls
            />
          ) : (
            <FileViewer fileType="pdf" filePath={feed.previewUrl} className={styles.previewImage} />
          )}
          <CardContent>
            <Typography className={styles.cartText} variant="h6">
              {feed.title}
            </Typography>
            <Typography className={styles.cartDescription} variant="h6">
              {feed.description}
            </Typography>
          </CardContent>
        </Card>
      )}
    </section>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Feed)
