/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import {
  FEEDS_RETRIEVED,
  FEED_RETRIEVED,
  FEEDS_FETCH,
  FEEDS_FEATURED_RETRIEVED,
  ADD_FEED_FIRES,
  REMOVE_FEED_FIRES,
  ADD_FEED_BOOKMARK,
  REMOVE_FEED_BOOKMARK,
  ADD_FEED_VIEW,
  ADD_FEED,
  FEEDS_CREATOR_RETRIEVED,
  FEEDS_BOOKMARK_RETRIEVED,
  FEEDS_MY_FEATURED_RETRIEVED,
  ADD_FEED_FEATURED,
  REMOVE_FEED_FEATURED,
  FEEDS_AS_ADMIN_RETRIEVED,
  UPDATE_FEED,
  FEATURED_FEEDS_FETCH,
  CREATOR_FEEDS_FETCH,
  BOOKMARK_FEEDS_FETCH,
  MY_FEATURED_FEEDS_FETCH,
  ADMIN_FEEDS_FETCH,
  FIRED_FEEDS_FETCH,
  FEEDS_FIRED_RETRIEVED,
  CLEAR_CREATOR_FEATURED,
  DELETE_FEED,
  LAST_FEED_VIDEO_URL,
  ADD_FEED_REPORT
} from '../actions'
import { FeedShort, Feed } from '@xrengine/common/src/interfaces/Feed'

export interface FeedsRetrievedAction {
  type: string
  feeds: FeedShort[]
}

export interface FeedRetrievedAction {
  type: string
  feed: Feed
}

export interface FetchingFeedsAction {
  type: string
}

export interface oneFeedAction {
  type: string
  feedId: string
}

export type FeedsAction = FeedsRetrievedAction | FeedRetrievedAction | FetchingFeedsAction | oneFeedAction

export function feedsRetrieved(feeds: Feed[]): FeedsRetrievedAction {
  return {
    type: FEEDS_RETRIEVED,
    feeds: feeds
  }
}

export function feedsFeaturedRetrieved(feeds: FeedShort[]): FeedsRetrievedAction {
  return {
    type: FEEDS_FEATURED_RETRIEVED,
    feeds: feeds
  }
}

export function feedsCreatorRetrieved(feeds: FeedShort[]): FeedsRetrievedAction {
  return {
    type: FEEDS_CREATOR_RETRIEVED,
    feeds: feeds
  }
}

export function feedsBookmarkRetrieved(feeds: FeedShort[]): FeedsRetrievedAction {
  return {
    type: FEEDS_BOOKMARK_RETRIEVED,
    feeds: feeds
  }
}

export function feedsFiredRetrieved(feeds: FeedShort[]): FeedsRetrievedAction {
  return {
    type: FEEDS_FIRED_RETRIEVED,
    feeds: feeds
  }
}

export function feedsMyFeaturedRetrieved(feeds: FeedShort[]): FeedsRetrievedAction {
  return {
    type: FEEDS_MY_FEATURED_RETRIEVED,
    feeds: feeds
  }
}

export function feedRetrieved(feed: Feed): FeedRetrievedAction {
  return {
    type: FEED_RETRIEVED,
    feed: feed
  }
}

export function fetchingFeeds(): FetchingFeedsAction {
  return {
    type: FEEDS_FETCH
  }
}

export function fetchingFeaturedFeeds(): FetchingFeedsAction {
  return {
    type: FEATURED_FEEDS_FETCH
  }
}

export function fetchingCreatorFeeds(): FetchingFeedsAction {
  return {
    type: CREATOR_FEEDS_FETCH
  }
}

export function fetchingBookmarkedFeeds(): FetchingFeedsAction {
  return {
    type: BOOKMARK_FEEDS_FETCH
  }
}

export function fetchingFiredFeeds(): FetchingFeedsAction {
  return {
    type: FIRED_FEEDS_FETCH
  }
}

export function fetchingMyFeaturedFeeds(): FetchingFeedsAction {
  return {
    type: MY_FEATURED_FEEDS_FETCH
  }
}

export function fetchingAdminFeeds(): FetchingFeedsAction {
  return {
    type: ADMIN_FEEDS_FETCH
  }
}

export function addFeedFire(feedId: string): oneFeedAction {
  return {
    type: ADD_FEED_FIRES,
    feedId: feedId
  }
}

export function feedAsFeatured(feedId: string): oneFeedAction {
  return {
    type: ADD_FEED_FEATURED,
    feedId: feedId
  }
}

export function feedNotFeatured(feedId: string): oneFeedAction {
  return {
    type: REMOVE_FEED_FEATURED,
    feedId: feedId
  }
}
export function removeFeedFire(feedId: string): oneFeedAction {
  return {
    type: REMOVE_FEED_FIRES,
    feedId
  }
}

export function addFeedBookmark(feedId: string): oneFeedAction {
  return {
    type: ADD_FEED_BOOKMARK,
    feedId: feedId
  }
}

export function removeFeedBookmark(feedId: string): oneFeedAction {
  return {
    type: REMOVE_FEED_BOOKMARK,
    feedId
  }
}

export function addFeedView(feedId: string): oneFeedAction {
  return {
    type: ADD_FEED_VIEW,
    feedId: feedId
  }
}

export function deleteFeed(feedId: string): oneFeedAction {
  return {
    type: DELETE_FEED,
    feedId: feedId
  }
}

export function addFeed(feed: Feed): FeedRetrievedAction {
  return {
    type: ADD_FEED,
    feed: feed
  }
}

export function feedsAdminRetrieved(feeds: any[]): FeedsRetrievedAction {
  return {
    type: FEEDS_AS_ADMIN_RETRIEVED,
    feeds: feeds
  }
}

export function updateFeedInList(feed: Feed): FeedRetrievedAction {
  return {
    type: UPDATE_FEED,
    feed
  }
}

export function reduxClearCreatorFeatured(): FetchingFeedsAction {
  return {
    type: CLEAR_CREATOR_FEATURED
  }
}

export function lastFeedVideoUrl(filePath): oneFeedAction {
  return {
    type: LAST_FEED_VIDEO_URL,
    feedId: filePath
  }
}

export function addFeedReport(feedId: string): oneFeedAction {
  return {
    type: ADD_FEED_REPORT,
    feedId: feedId
  }
}
