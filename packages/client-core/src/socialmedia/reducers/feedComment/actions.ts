import {
  FEED_COMMENTS_RETRIEVED,
  FEED_COMMENTS_FETCH,
  ADD_FEED_COMMENT_FIRES,
  REMOVE_FEED_COMMENT_FIRES,
  ADD_FEED_COMMENT,
  COMMENT_FIRES
} from '../actions';

import { CommentInterface } from '@xr3ngine/common/interfaces/Comment';
import { CreatorShort } from '@xr3ngine/common/interfaces/Creator';

export interface FeedCommentsRetrievedAction {
  type: string;
  comments: CommentInterface[];
}

export interface FeedCommentsRetrievedAction {
  type: string;
  comments: CommentInterface[];
}

export interface FetchingFeedCommentsAction {
  type: string;
}

export interface AddFeedCommentFiresAction{
  type: string;
  commentId: string;
}

export interface AddFeedCommentAction{
  type: string;
  comment: CommentInterface;
}

export interface CommentFiresRetrievedAction {
  type: string;
  creators: CreatorShort[];
}

export type FeedCommentsAction =
FeedCommentsRetrievedAction
  | FetchingFeedCommentsAction
  | AddFeedCommentAction
  | CommentFiresRetrievedAction

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


export function addFeedCommentFire (commentId:string) : AddFeedCommentFiresAction{
  return {
    type: ADD_FEED_COMMENT_FIRES,
    commentId: commentId
  };
} 

export function removeFeedCommentFire (commentId:string) : AddFeedCommentFiresAction{
  return {
    type: REMOVE_FEED_COMMENT_FIRES,
    commentId: commentId
  };
} 

export function addFeedComment (comment : CommentInterface) : AddFeedCommentAction{
  return {
    type: ADD_FEED_COMMENT,
    comment
  };
}

export function commentFires (creators : CreatorShort[]) : CommentFiresRetrievedAction{
  return {
    type: COMMENT_FIRES,
    creators
  };
}
