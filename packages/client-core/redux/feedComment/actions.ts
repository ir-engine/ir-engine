import {
  FEED_COMMENTS_RETRIEVED,
  FEED_COMMENTS_FETCH,
} from '../actions';

import { CommentInterface } from '@xr3ngine/common/interfaces/Comment';

export interface FeedCommentsRetrievedAction {
  type: string;
  comments: CommentInterface[];
}

export interface FetchingFeedCommentsAction {
  type: string;
}


export type FeedCommentsAction =
FeedCommentsRetrievedAction
  | FetchingFeedCommentsAction

export function feedsRetrieved (comments: CommentInterface[]): FeedCommentsRetrievedAction {
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
