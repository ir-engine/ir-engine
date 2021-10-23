/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { FeedCommentActionType } from './FeedCommentActions'
import { CommentInterface } from '@xrengine/common/src/interfaces/Comment'
import { CreatorShort } from '@xrengine/common/src/interfaces/Creator'
import { store } from '../../store'

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
