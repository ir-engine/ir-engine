/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import Immutable from 'immutable'

/**
 * Commenting code to compile TSDOC Docusaurus
 * this file contain some issues with
 * FeedFiresAction, FeedFiresRetriveAction imports are not available in actions.ts file its empty file.
 *
 */

import { FEED_FIRES_FETCH, FEED_FIRES_RETRIEVED } from '../actions'
import { FeedFiresAction, FeedFiresRetriveAction } from '../feedFires/actions'

export const initialFeedBookmarkState = {
  feedFires: {
    feedFires: [],
    fetching: false
  }
}

const immutableState = Immutable.fromJS(initialFeedBookmarkState) as any

const feedFiresReducer = (state = immutableState, action: FeedFiresAction): any => {
  switch (action.type) {
    case FEED_FIRES_FETCH:
      return state.set('fetching', true)
    case FEED_FIRES_RETRIEVED:
      return state.set('feedFires', (action as FeedFiresRetriveAction).feedFires).set('fetching', false)
  }

  return state
}

export default feedFiresReducer
