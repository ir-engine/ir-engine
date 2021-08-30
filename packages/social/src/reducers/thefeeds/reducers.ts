/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
// const thefeeds = '';
// conts TheFeeds = '';
// const THEFEEDS = '';
import { ADD_THEFEEDS, REMOVE_THEFEEDS, THEFEEDS_FETCH, THEFEEDS_RETRIEVED, UPDATE_THEFEEDS } from './actions'
import Immutable from 'immutable'
import { TheFeedsRetrievedAction, TheFeedsAction } from './actions'

export const initialFeedsState = {
  thefeeds: {}
}

const immutableState = Immutable.fromJS(initialFeedsState)

const thefeedsReducer = (state = immutableState, action: TheFeedsAction): any => {
  switch (action.type) {
    case THEFEEDS_FETCH:
      return state.set('fetching', true)
    case THEFEEDS_RETRIEVED:
      return state.set('thefeeds', (action as TheFeedsRetrievedAction).thefeeds).set('fetching', false)
    case ADD_THEFEEDS:
      return state.set('thefeeds', [...state.get('thefeeds'), (action as TheFeedsRetrievedAction).thefeeds])
    case UPDATE_THEFEEDS:
      return state.set(
        'thefeeds',
        state.get('thefeeds').map((thefeeds) => {
          if (thefeeds.id === (action as TheFeedsRetrievedAction).thefeeds.id) {
            return { ...thefeeds, ...(action as TheFeedsRetrievedAction).thefeeds }
          }
          return { ...thefeeds }
        })
      )
    case REMOVE_THEFEEDS:
      return state.set('thefeeds', [
        ...state.get('thefeeds').filter((thefeeds) => thefeeds.id !== (action as TheFeedsRetrievedAction).thefeeds)
      ])
  }

  return state
}

export default thefeedsReducer
