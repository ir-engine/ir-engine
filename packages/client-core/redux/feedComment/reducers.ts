import Immutable from 'immutable';
import {
  FeedCommentsAction,
  FeedCommentsRetrievedAction,
} from './actions';

import {
  FEED_COMMENTS_RETRIEVED,
  FEED_COMMENTS_FETCH,  
} from '../actions';

export const initialState = {
  feeds: {
    feedComments: [],
    fetching: false
  },
};

const immutableState = Immutable.fromJS(initialState);

const feedCommentsReducer = (state = immutableState, action: FeedCommentsAction): any => {
  switch (action.type) {
    case FEED_COMMENTS_FETCH : return state.set('fetching', true);
    case FEED_COMMENTS_RETRIEVED:     
      return state.set('feedComments', (action as FeedCommentsRetrievedAction).comments).set('fetching', false);
}


  return state;
};

export default feedCommentsReducer;
