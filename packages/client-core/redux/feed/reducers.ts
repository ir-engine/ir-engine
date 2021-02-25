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
  let newValues, updateMap, existingFeeds;

  console.log('action', action)
  switch (action.type) {
    case FEEDS_FETCH : return state.set('fetching', true);
    case FEEDS_RETRIEVED:     
      console.log('(action as FeedsRetrievedAction).feeds', action)
      // newValues = (action as FeedsRetrievedAction).feeds; 
      return state.set('feeds', (action as FeedsRetrievedAction).feeds).set('fetching', false);

    case FEEDS_FEATURED_RETRIEVED:     
      // newValues = (action as FeedsRetrievedAction).feeds; 
      console.log('(action as FeedsRetrievedAction).feeds', action)
      return state.set('feedsFeatured', (action as FeedsRetrievedAction).feeds).set('fetching', false);

    case FEED_RETRIEVED:
      newValues = (action as FeedRetrievedAction).feed;
      updateMap = new Map();
      newValues.locationSettings = newValues.location_setting;
      delete newValues.location_setting;
      updateMap.set('feed', newValues);      
      return state
          .set('feed', updateMap);
  }

  return state;
};

export default feedReducer;
