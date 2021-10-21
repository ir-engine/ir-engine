/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { FeedFiresActionType } from './FeedFiresActions'
import { CreatorShort } from '@xrengine/common/src/interfaces/Creator'
import { store } from '../../store'

const state = createState({
  feedFires: {
    feedFires: [] as Array<CreatorShort>,
    fetching: false
  }
})

store.receptors.push((action: FeedFiresActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'FEED_FIRES_FETCH':
        return s.feedFires.fetching.set(true)
      case 'FEED_FIRES_RETRIEVED':
        return s.feedFires.merge({ feedFires: action.feedFires, fetching: false })
    }
  }, action.type)
})

export const accessFeedFiresState = () => state
export const useFeedFiresState = () => useState(state)
