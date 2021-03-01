import {
  FEED_FIRES_RETRIEVED,
  FEED_FIRES_FETCH
} from '../actions';
import { CreatorShort } from '@xr3ngine/common/interfaces/Creator';

export interface FeedFiresRetriveAction {
  type: string;
  feedFires: CreatorShort[];
}

export interface FetchingFeedFiresAction {
  type: string;
}
export type FeedFiresAction =
FeedFiresRetriveAction
| FetchingFeedFiresAction

export function feedFiresRetrieved (feedFires: CreatorShort[]): FeedFiresRetriveAction {
  return {
    type: FEED_FIRES_RETRIEVED,
    feedFires: feedFires
  };
}


export function fetchingFeedFires (): FetchingFeedFiresAction {
  return {
    type: FEED_FIRES_FETCH
  };
}

