import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { FeedLikesActionType } from './FeedLikesActions'
import { CreatorShort } from '@xrengine/common/src/interfaces/Creator'
import { store } from '@xrengine/client-core/src/store'

const state = createState({
  feedLikes: {
    feedLikes: [] as Array<CreatorShort>,
    fetching: false
  }
})

store.receptors.push((action: FeedLikesActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'FEED_LIKES_FETCH':
        return s.merge({
          feedLikes: {
            ...s.feedLikes.value,
            fetching: true
          }
        })
      case 'FEED_LIKES_RETRIEVED':
        return s.merge({
          feedLikes: {
            feedLikes: action.feedLikes,
            fetching: false
          }
        })
    }
  }, action.type)
})

export const accessFeedLikesState = () => state
export const useFeedLikesState = () => useState(state)
