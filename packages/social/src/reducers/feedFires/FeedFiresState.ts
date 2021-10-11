/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { createState, useState, none, Downgraded } from '@hookstate/core'
import { FeedFiresActionType } from './FeedFiresActions'
import { CreatorShort } from '@xrengine/common/src/interfaces/Creator'

const state = createState({
  feedFires: {
    feedFires: [] as Array<CreatorShort>,
    fetching: false
  }
})

export const feedFiresReducer = (_, action: FeedFiresActionType) => {
  Promise.resolve().then(() => feedFiresReceptor(action))
  return state.attach(Downgraded).value
}

const feedFiresReceptor = (action: FeedFiresActionType): any => {
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
