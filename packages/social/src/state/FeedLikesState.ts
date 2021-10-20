import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { FeedLikesActionType } from './FeedLikesActions'
import { CreatorShort } from '@standardcreative/common/src/interfaces/Creator'

const state = createState({
  feedLikes: {
    feedLikes: [] as Array<CreatorShort>,
    fetching: false
  }
})

export const receptor = (action: FeedLikesActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'FEED_LIKES_FETCH':
        return s.feedLikes.fetching.set(true)
      case 'FEED_LIKES_RETRIEVED':
        return s.feedLikes.merge({ feedLikes: action.feedLikes, fetching: false })
    }
  }, action.type)
}

export const accessFeedLikesState = () => state
export const useFeedLikesState = () => useState(state)
