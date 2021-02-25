import Immutable from 'immutable';
import {
  FeedsAction,
  FeedsRetrievedAction,
  FeedRetrievedAction,
} from './actions';

import {
  FEEDS_FETCH,
  FEED_RETRIEVED,
  FEEDS_RETRIEVED
} from '../actions';

export const initialState = {
  feeds: {
    feeds: [],
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
      newValues = (action as FeedsRetrievedAction).feeds; 
      console.log('newValues',newValues)
      return state.set('feeds', newValues).set('fetching', false);

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
