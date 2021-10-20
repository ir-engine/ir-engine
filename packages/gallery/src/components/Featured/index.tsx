import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from '@xrengine/client-core/src/store'

import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'
import AddCircleOutlinedIcon from '@material-ui/icons/AddCircleOutlined'
import RemoveCircleOutlinedIcon from '@material-ui/icons/RemoveCircleOutlined'
import AudiotrackIcon from '@material-ui/icons/Audiotrack'
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf'

import { useAuthState } from '@xrengine/client-core/src/user/state/AuthState'
import { useFeedState } from '@xrengine/client-core/src/social/state/FeedState'
import { FeedService } from '@xrengine/client-core/src/social/state/FeedService'
import styles from './Featured.module.scss'
import { useHistory } from 'react-router'
import { FeedFiresService } from '@xrengine/client-core/src/social/state/FeedFiresService'
import { getComponentTypeForMedia } from '../Feed'
import { MediaContent } from './MediaContent'

interface Props {
  //authState?: any
  type?: string
  creatorId?: string
  viewType?: string
  isFeatured?: boolean
  setIsFeatured?: Function
}

const gridValues = {
  gallery: {
    xs: 4
  },
  blog: {
    xs: 12
  }
}

let lazyVideoObserver = null
const lazyLoadingObserver = (lazyVideos) => {
  if ('IntersectionObserver' in window) {
    lazyVideoObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (video) {
        if (video.isIntersecting) {
          var videoSource = video.target
          videoSource.src = videoSource.dataset.src

          video.target.load()
          video.target.classList.remove('lazy')
          lazyVideoObserver.unobserve(video.target)
        }
      })
    })

    lazyVideos.forEach(function (lazyVideo) {
      lazyVideoObserver.observe(lazyVideo)
    })
  }
  return null
}

const getMediaPreviewIcon = (mime, props = {}) => {
  switch (getComponentTypeForMedia(mime || 'image')) {
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

const Featured = ({ type, creatorId, viewType, isFeatured, setIsFeatured }: Props) => {
  const [feedsList, setFeedList] = useState([])
  const [removedIds, setRemovedIds] = useState(new Set())
  const [feedIds, setFeedIds] = useState(new Set())
  const { t } = useTranslation()
  const history = useHistory()
  const auth = useAuthState()
  const dispatch = useDispatch()
  const removeIdsStringify = JSON.stringify([...removedIds])
  const feedsState = useFeedState()
  const [refs, setRefs] = useState([])

  const addToRefs = (el) => {
    if (el && !refs.includes(el)) {
      setRefs([...refs, el])
    }
  }
  useEffect(() => {
    if (!!feedsState.feeds.feedsFired.value.length) {
      setIsFeatured(true)
    }
  }, [feedsState.feeds.feedsFiredFetching, JSON.stringify(feedsState.feeds.feedsFired.value)])

  useEffect(
    () => () => {
      if (lazyVideoObserver !== null) {
        lazyVideoObserver.disconnect()
      }
    },
    []
  )
  useEffect(() => {
    lazyLoadingObserver(refs)
  }, [refs])

  useEffect(() => {
    if (auth.user.id.value) {
      if (type === 'creator' || type === 'bookmark' || type === 'myFeatured' || type === 'fired') {
        FeedService.getFeeds(type, creatorId)
      } else {
        const getFeaturedFeeds = async () => {
          await FeedService.getFeeds('featured')
          if (type !== 'fired') {
            FeedService.getFeeds('fired', creatorId)
          }
        }

        const userIdentityType = auth.authUser?.identityProvider?.type?.value ?? 'guest'
        userIdentityType !== 'guest' ? getFeaturedFeeds() : FeedService.getFeeds('featuredGuest')
      }

      if (type !== 'fired') {
        setRemovedIds(new Set())
      }
    }
  }, [type, creatorId, auth.user.id.value, feedsState.feeds.feedsFetching.value, removeIdsStringify])

  useEffect(
    () =>
      (type === 'featured' || !type) &&
      feedsState.feeds.feedsFetching.value === false &&
      setFeedList(feedsState.feeds.feedsFeatured.value),
    [feedsState.feeds.feedsFetching.value, JSON.stringify(feedsState.feeds.feedsFeatured.value.values())]
  )

  useEffect(
    () =>
      (type === 'featured' || !type) &&
      feedsState.feeds.feedsFeaturedFetching.value === false &&
      setFeedList(feedsState.feeds.feedsFeatured.value),
    [feedsState.feeds.feedsFeaturedFetching.value, JSON.stringify(feedsState.feeds.feedsFeatured.value.values())]
  )

  useEffect(
    () =>
      type === 'creator' &&
      feedsState.feeds.feedsCreatorFetching.value === false &&
      setFeedList(feedsState.feeds.feedsCreator.value),
    [feedsState.feeds.feedsCreatorFetching.value, JSON.stringify(feedsState.feeds.feedsCreator.value.values())]
  )

  useEffect(
    () =>
      type === 'fired' &&
      feedsState.feeds.feedsFiredFetching.value === false &&
      setFeedList(feedsState.feeds.feedsFired.value),
    [feedsState.feeds.feedsFiredFetching.value, JSON.stringify(feedsState.feeds.feedsFired.value.values())]
  )
  const feedsFiredStringify = JSON.stringify(feedsState.feeds.feedsFired.value.values())
  useEffect(() => {
    typeof setIsFeatured === 'function' && setIsFeatured(!!feedsState.feeds.feedsFired.value?.length && removedIds.size)
  }, [feedsState.feeds.feedsFetching.value, feedsFiredStringify, removeIdsStringify])

  const handleAddToFeatured = (item) => {
    if (!feedIds.has(item)) {
      setFeedIds(new Set([...feedIds, item]))
      removedIds.delete(item)
      setRemovedIds(new Set([...removedIds]))
      FeedFiresService.addFireToFeed(item)
      setIsFeatured(true)
    }
  }

  const handleRemoveFromFeatured = (item) => {
    FeedFiresService.removeFireToFeed(item)
    let ids = new Set([...removedIds, item])
    setRemovedIds(ids)
    feedIds.delete(item)
    setFeedIds(new Set([...feedIds]))
  }
  return (
    <section className={styles.feedContainer}>
      <Grid container spacing={3} style={{ marginTop: 30 }}>
        {feedsList && feedsList.length > 0
          ? Array.from(feedsList.values())
              .filter((item) => item !== undefined)
              .map((item, itemIndex) => {
                return (
                  <Grid
                    item
                    {...gridValues[viewType]}
                    key={itemIndex}
                    className={type === 'fired' && removedIds.has(item.id) ? styles.gridItemDelete : styles.gridItem}
                  >
                    <div className={styles.squareCard}>
                      {!item.fired && !!!item?.isFired ? (
                        <AddCircleOutlinedIcon
                          className={styles.featuredButton}
                          onClick={() => handleAddToFeatured(item.id)}
                        />
                      ) : (
                        <RemoveCircleOutlinedIcon
                          onClick={() => handleRemoveFromFeatured(item.id)}
                          className={styles.featuredButton}
                        />
                      )}
                      <Card
                        className={styles.creatorItem + ' ' + (viewType === 'blog' ? styles.list : '')}
                        elevation={0}
                        key={itemIndex}
                        style={{
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          display: 'flex'
                        }}
                      >
                        <div className={styles.imageWrapper + ' ' + (viewType === 'blog' ? styles.imageList : '')}>
                          {getMediaPreviewIcon(item.previewType, {
                            className: `${styles.image} ${styles.mediaPreviewIcon}`,
                            onClick: () => {
                              history.push('/post?postId=' + item.id)
                            }
                          }) || (
                            <MediaContent
                              full={false}
                              className={styles.image}
                              item={item}
                              history={history}
                              addToRefs={addToRefs}
                            />
                          )}
                        </div>
                        <CardContent className={styles.cardContent}>
                          <span className={styles.descr}>{item.title}</span>
                        </CardContent>
                      </Card>
                    </div>
                  </Grid>
                )
              })
          : ''}
      </Grid>
    </section>
  )
}

export default Featured
