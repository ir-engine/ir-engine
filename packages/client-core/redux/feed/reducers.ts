import Immutable from 'immutable';
import {
  FeedsAction,
  FeedsRetrievedAction,
  FeedRetrievedAction,
} from './actions';

import {
  FEEDS_FETCH,
  FEEDS_FEATURED_RETRIEVED,
  FEED_RETRIEVED,
  FEEDS_RETRIEVED
} from '../actions';

export const initialState = {
  feeds: {
    feeds: [],
    feedsFeatured: [],
    feed: {},
    fetching: false
  },
};

const immutableState = Immutable.fromJS(initialState);

const feedReducer = (state = immutableState, action: FeedsAction): any => {
  // let newValues, updateMap, existingFeeds;
  switch (action.type) {
    case FEEDS_FETCH : return state.set('fetching', true);
    case FEEDS_RETRIEVED:     
      return state.set('feeds', (action as FeedsRetrievedAction).feeds).set('fetching', false);

    case FEEDS_FEATURED_RETRIEVED:     
      return state.set('feedsFeatured', (action as FeedsRetrievedAction).feeds).set('fetching', false);

    case FEED_RETRIEVED: 
      return state.set('feed', (action as FeedRetrievedAction).feed).set('fetching', false);
  }

  return state;
};

export default feedReducer;
