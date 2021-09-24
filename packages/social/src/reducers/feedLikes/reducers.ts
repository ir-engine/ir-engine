import Immutable from 'immutable'
import { FeedLikesAction, FeedLikesRetriveAction } from './actions'

import { FEED_LIKES_FETCH, FEED_LIKES_RETRIEVED } from '../actions'

export const initialFeedLikeState = {
  feedLikes: {
    feedLikes: [],
    fetching: false
  }
}

const immutableState = Immutable.fromJS(initialFeedLikeState) as any

const feedLikesReducer = (state = immutableState, action: FeedLikesAction): any => {
  switch (action.type) {
    case FEED_LIKES_FETCH:
      return state.set('fetching', true)
    case FEED_LIKES_RETRIEVED:
      return state.set('feedLikes', (action as FeedLikesRetriveAction).feedLikes).set('fetching', false)
  }

  return state
}

export default feedLikesReducer
