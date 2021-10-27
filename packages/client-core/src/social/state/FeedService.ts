/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { store, useDispatch } from '../../store'
import { AlertService } from '../../common/state/AlertService'
import { client } from '../../feathers'
import { accessAuthState } from '../../user/state/AuthState'
import { upload } from '../../util/upload'
import { FeedShort, Feed, FeedResult } from '@xrengine/common/src/interfaces/Feed'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'

//State
const state = createState({
  feeds: {
    feeds: [] as Array<Feed>,
    feedsFetching: false,
    feedsFeatured: [] as Array<FeedShort>,
    feedsFeaturedFetching: false,
    feedsCreator: [] as Array<FeedShort>,
    feedsCreatorFetching: false,
    feedsBookmark: [] as Array<FeedShort>,
    feedsBookmarkFetching: false,
    feedsFired: [] as Array<FeedShort>,
    feedsFiredFetching: false,
    myFeatured: [] as Array<FeedShort>,
    myFeaturedFetching: false,
    feed: {},
    fetching: false,
    feedsAdmin: {
      feeds: [] as Array<Feed>,
      updateNeeded: true,
      lastFetched: Date.now()
    },
    feedsAdminFetching: false,
    lastFeedVideoUrl: null
  }
})

store.receptors.push((action: FeedActionType): any => {
  state.batch((s) => {
    let currentFeed
    switch (action.type) {
      case 'FEEDS_FETCH':
        s.feeds.feedsFetching.set(true)
        return s.feeds.fetching.set(true)
      case 'FEATURED_FEEDS_FETCH':
        return s.feeds.feedsFeaturedFetching.set(true)
      case 'CREATOR_FEEDS_FETCH':
        return s.feeds.feedsCreatorFetching.set(true)
      case 'BOOKMARK_FEEDS_FETCH':
        return s.feeds.feedsBookmarkFetching.set(true)
      case 'MY_FEATURED_FEEDS_FETCH':
        return s.feeds.myFeaturedFetching.set(true)
      case 'ADMIN_FEEDS_FETCH':
        return s.feeds.feedsAdminFetching.set(true)
      case 'FIRED_FEEDS_FETCH':
        return s.feeds.feedsFiredFetching.set(true)

      case 'FEEDS_RETRIEVED':
        return s.feeds.merge({ feeds: action.feeds, feedsFetching: false })

      case 'FEEDS_FEATURED_RETRIEVED':
        return s.feeds.merge({ feedsFeatured: action.feeds, feedsFeaturedFetching: false })

      case 'FEEDS_CREATOR_RETRIEVED':
        return s.feeds.merge({ feedsCreator: action.feeds, feedsCreatorFetching: false })
      case 'CLEAR_CREATOR_FEATURED':
        return s.feeds.merge({ feedsCreator: [], feedsCreatorFetching: false })
      case 'FEEDS_MY_FEATURED_RETRIEVED':
        return s.feeds.merge({ myFeatured: action.feeds, myFeaturedFetching: false })
      case 'FEEDS_BOOKMARK_RETRIEVED':
        return s.feeds.merge({ feedsBookmark: action.feeds, feedsBookmarkFetching: false })
      case 'FEEDS_FIRED_RETRIEVED':
        return s.feeds.merge({ feedsFired: action.feeds, feedsFiredFetching: false })

      case 'FEED_RETRIEVED':
        return s.feeds.merge({ feed: action.feed, fetching: false })

      case 'ADD_FEED_FIRES':
        currentFeed = s.feeds.feed?.value
        return s.feeds.merge({
          feedsFeatured: s.feeds.feedsFeatured.value.map((feed) => {
            if (feed.id === action.feedId) {
              return { ...feed, fires: feed.fires.values + 1, isFired: true }
            }
            return { ...feed }
          })
        })
        return s.feeds.feed.set(currentFeed ? { ...currentFeed, fires: ++currentFeed.fires, isFired: true } : {})
      case 'REMOVE_FEED_FIRES':
        currentFeed = s.feeds.feed?.value
        s.feeds.feeds.set(
          s.feeds.feeds.value.map((feed) => {
            if (feed.id === action.feedId) {
              return { ...feed, fires: feed.fires - 1, isFired: false }
            }
            return { ...feed }
          })
        )
        return s.feeds.feed.set(currentFeed ? { ...currentFeed, fires: currentFeed.fires - 1, isFired: false } : {})
      case 'ADD_FEED_BOOKMARK':
        currentFeed = s.feeds.feed?.value
        s.feeds.feeds.set(
          s.feeds.feeds.value.map((feed) => {
            if (feed.id === action.feedId) {
              return { ...feed, isBookmarked: true }
            }
            return { ...feed }
          })
        )
        return s.feeds.feed.set(currentFeed ? { ...currentFeed, isBookmarked: true } : {})

      case 'REMOVE_FEED_BOOKMARK':
        currentFeed = s.feeds.feed?.value
        s.feeds.feeds.set(
          s.feeds.feeds.value.map((feed) => {
            if (feed.id === action.feedId) {
              return { ...feed, isBookmarked: false }
            }
            return { ...feed }
          })
        )
        return s.feeds.feed.set(currentFeed ? { ...currentFeed, isBookmarked: false } : {})

      case 'ADD_FEED_VIEW':
        s.feeds.feedsFeatured.set(
          s.feeds.feedsFeatured?.value?.map((feed) => {
            if (feed.id === action.feedId) {
              return { ...feed, viewsCount: ++feed.viewsCount }
            }
            return { ...feed }
          })
        )
        return s.feeds.feed.set(currentFeed ? { ...currentFeed, viewsCount: ++currentFeed.viewsCount } : {})
      case 'ADD_FEED':
        s.feeds.feeds.set([...s.feeds.feeds.value, action.feed])
        return s.feeds.feedsFetching.set(false)

      case 'ADD_FEED_FEATURED':
        return s.feeds.feedsCreator.set(
          s.feeds.feedsCreator.value.map((feed) => {
            if (feed.id === action.feedId) {
              return { ...feed, featured: true }
            }
            return { ...feed }
          })
        )
      case 'REMOVE_FEED_FEATURED':
        const myFeatured = state.feeds.myFeatured.value
        s.feeds.feedsCreator.set(
          s.feeds.feedsCreator.value.map((feed) => {
            if (feed.id === action.feedId) {
              return { ...feed, featured: false }
            }
            return { ...feed }
          })
        )
        return s.feeds.myFeatured.set(
          myFeatured
            ? [
                ...myFeatured.splice(
                  myFeatured.findIndex((item) => item.id === action.feedId),
                  1
                )
              ]
            : []
        )

      case 'FEEDS_AS_ADMIN_RETRIEVED':
        const result = action.feeds

        s.feeds.feedsAdmin.merge({ feeds: result.data, updateNeeded: false, lastFetched: Date.now() })
        return s.feeds.fetching.set(false)

      case 'UPDATE_FEED':
        s.feeds.feedsAdmin.feeds.set(
          s.feeds.feedsAdmin.feeds.value.map((feed) => {
            if (feed.id === action.feed.id) {
              return { ...feed, ...action.feed }
            }
            return { ...feed }
          })
        )

        return s.feeds.feedsAdminFetching.set(false)
      case 'DELETE_FEED':
        return s.feeds.feedsFeatured.set([
          ...s.feeds.feedsFeatured.value.values().filter((feed) => feed.id !== action.feedId)
        ])

      case 'LAST_FEED_VIDEO_URL':
        return s.feeds.lastFeedVideoUrl.set(action.filePath)
    }
  }, action.type)
})

export const accessFeedState = () => state
export const useFeedState = () => useState(state)

//Sevice
export const FeedService = {
  getFeeds: async (type: string, id?: string, limit?: number) => {
    const dispatch = useDispatch()
    {
      try {
        const feedsResults = []
        if (type && (type === 'featured' || type === 'featuredGuest')) {
          dispatch(FeedAction.fetchingFeaturedFeeds())
          const feedsResults = await client.service('feed').find({
            query: {
              action: type
            }
          })
          dispatch(FeedAction.feedsFeaturedRetrieved(feedsResults.data))
        } else if (type && type === 'creator') {
          dispatch(FeedAction.fetchingCreatorFeeds())
          const feedsResults = await client.service('feed').find({
            query: {
              action: 'creator',
              creatorId: id
            }
          })
          dispatch(FeedAction.feedsCreatorRetrieved(feedsResults.data))
        } else if (type && type === 'fired') {
          dispatch(FeedAction.fetchingFiredFeeds())
          const feedsResults = await client.service('feed').find({
            query: {
              action: 'fired',
              creatorId: id
            }
          })
          dispatch(FeedAction.feedsFiredRetrieved(feedsResults.data))
        } else if (type && type === 'bookmark') {
          dispatch(FeedAction.fetchingBookmarkedFeeds())
          const feedsResults = await client.service('feed').find({
            query: {
              action: 'bookmark',
              creatorId: id
            }
          })
          dispatch(FeedAction.feedsBookmarkRetrieved(feedsResults.data))
        } else if (type && type === 'myFeatured') {
          dispatch(FeedAction.fetchingMyFeaturedFeeds())
          const feedsResults = await client.service('feed').find({
            query: {
              action: 'myFeatured',
              creatorId: id
            }
          })
          dispatch(FeedAction.feedsMyFeaturedRetrieved(feedsResults.data))
        } else if (type && type === 'admin') {
          const user = accessAuthState().user
          if (user.userRole.value === 'admin') {
            dispatch(FeedAction.fetchingAdminFeeds())
            const feedsResults = await client.service('feed').find({
              query: {
                action: 'admin'
              }
            })
            dispatch(FeedAction.feedsAdminRetrieved(feedsResults))
          }
        } else {
          const feedsResults = await client.service('feed').find({ query: { action: type || '' } })
          dispatch(FeedAction.feedsRetrieved(feedsResults.data))
        }
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  getFeed: async (feedId: string) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(FeedAction.fetchingFeeds())
        const feed = await client.service('feed').get(feedId)
        dispatch(FeedAction.feedRetrieved(feed))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  addViewToFeed: async (feedId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('feed').patch(feedId, { viewsCount: feedId })
        dispatch(FeedAction.addFeedView(feedId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  createFeed: async ({ title, description, video, preview }: any) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(FeedAction.fetchingFeeds())
        const storedVideo = (await upload(video, null)) as any
        const storedPreview = (await upload(preview, null)) as any

        if (storedVideo && storedPreview) {
          const feed = await client
            .service('feed')
            .create({ title, description, videoId: storedVideo.file_id, previewId: storedPreview.file_id })
          dispatch(FeedAction.addFeed(feed))
          const mediaLinks = { video: storedVideo.origin, preview: storedPreview.origin }
          return mediaLinks
        }
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  updateFeedAsAdmin: async (feedId: string, feed: any) => {
    const dispatch = useDispatch()
    {
      try {
        if (feed.video) {
          const storedVideo = await upload(feed.video, null)
          feed.videoId = (storedVideo as any).file_id
          delete feed.video
        }
        if (feed.preview) {
          const storedPreview = await upload(feed.preview, null)
          feed.previewId = (storedPreview as any).file_id
          delete feed.preview
        }
        const updatedFeed = await client.service('feed').patch(feedId, feed)
        dispatch(FeedAction.updateFeedInList(updatedFeed))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  setFeedAsFeatured: async (feedId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('feed').patch(feedId, { featured: 1 })
        dispatch(FeedAction.feedAsFeatured(feedId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  setFeedNotFeatured: async (feedId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('feed').patch(feedId, { featured: 0 })
        dispatch(FeedAction.feedNotFeatured(feedId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  removeFeed: async (feedId: string, previewImageUrl: string, videoUrl: string) => {
    const dispatch = useDispatch()
    {
      try {
        const findIdInUrl = (url) => {
          const urlSplit = url.split('/')
          return urlSplit.sort((a, b) => {
            return b.length - a.length
          })[0]
        }

        await client.service('static-resource').remove(findIdInUrl(previewImageUrl))
        await client.service('static-resource').remove(findIdInUrl(videoUrl))
        await client.service('feed').remove(feedId)
        dispatch(FeedAction.deleteFeed(feedId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  clearCreatorFeatured: async () => {
    const dispatch = useDispatch()
    {
      dispatch(FeedAction.reduxClearCreatorFeatured())
    }
  },
  setLastFeedVideoUrl: async (filepath: string) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(FeedAction.lastFeedVideoUrl(filepath))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}

//Action
export const FeedAction = {
  feedsRetrieved: (feeds: Feed[]) => {
    return {
      type: 'FEEDS_RETRIEVED' as const,
      feeds: feeds
    }
  },
  feedsFeaturedRetrieved: (feeds: FeedShort[]) => {
    return {
      type: 'FEEDS_FEATURED_RETRIEVED' as const,
      feeds: feeds
    }
  },
  feedsCreatorRetrieved: (feeds: FeedShort[]) => {
    return {
      type: 'FEEDS_CREATOR_RETRIEVED' as const,
      feeds: feeds
    }
  },
  feedsBookmarkRetrieved: (feeds: FeedShort[]) => {
    return {
      type: 'FEEDS_BOOKMARK_RETRIEVED' as const,
      feeds: feeds
    }
  },
  feedsFiredRetrieved: (feeds: FeedShort[]) => {
    return {
      type: 'FEEDS_FIRED_RETRIEVED' as const,
      feeds: feeds
    }
  },
  feedsMyFeaturedRetrieved: (feeds: FeedShort[]) => {
    return {
      type: 'FEEDS_MY_FEATURED_RETRIEVED' as const,
      feeds: feeds
    }
  },
  feedRetrieved: (feed: Feed) => {
    return {
      type: 'FEED_RETRIEVED' as const,
      feed: feed
    }
  },
  fetchingFeeds: () => {
    return {
      type: 'FEEDS_FETCH' as const
    }
  },
  fetchingFeaturedFeeds: () => {
    return {
      type: 'FEATURED_FEEDS_FETCH' as const
    }
  },
  fetchingCreatorFeeds: () => {
    return {
      type: 'CREATOR_FEEDS_FETCH' as const
    }
  },
  fetchingBookmarkedFeeds: () => {
    return {
      type: 'BOOKMARK_FEEDS_FETCH' as const
    }
  },
  fetchingFiredFeeds: () => {
    return {
      type: 'FIRED_FEEDS_FETCH' as const
    }
  },
  fetchingMyFeaturedFeeds: () => {
    return {
      type: 'MY_FEATURED_FEEDS_FETCH' as const
    }
  },
  fetchingAdminFeeds: () => {
    return {
      type: 'ADMIN_FEEDS_FETCH' as const
    }
  },
  addFeedFire: (feedId: string) => {
    return {
      type: 'ADD_FEED_FIRES' as const,
      feedId: feedId
    }
  },
  feedAsFeatured: (feedId: string) => {
    return {
      type: 'ADD_FEED_FEATURED' as const,
      feedId: feedId
    }
  },
  feedNotFeatured: (feedId: string) => {
    return {
      type: 'REMOVE_FEED_FEATURED' as const,
      feedId: feedId
    }
  },
  removeFeedFire: (feedId: string) => {
    return {
      type: 'REMOVE_FEED_FIRES' as const,
      feedId
    }
  },
  addFeedBookmark: (feedId: string) => {
    return {
      type: 'ADD_FEED_BOOKMARK' as const,
      feedId: feedId
    }
  },
  removeFeedBookmark: (feedId: string) => {
    return {
      type: 'REMOVE_FEED_BOOKMARK' as const,
      feedId
    }
  },
  addFeedView: (feedId: string) => {
    return {
      type: 'ADD_FEED_VIEW' as const,
      feedId: feedId
    }
  },
  deleteFeed: (feedId: string) => {
    return {
      type: 'DELETE_FEED' as const,
      feedId: feedId
    }
  },
  addFeed: (feed: Feed) => {
    return {
      type: 'ADD_FEED' as const,
      feed: feed
    }
  },
  feedsAdminRetrieved: (feeds: FeedResult) => {
    return {
      type: 'FEEDS_AS_ADMIN_RETRIEVED' as const,
      feeds: feeds
    }
  },
  updateFeedInList: (feed: Feed) => {
    return {
      type: 'UPDATE_FEED' as const,
      feed
    }
  },
  reduxClearCreatorFeatured: () => {
    return {
      type: 'CLEAR_CREATOR_FEATURED' as const
    }
  },
  lastFeedVideoUrl: (filePath) => {
    return {
      type: 'LAST_FEED_VIDEO_URL' as const,
      filePath: filePath
    }
  },
  addFeedReport: (feedId: string) => {
    return {
      type: 'ADD_FEED_REPORT' as const,
      feedId: feedId
    }
  },
  addFeedLike: (feedId: string) => {
    return {
      type: 'ADD_FEED_LIKES' as const,
      feedId: feedId
    }
  },
  removeFeedLike: (feedId: string) => {
    return {
      type: 'REMOVE_FEED_LIKES' as const,
      feedId
    }
  }
}

export type FeedActionType = ReturnType<typeof FeedAction[keyof typeof FeedAction]>
