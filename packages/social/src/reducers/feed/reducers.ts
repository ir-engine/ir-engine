/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import {
  ADD_FEED,
  ADD_FEED_BOOKMARK,
  ADD_FEED_FEATURED,
  ADD_FEED_FIRES,
  ADD_FEED_VIEW,
  FEEDS_AS_ADMIN_RETRIEVED,
  FEEDS_BOOKMARK_RETRIEVED,
  FEEDS_CREATOR_RETRIEVED,
  FEATURED_FEEDS_FETCH,
  FEEDS_FEATURED_RETRIEVED,
  FEEDS_FETCH,
  FEEDS_MY_FEATURED_RETRIEVED,
  FEEDS_RETRIEVED,
  FEED_RETRIEVED,
  REMOVE_FEED_BOOKMARK,
  REMOVE_FEED_FEATURED,
  REMOVE_FEED_FIRES,
  UPDATE_FEED,
  CREATOR_FEEDS_FETCH,
  MY_FEATURED_FEEDS_FETCH,
  BOOKMARK_FEEDS_FETCH,
  ADMIN_FEEDS_FETCH,
  FIRED_FEEDS_FETCH,
  FEEDS_FIRED_RETRIEVED,
  CLEAR_CREATOR_FEATURED,
  DELETE_FEED,
  LAST_FEED_VIDEO_URL
} from '../actions'
import Immutable from 'immutable'
import { FeedRetrievedAction, FeedsAction, FeedsRetrievedAction, oneFeedAction } from './actions'

export const initialFeedState = {
  feeds: {
    feeds: [],
    feedsFetching: false,
    feedsFeatured: [],
    feedsFeaturedFetching: false,
    feedsCreator: [],
    feedsCreatorFetching: false,
    feedsBookmark: [],
    feedsBookmarkFetching: false,
    feedsFired: [],
    feedsFiredFetching: false,
    myFeatured: [],
    myFeaturedFetching: false,
    feed: {},
    fetching: false,
    feedsAdmin: [],
    feedsAdminFetching: false,
    lastvideoUrl: null
  }
}

const immutableState = Immutable.fromJS(initialFeedState)

const feedReducer = (state = immutableState, action: FeedsAction): any => {
  const currentFeed = state.get('feed')
  switch (action.type) {
    case FEEDS_FETCH:
      return state.set('feedsFetching', true)
    case FEATURED_FEEDS_FETCH:
      return state.set('feedsFeaturedFetching', true)
    case CREATOR_FEEDS_FETCH:
      return state.set('feedsCreatorFetching', true)
    case BOOKMARK_FEEDS_FETCH:
      return state.set('feedsBookmarkFetching', true)
    case MY_FEATURED_FEEDS_FETCH:
      return state.set('myFeaturedFetching', true)
    case FEEDS_FETCH:
      return state.set('fetching', true)
    case ADMIN_FEEDS_FETCH:
      return state.set('feedsAdminFetching', true)
    case FIRED_FEEDS_FETCH:
      return state.set('feedsFiredFetching', true)

    case FEEDS_RETRIEVED:
      return state.set('feeds', (action as FeedsRetrievedAction).feeds).set('feedsFetching', false)

    case FEEDS_FEATURED_RETRIEVED:
      return state.set('feedsFeatured', (action as FeedsRetrievedAction).feeds).set('feedsFeaturedFetching', false)

    case FEEDS_CREATOR_RETRIEVED:
      return state.set('feedsCreator', (action as FeedsRetrievedAction).feeds).set('feedsCreatorFetching', false)
    case CLEAR_CREATOR_FEATURED:
      return state.set('feedsCreator', []).set('feedsCreatorFetching', false)

    case FEEDS_MY_FEATURED_RETRIEVED:
      return state.set('myFeatured', (action as FeedsRetrievedAction).feeds).set('myFeaturedFetching', false)

    case FEEDS_BOOKMARK_RETRIEVED:
      return state.set('feedsBookmark', (action as FeedsRetrievedAction).feeds).set('feedsBookmarkFetching', false)

    case FEEDS_FIRED_RETRIEVED:
      return state.set('feedsFired', (action as FeedsRetrievedAction).feeds).set('feedsFiredFetching', false)

    case FEED_RETRIEVED:
      return state.set('feed', (action as FeedRetrievedAction).feed).set('fetching', false)

    case ADD_FEED_FIRES:
      return state
        .set(
          'feeds',
          state.get('feeds').map((feed) => {
            if (feed.id === (action as oneFeedAction).feedId) {
              return { ...feed, fires: ++feed.fires, isFired: true }
            }
            return { ...feed }
          })
        )
        .set('feed', currentFeed ? { ...currentFeed, fires: ++currentFeed.fires, isFired: true } : {})

    case REMOVE_FEED_FIRES:
      return state
        .set(
          'feeds',
          state.get('feeds').map((feed) => {
            if (feed.id === (action as oneFeedAction).feedId) {
              return { ...feed, fires: feed.fires - 1, isFired: false }
            }
            return { ...feed }
          })
        )
        .set('feed', currentFeed ? { ...currentFeed, fires: --currentFeed.fires, isFired: false } : {})

    case ADD_FEED_BOOKMARK:
      return state
        .set(
          'feeds',
          state.get('feeds').map((feed) => {
            if (feed.id === (action as oneFeedAction).feedId) {
              return { ...feed, isBookmarked: true }
            }
            return { ...feed }
          })
        )
        .set('feed', currentFeed ? { ...currentFeed, isBookmarked: true } : {})

    case REMOVE_FEED_BOOKMARK:
      return state
        .set(
          'feeds',
          state.get('feeds').map((feed) => {
            if (feed.id === (action as oneFeedAction).feedId) {
              return { ...feed, isBookmarked: false }
            }
            return { ...feed }
          })
        )
        .set('feed', currentFeed ? { ...currentFeed, isBookmarked: false } : {})

    case ADD_FEED_VIEW:
      return state
        .set(
          'feedsFeatured',
          state.get('feedsFeatured')?.map((feed) => {
            if (feed.id === (action as oneFeedAction).feedId) {
              return { ...feed, viewsCount: ++feed.viewsCount }
            }
            return { ...feed }
          })
        )
        .set('feed', currentFeed ? { ...currentFeed, viewsCount: ++currentFeed.viewsCount } : {})
    case ADD_FEED:
      return state
        .set('feeds', [...state.get('feeds'), (action as FeedRetrievedAction).feed])
        .set('feedsFetching', false)

    case ADD_FEED_FEATURED:
      return state.set(
        'feedsCreator',
        state.get('feedsCreator').map((feed) => {
          if (feed.id === (action as oneFeedAction).feedId) {
            return { ...feed, featured: true }
          }
          return { ...feed }
        })
      )

    case REMOVE_FEED_FEATURED:
      const myFeatured = state.get('myFeatured')
      return state
        .set(
          'feedsCreator',
          state.get('feedsCreator').map((feed) => {
            if (feed.id === (action as oneFeedAction).feedId) {
              return { ...feed, featured: false }
            }
            return { ...feed }
          })
        )
        .set(
          'myFeatured',
          myFeatured
            ? myFeatured.splice(
                myFeatured.findIndex((item) => item.id === (action as oneFeedAction).feedId),
                1
              )
            : []
        )

    case FEEDS_AS_ADMIN_RETRIEVED:
      return state.set('feedsAdmin', (action as FeedsRetrievedAction).feeds).set('fetching', false)

    case UPDATE_FEED:
      return state
        .set(
          'feedsAdmin',
          state.get('feedsAdmin').map((feed) => {
            if (feed.id === (action as FeedRetrievedAction).feed.id) {
              return { ...feed, ...(action as FeedRetrievedAction).feed }
            }
            return { ...feed }
          })
        )
        .set('feedsAdminFetching', false)

    case DELETE_FEED:
      return state.set('feedsFeatured', [
        ...state.get('feedsFeatured').filter((feed) => feed.id !== (action as FeedRetrievedAction).feed)
      ])

    case LAST_FEED_VIDEO_URL:
      return state.set('lastFeedVideoUrl', (action as oneFeedAction).feedId)
  }

  return state
}

export default feedReducer
