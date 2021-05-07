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
export const ADD_THEFEEDS_FIRES = 'ADD_THEFEEDS_FIRES'
export const REMOVE_THEFEEDS_FIRES = 'REMOVE_THEFEEDS_FIRES'

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
      return state.set('thefeedsFires', (action as TheFeedsFiresRetriveAction).thefeedsFires)
//       .set('fetching', false);
    case ADD_THEFEEDS_FIRES:
      return state.set('thefeedsFires', [...state.get('thefeedsFires'), (action as TheFeedsFiresRetriveAction).thefeedsId])
//       .set('fetching', false);
    case REMOVE_THEFEEDS_FIRES:
      return state.set('thefeedsFires', state.get('thefeedsFires').filter(i=>i.id !== (action as TheFeedsFiresRetriveAction).thefeedsId))
//       .set('fetching', false);
  }

  return state;
};

export default thefeedsFiresReducer;
