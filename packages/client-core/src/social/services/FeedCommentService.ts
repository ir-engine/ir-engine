/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { store, useDispatch } from '../../store'
import { AlertService } from '../../common/services/AlertService'
import { client } from '../../feathers'
import { CommentInterface } from '@xrengine/common/src/interfaces/Comment'
import { CreatorShort } from '@xrengine/common/src/interfaces/Creator'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'

//State
const state = createState({
  feeds: {
    feedComments: [] as Array<CommentInterface>,
    commentFires: [] as Array<CreatorShort>,
    fetching: false
  }
})

store.receptors.push((action: FeedCommentActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'FEED_COMMENTS_FETCH':
        return s.feeds.fetching.set(true)
      case 'FEED_COMMENTS_RETRIEVED':
        return s.feeds.merge({ feedComments: action.comments || [], fetching: false })
      case 'ADD_FEED_COMMENT_FIRES':
        return s.feeds.feedComments.set(
          s.feeds.feedComments.value.map((item) => {
            if (item.id === action.commentId) {
              return { ...item, fires: item.fires + 1, isFired: true }
            }
            return { ...item }
          })
        )
      case 'REMOVE_FEED_COMMENT_FIRES':
        return s.feeds.feedComments.set(
          s.feeds.feedComments.value.map((item) => {
            if (item.id === action.commentId) {
              return { ...item, fires: --item.fires, isFired: false }
            }
            return { ...item }
          })
        )
      case 'ADD_FEED_COMMENT':
        return s.feeds.feedComments.set([action.comment, ...(s.feeds.feedComments.value || [])])

      case 'COMMENT_FIRES':
        return s.feeds.commentFires.set(action.creators)
    }
  }, action.type)
})

export const accessFeedCommentsState = () => state
export const useFeedCommentsState = () => useState(state)

//Service
export const FeedCommentService = {
  getFeedComments: async (feedId: string, limit?: number) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(FeedCommentAction.fetchingFeedComments())
        const comments = await client.service('comments').find({ query: { feedId } })
        dispatch(FeedCommentAction.feedsCommentsRetrieved(comments.data))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  addCommentToFeed: async (feedId: string, text: string) => {
    const dispatch = useDispatch()
    {
      try {
        const newComment = await client.service('comments').create({ feedId, text })
        dispatch(FeedCommentAction.addFeedComment(newComment))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  addFireToFeedComment: async (commentId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('comments-fires').create({ commentId })
        dispatch(FeedCommentAction.addFeedCommentFire(commentId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  removeFireToFeedComment: async (commentId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('comments-fires').remove(commentId)
        dispatch(FeedCommentAction.removeFeedCommentFire(commentId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  getCommentFires: async (commentId: string, limit?: number) => {
    const dispatch = useDispatch()
    {
      try {
        const comments = await client.service('comments-fires').find({ query: { action: 'comment-fires', commentId } })
        dispatch(FeedCommentAction.commentFires(comments.data))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}

//Action
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
