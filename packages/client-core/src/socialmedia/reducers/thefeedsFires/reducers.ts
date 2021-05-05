/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import Immutable from 'immutable';
import {
  TheFeedsFiresAction,
  TheFeedsFiresRetriveAction
} from './actions';

// thefeeds
// TheFeeds
// THEFEEDS

import {
  THEFEEDS_FIRES_FETCH,
  THEFEEDS_FIRES_RETRIEVED
} from '../actions';

export const initialTheFeedsFireState = {
  thefeedsFires: {
    thefeedsFires: [],
    fetching: false
  },
};

const immutableState = Immutable.fromJS(initialTheFeedsFireState);

const thefeedsFiresReducer = (state = immutableState, action: TheFeedsFiresAction): any => {
  switch (action.type) {
    case THEFEEDS_FIRES_FETCH : return state.set('fetching', true);
    case THEFEEDS_FIRES_RETRIEVED:
      return state.set('thefeedsFires', (action as TheFeedsFiresRetriveAction).thefeedsFires).set('fetching', false);
  }

  return state;
};

export default thefeedsFiresReducer;
