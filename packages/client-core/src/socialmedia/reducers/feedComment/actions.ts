/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { CommentInterface } from '@xrengine/common/src/interfaces/Comment'
import { CreatorShort } from '@xrengine/common/src/interfaces/Creator'
import {
  ADD_FEED_COMMENT,
  ADD_FEED_COMMENT_FIRES,
  COMMENT_FIRES,
  FEED_COMMENTS_FETCH,
  REMOVE_FEED_COMMENT_FIRES
} from '../actions'

export interface FeedCommentsRetrievedAction {
  type: string
  comments: CommentInterface[]
}

export interface FeedCommentsRetrievedAction {
  type: string
  comments: CommentInterface[]
}

export interface FetchingFeedCommentsAction {
  type: string
}

export interface AddFeedCommentFiresAction {
  type: string
  commentId: string
}

export interface AddFeedCommentAction {
  type: string
  comment: CommentInterface
}

export interface CommentFiresRetrievedAction {
  type: string
  creators: CreatorShort[]
}

export type FeedCommentsAction =
  | FeedCommentsRetrievedAction
  | FetchingFeedCommentsAction
  | AddFeedCommentAction
  | CommentFiresRetrievedAction

export function fetchingFeedComments(): FetchingFeedCommentsAction {
  return {
    type: FEED_COMMENTS_FETCH
  }
}

export function addFeedCommentFire(commentId: string): AddFeedCommentFiresAction {
  return {
    type: ADD_FEED_COMMENT_FIRES,
    commentId: commentId
  }
}

export function removeFeedCommentFire(commentId: string): AddFeedCommentFiresAction {
  return {
    type: REMOVE_FEED_COMMENT_FIRES,
    commentId: commentId
  }
}

export function addFeedComment(comment: CommentInterface): AddFeedCommentAction {
  return {
    type: ADD_FEED_COMMENT,
    comment
  }
}

export function commentFires(creators: CreatorShort[]): CommentFiresRetrievedAction {
  return {
    type: COMMENT_FIRES,
    creators
  }
}
