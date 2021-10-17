import { TheFeedsFires } from '@xrengine/server-core/src/socialmedia/feeds-fires/feeds-fires.class'
/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { TheFeedsFiresActionType } from './TheFeedsFiresActions'

// thefeeds
// TheFeeds
// THEFEEDS

const state = createState({
  thefeedsFires: {
    thefeedsFires: [],
    fetching: false
  }
})

export const receptor = (action: TheFeedsFiresActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'THEFEEDS_FIRES_FETCH':
        return s.thefeedsFires.fetching.set(true)
      case 'THEFEEDS_FIRES_RETRIEVED':
        return s.thefeedsFires.thefeedsFires.set(action.thefeedsFires)
      case 'ADD_THEFEEDS_FIRES':
        return s.thefeedsFires.thefeedsFires.set([...s.thefeedsFires.thefeedsFires, action.thefeedsFire])
      case 'REMOVE_THEFEEDS_FIRES':
        return s.thefeedsFires.thefeedsFires.set(
          s.thefeedsFires.thefeedsFires.value.filter((i) => i.id !== action.thefeedsFireId)
        )
    }
  }, action.type)
}

export const accessTheFeedsFiresState = () => state
export const useTheFeedsFiresState = () => useState(state)
