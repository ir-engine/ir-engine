import { FEEDS_ADMIN_RETRIEVED, ADMIN_FEEDS_FETCH, ADD_AS_ADMIN_FEED, REMOVE_FEED } from '../../../actions'
import { FeedShort, Feed } from '@xrengine/common/src/interfaces/Feed'

export interface FeedRetrievedAction {
  type: string
  feed: Feed
}

export interface FeedsRetrievedAction {
  type: string
  feeds: FeedShort[]
}

export interface FetchingFeedsAction {
  type: string
}

export interface FetchingFeedItemAction {
  type: string
  id: string
}

export function fetchingAdminFeeds(): FetchingFeedsAction {
  return {
    type: ADMIN_FEEDS_FETCH
  }
}

export function feedsAdminRetrieved(feeds: any[]): FeedsRetrievedAction {
  return {
    type: FEEDS_ADMIN_RETRIEVED,
    feeds: feeds
  }
}

export function addFeed(feed: Feed): FeedRetrievedAction {
  return {
    type: ADD_AS_ADMIN_FEED,
    feed: feed
  }
}

export function removeFeed(id): FetchingFeedItemAction {
  return {
    type: REMOVE_FEED,
    id
  }
}
