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
import MovieCreationIcon from '@material-ui/icons/MovieCreation'
import AudiotrackIcon from '@material-ui/icons/Audiotrack'
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf'

import { useAuthState } from '@xrengine/client-core/src/user/reducers/auth/AuthState'
import { selectCreatorsState } from '../../reducers/creator/selector'
import { selectFeedsState } from '../../reducers/post/selector'
import { getFeeds, removeFeed } from '../../reducers/post/service'
import styles from './Featured.module.scss'
import { useHistory } from 'react-router'
import { addFireToFeed, removeFireToFeed } from '../../reducers/feedFires/service'
import { getComponentTypeForMedia } from '../Feed'

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
  addFireToFeed: bindActionCreators(addFireToFeed, dispatch),
  removeFireToFeed: bindActionCreators(removeFireToFeed, dispatch)
})

interface Props {
  feedsState?: any
  //authState?: any
  getFeeds?: any
  type?: string
  creatorId?: string
  creatorState?: any
  removeFeed?: any
  viewType?: string
  addFireToFeed?: typeof addFireToFeed
  removeFireToFeed?: typeof removeFireToFeed
  isFeatured?: boolean
  setIsFeatured?: Function
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

const getMediaPreviewIcon = (mime, props = {}) => {
  switch (getComponentTypeForMedia(mime || 'image')) {
    case 'video':
      return <MovieCreationIcon {...props} />
      break
    case 'audio':
      return <AudiotrackIcon {...props} />
      break
    case 'pdf':
      return <PictureAsPdfIcon {...props} />
      break
    default:
      return null
      break
  }
}

const Featured = ({
  feedsState,
  getFeeds,
  type,
  creatorId,
  removeFeed,
  viewType,
  addFireToFeed,
  removeFireToFeed,
  isFeatured,
  setIsFeatured
}: Props) => {
  const [feedsList, setFeedList] = useState([])
  const [removedIds, setRemovedIds] = useState(new Set())
  const [feedIds, setFeedIds] = useState(new Set())
  const { t } = useTranslation()
  const history = useHistory()
  const auth = useAuthState()

  const removeIdsStringify = JSON.stringify([...removedIds])
  useEffect(() => {
    if (type === 'creator' || type === 'bookmark' || type === 'myFeatured' || type === 'fired') {
      getFeeds(type, creatorId)
    } else {
      const userIdentityType = auth.authUser?.identityProvider?.type?.value ?? 'guest'
      userIdentityType !== 'guest'
        ? getFeeds('featured').then(() => {
            if (type !== 'fired') {
              getFeeds('fired', creatorId)
            }
          })
        : getFeeds('featuredGuest')
    }
    if (type !== 'fired') {
      setRemovedIds(new Set())
    }
  }, [type, creatorId, feedsState.get('feedsFetching'), removeIdsStringify])

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
      type === 'fired' && feedsState.get('feedsFiredFetching') === false && setFeedList(feedsState.get('feedsFired')),
    [feedsState.get('feedsFiredFetching'), feedsState.get('feedsFired')]
  )
  const feedsFiredStringify = JSON.stringify(feedsState.get('feedsFired'))
  useEffect(() => {
    typeof setIsFeatured === 'function' && setIsFeatured(!!feedsState.get('feedsFired')?.length)
  }, [feedsState.get('feedsFetching'), feedsFiredStringify])

  const handleAddToFeatured = (item) => {
    if (!feedIds.has(item)) {
      setFeedIds(new Set([...feedIds, item]))
      removedIds.delete(item)
      setRemovedIds(new Set([...removedIds]))
      addFireToFeed(item)
      setIsFeatured(true)
    }
  }

  const handleRemoveFromFeatured = (item) => {
    removeFireToFeed(item)
    let ids = new Set([...removedIds, item])
    setRemovedIds(ids)
    feedIds.delete(item)
    setFeedIds(new Set([...feedIds]))
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
                  className={type === 'fired' && removedIds.has(item.id) ? styles.gridItemDelete : styles.gridItem}
                >
                  {!type ? (
                    <AddCircleOutlinedIcon className={styles.addButton} onClick={() => handleAddToFeatured(item.id)} />
                  ) : (
                    <RemoveCircleOutlinedIcon
                      onClick={() => handleRemoveFromFeatured(item.id)}
                      className={styles.removeButton}
                    />
                  )}
                  <Card
                    className={styles.creatorItem + ' ' + (viewType === 'list' ? styles.list : '')}
                    elevation={0}
                    key={itemIndex}
                  >
                    <div className={styles.imageWrapper + ' ' + (viewType === 'list' ? styles.imageList : '')}>
                      {getMediaPreviewIcon(item.previewType, {
                        className: `${styles.image} ${styles.mediaPreviewIcon}`,
                        onClick: () => {
                          history.push('/post?postId=' + item.id)
                        }
                      }) || (
                        <CardMedia
                          component="img"
                          className={styles.image}
                          image={item.previewUrl}
                          onClick={() => {
                            history.push('/post?postId=' + item.id)
                          }}
                        />
                      )}
                    </div>
                    <CardContent style={{ textAlign: 'center' }}>
                      <span className={styles.descr}>{item.title}</span>
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
