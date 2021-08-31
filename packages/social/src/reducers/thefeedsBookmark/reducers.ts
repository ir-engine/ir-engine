/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import Immutable from 'immutable'

/**
 * Commenting code to compile TSDOC Docusaurus
 * this file contain some issues with
 * TheFeedsFiresAction, TheFeedsFiresRetriveAction imports are not available in actions.ts file its empty file.
 *
 */

// thefeeds
// TheFeeds
// THEFEEDS

import { THEFEEDS_FIRES_FETCH, THEFEEDS_FIRES_RETRIEVED } from '../actions'
import { TheFeedsFiresAction, TheFeedsFiresRetriveAction } from '../thefeedsFires/actions'

export const initialTheFeedsBookmarkState = {
  thefeedsFires: {
    thefeedsFires: [],
    fetching: false
  }
}

const immutableState = Immutable.fromJS(initialTheFeedsBookmarkState) as any

const thefeedsFiresReducer = (state = immutableState, action: TheFeedsFiresAction): any => {
  switch (action.type) {
    case THEFEEDS_FIRES_FETCH:
      return state.set('fetching', true)
    case THEFEEDS_FIRES_RETRIEVED:
      return state.set('thefeedsFires', (action as TheFeedsFiresRetriveAction).thefeedsFires).set('fetching', false)
  }

  return state
}

export default thefeedsFiresReducer
