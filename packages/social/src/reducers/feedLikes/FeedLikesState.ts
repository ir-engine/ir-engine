import { createState, useState, none, Downgraded } from '@hookstate/core'
import { FeedLikesActionType } from './FeedLikesActions'
import { CreatorShort } from '@xrengine/common/src/interfaces/Creator'

const state = createState({
  feedLikes: {
    feedLikes: [] as Array<CreatorShort>,
    fetching: false
  }
})

export const feedLikesReducer = (_, action: FeedLikesActionType) => {
  Promise.resolve().then(() => feedLikesReceptor(action))
  return state.attach(Downgraded).value
}

const feedLikesReceptor = (action: FeedLikesActionType): any => {
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
