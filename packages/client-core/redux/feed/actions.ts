import {
  FEEDS_RETRIEVED,
  FEED_RETRIEVED,
  FEEDS_FETCH,
  FEEDS_FEATURED_RETRIEVED
} from '../actions';
import { FeedShord, Feed } from '@xr3ngine/common/interfaces/Feed';

export interface FeedsRetrievedAction {
  type: string;
  feeds: FeedShord[];
}

export interface FeedRetrievedAction {
  type: string;
  feed: Feed;
}

export interface FetchingFeedsAction {
  type: string;
}
export type FeedsAction =
FeedsRetrievedAction
  | FeedRetrievedAction
  | FetchingFeedsAction

export function feedsRetrieved (feeds: Feed[]): FeedsRetrievedAction {
  return {
    type: FEEDS_RETRIEVED,
    feeds: feeds
  };
}

export function feedsFeaturedRetrieved (feeds: FeedShord[]): FeedsRetrievedAction {
  return {
    type: FEEDS_FEATURED_RETRIEVED,
    feeds: feeds
  };
}

export function feedRetrieved (feed: Feed): FeedRetrievedAction {
  return {
    type: FEED_RETRIEVED,
    feed: feed
  };
}


export function fetchingFeeds (): FetchingFeedsAction {
  return {
    type: FEEDS_FETCH
  };
}

