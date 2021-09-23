import React, { useEffect } from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Button, Card, Typography, CardContent, CardMedia } from '@material-ui/core'
import { selectFeedsState } from '../../reducers/post/selector'
import { getFeed } from '../../reducers/post/service'

import styles from './Feed.module.scss'

const mapStateToProps = (state: any): any => {
  return {
    feedsState: selectFeedsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getFeed: bindActionCreators(getFeed, dispatch)
})

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

  return (
    <section className={styles.feedContainer}>
      {feed && (
        <Card className={styles.card}>
          <CardMedia component="img" src={feed.previewUrl} alt={feed.title} className={styles.previewImage} />
          <CardContent>
            <Typography className={styles.cartText} variant="h6">
              {feed.description}
            </Typography>
          </CardContent>
        </Card>
      )}
    </section>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Feed)
