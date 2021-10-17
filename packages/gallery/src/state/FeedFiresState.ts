/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { FeedFiresActionType } from './FeedFiresActions'

const state = createState({
  feedFires: {
    feedFires: [],
    fetching: false
  }
})

export const receptor = (action: FeedFiresActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'FEED_FIRES_FETCH':
        return s.feedFires.fetching.set(true)
      case 'FEED_FIRES_RETRIEVED':
        return s.feedFires.merge({ feedFires: action.feedFires, fetching: false })
    }
  }, action.type)
}

export const accessFeedFiresState = () => state
export const useFeedFiresState = () => useState(state)
