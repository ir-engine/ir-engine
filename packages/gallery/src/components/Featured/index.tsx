import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'

import { selectAuthState } from '@xrengine/client-core/src/user/reducers/auth/selector'
import { selectCreatorsState } from '@xrengine/gallery/src/reducers/creator/selector'
import { selectFeedsState } from '@xrengine/gallery/src/reducers/post/selector'
import { getFeeds } from '@xrengine/gallery/src/reducers/post/service'
import styles from './Featured.module.scss'
import { useHistory } from 'react-router'

const mapStateToProps = (state: any): any => {
  return {
    feedsState: selectFeedsState(state),
    creatorState: selectCreatorsState(state),
    authState: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getFeeds: bindActionCreators(getFeeds, dispatch)
})
interface Props {
  feedsState?: any
  authState?: any
  getFeeds?: any
  type?: string
  creatorId?: string
  creatorState?: any
}

const Featured = ({ feedsState, getFeeds, type, creatorId, authState }: Props) => {
  const [feedsList, setFeedList] = useState([])
  const { t } = useTranslation()
  const history = useHistory()

  useEffect(() => {
    if (type === 'creator' || type === 'bookmark' || type === 'myFeatured' || type === 'fired') {
      getFeeds(type, creatorId)
    } else {
      const userIdentityType = authState.get('authUser')?.identityProvider?.type ?? 'guest'
      userIdentityType !== 'guest' ? getFeeds('featured') : getFeeds('featuredGuest')
    }
  }, [type, creatorId, feedsState.get('feedsFetching')])

  useEffect(
    () =>
      (type === 'featured' || !type) &&
      feedsState.get('feedsFetching') === false &&
      setFeedList(feedsState.get('feedsFeatured')),
    [feedsState.get('feedsFetching'), feedsState.get('feedsFeatured')]
  )

  useEffect(
    () =>
      (type === 'featured' || !type) &&
      feedsState.get('feedsFeaturedFetching') === false &&
      setFeedList(feedsState.get('feedsFeatured')),
    [feedsState.get('feedsFeaturedFetching'), feedsState.get('feedsFeatured')]
  )

  useEffect(
    () =>
      type === 'creator' &&
      feedsState.get('feedsCreatorFetching') === false &&
      setFeedList(feedsState.get('feedsCreator')),
    [feedsState.get('feedsCreatorFetching'), feedsState.get('feedsCreator')]
  )

  return (
    <section className={styles.feedContainer}>
      {feedsList && feedsList.length > 0
        ? feedsList.map((item, itemIndex) => {
            return (
              <Card className={styles.creatorItem} elevation={0} key={itemIndex}>
                <CardMedia
                  className={styles.previewImage}
                  image={item.previewUrl}
                  onClick={() => {
                    history.push('/post?postId=' + item.id)
                  }}
                />
                <span className={styles.descr}>{item.description}</span>
              </Card>
            )
          })
        : ''}
    </section>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Featured)
