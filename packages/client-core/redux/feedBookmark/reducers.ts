import Immutable from 'immutable';
import {
  FeedFiresAction,
  FeedFiresRetriveAction
} from './actions';

import {
  FEED_FIRES_FETCH,
  FEED_FIRES_RETRIEVED
} from '../actions';

export const initialState = {
  feedFires: {
    feedFires: [],    
    fetching: false
  },
};

const immutableState = Immutable.fromJS(initialState);

const feedFiresReducer = (state = immutableState, action: FeedFiresAction): any => {
  switch (action.type) {
    case FEED_FIRES_FETCH : return state.set('fetching', true);
    case FEED_FIRES_RETRIEVED:     
      return state.set('feedFires', (action as FeedFiresRetriveAction).feedFires).set('fetching', false);
  }

  return state;
};

export default feedFiresReducer;
