import {
  FEED_COMMENTS_RETRIEVED,
  FEED_COMMENTS_FETCH,
} from '../actions';

export interface FeedCommentsRetrievedAction {
  type: string;
  comments: [];
}

export interface FetchingFeedCommentsAction {
  type: string;
}


export type FeedCommentsAction =
FeedCommentsRetrievedAction
  | FetchingFeedCommentsAction

export function feedsRetrieved (comments: []): FeedCommentsRetrievedAction {
  return {
    type: FEED_COMMENTS_RETRIEVED,
    comments: comments
  };
}

export function fetchingFeedComments (): FetchingFeedCommentsAction {
  return {
    type: FEED_COMMENTS_FETCH
  };
}
