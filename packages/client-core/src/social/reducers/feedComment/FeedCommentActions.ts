/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { CommentInterface } from '@xrengine/common/src/interfaces/Comment'
import { CreatorShort } from '@xrengine/common/src/interfaces/Creator'

export const FeedCommentAction = {
  fetchingFeedComments: () => {
    return {
      type: 'FEED_COMMENTS_FETCH' as const
    }
  },
  feedsCommentsRetrieved: (comments: CommentInterface[]) => {
    return {
      type: 'FEED_COMMENTS_RETRIEVED' as const,
      comments
    }
  },
  addFeedCommentFire: (commentId: string) => {
    return {
      type: 'ADD_FEED_COMMENT_FIRES' as const,
      commentId: commentId
    }
  },
  removeFeedCommentFire: (commentId: string) => {
    return {
      type: 'REMOVE_FEED_COMMENT_FIRES' as const,
      commentId: commentId
    }
  },
  addFeedComment: (comment: CommentInterface) => {
    return {
      type: 'ADD_FEED_COMMENT' as const,
      comment
    }
  },
  commentFires: (creators: CreatorShort[]) => {
    return {
      type: 'COMMENT_FIRES' as const,
      creators
    }
  }
}

export type FeedCommentActionType = ReturnType<typeof FeedCommentAction[keyof typeof FeedCommentAction]>
