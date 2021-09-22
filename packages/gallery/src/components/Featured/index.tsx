import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'
import AddCircleOutlinedIcon from '@material-ui/icons/AddCircleOutlined'
import RemoveCircleOutlinedIcon from '@material-ui/icons/RemoveCircleOutlined'

import { useAuthState } from '@xrengine/client-core/src/user/reducers/auth/AuthState'
import { selectCreatorsState } from '../../reducers/creator/selector'
import { selectFeedsState } from '../../reducers/post/selector'
import { getFeeds, removeFeed, setFeedAsFeatured, setFeedNotFeatured } from '../../reducers/post/service'
import styles from './Featured.module.scss'
import { useHistory } from 'react-router'
import { Button } from '@material-ui/core'

const mapStateToProps = (state: any): any => {
  return {
    feedsState: selectFeedsState(state),
    creatorState: selectCreatorsState(state)
    //authState: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getFeeds: bindActionCreators(getFeeds, dispatch),
  removeFeed: bindActionCreators(removeFeed, dispatch),
  setFeedAsFeatured: bindActionCreators(setFeedAsFeatured, dispatch),
  setFeedNotFeatured: bindActionCreators(setFeedNotFeatured, dispatch)
})
interface Props {
  feedsState?: any
  //authState?: any
  getFeeds?: any
  type?: string
  creatorId?: string
  creatorState?: any
  removeFeed?: any
  setFeedAsFeatured?: typeof setFeedAsFeatured
  setFeedNotFeatured?: typeof setFeedNotFeatured
  viewType?: string
}

const gridValues = {
  grid: {
    xs: 12,
    lg: 6,
    xl: 4
  },
  list: {
    xs: 12,
    lg: 12,
    xl: 12
  }
}

const Featured = ({
  feedsState,
  getFeeds,
  type,
  creatorId,
  removeFeed,
  setFeedAsFeatured,
  setFeedNotFeatured,
  viewType
}: Props) => {
  const [feedsList, setFeedList] = useState([])
  const [removedIds, setRemovedIds] = useState(new Set())
  const { t } = useTranslation()
  const history = useHistory()
  const auth = useAuthState()

  useEffect(() => {
    if (type === 'creator' || type === 'bookmark' || type === 'myFeatured' || type === 'fired') {
      getFeeds(type, creatorId)
    } else {
      const userIdentityType = auth.authUser?.identityProvider?.type?.value ?? 'guest'
      userIdentityType !== 'guest' ? getFeeds('featured') : getFeeds('featuredGuest')
    }
    if (type !== 'myFeatured') {
      setRemovedIds(new Set())
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

  useEffect(
    () =>
      type === 'myFeatured' &&
      feedsState.get('myFeaturedFetching') === false &&
      setFeedList(feedsState.get('myFeatured')),
    [feedsState.get('myFeaturedFetching'), feedsState.get('myFeatured')]
  )

  const handleRemove = (id, image) => {
    // removeFeed(id, image)
  }

  const handleAddToFeatured = (item) => {
    setFeedAsFeatured(item)
  }

  const handleRemoveFromFeatured = (item) => {
    setFeedNotFeatured(item)
    let ids = new Set([...removedIds, item])
    setRemovedIds(ids)
  }
  return (
    <section className={styles.feedContainer}>
      <Grid container spacing={3} style={{ marginTop: 30 }}>
        {feedsList && feedsList.length > 0
          ? feedsList.map((item, itemIndex) => {
              return (
                <Grid
                  item
                  {...gridValues[viewType]}
                  key={itemIndex}
                  className={type === 'myFeatured' && removedIds.has(item.id) ? styles.gridItemDelete : styles.gridItem}
                >
                  {!type ? (
                    <AddCircleOutlinedIcon className={styles.addButton} onClick={() => handleAddToFeatured(item.id)} />
                  ) : (
                    <RemoveCircleOutlinedIcon
                      onClick={() => handleRemoveFromFeatured(item.id)}
                      className={styles.removeButton}
                    />
                  )}
                  <Card className={styles.creatorItem} elevation={0} key={itemIndex}>
                    <CardMedia
                      // className={styles.previewImage}
                      component="img"
                      // style={{ height: (viewType === 'grid'? '354px' : '100%'), width: "90%" }}
                      style={{ height: 390, padding: '30px 30px 0' }}
                      image={item.previewUrl}
                      onClick={() => {
                        history.push('/post?postId=' + item.id)
                        // handleRemove(item.id, item.previewUrl)
                      }}
                    />
                    <CardContent style={{ textAlign: 'center' }}>
                      <span className={styles.descr}>{item.description}</span>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })
          : ''}
      </Grid>
    </section>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Featured)
