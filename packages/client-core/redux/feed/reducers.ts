import Immutable from 'immutable';
import {
  FeedsAction,
  FeedsRetrievedAction,
  FeedRetrievedAction,
  addFeedFiresAction
} from './actions';

import {
  FEEDS_FETCH,
  FEEDS_FEATURED_RETRIEVED,
  FEED_RETRIEVED,
  FEEDS_RETRIEVED,
  ADD_FEED_FIRES,
  REMOVE_FEED_FIRES,
  ADD_FEED_BOOKMARK,
  REMOVE_FEED_BOOKMARK
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
  const currentFeed = state.get('feed');
  switch (action.type) {
    case FEEDS_FETCH : return state.set('fetching', true);
    case FEEDS_RETRIEVED:     
      return state.set('feeds', (action as FeedsRetrievedAction).feeds).set('fetching', false);

    case FEEDS_FEATURED_RETRIEVED:     
      return state.set('feedsFeatured', (action as FeedsRetrievedAction).feeds).set('fetching', false);

    case FEED_RETRIEVED: 
      return state.set('feed', (action as FeedRetrievedAction).feed).set('fetching', false);

    case ADD_FEED_FIRES:
      return state.set('feeds', state.get('feeds').map(feed => {
        if(feed.id === (action as addFeedFiresAction).feedId) {
          return {...feed, fires: ++feed.fires, isFired:true};
        }
        return {...feed};
      })).set('feed', {...currentFeed, fires: ++currentFeed.fires, isFired:true});

    case REMOVE_FEED_FIRES:
      if(currentFeed.id === (action as addFeedFiresAction).feedId){
        currentFeed.isFired = false;
        currentFeed.fires+1;
      }
      return state.set('feeds', state.get('feeds').map(feed => {
        if(feed.id === (action as addFeedFiresAction).feedId) {
          return {...feed, fires: feed.fires-1, isFired:false};
        }
        return {...feed};
      })).set('feed', {...currentFeed, fires: currentFeed.fires-1, isFired:false});

    case ADD_FEED_BOOKMARK:
      return state.set('feeds', state.get('feeds').map(feed => {
        if(feed.id === (action as addFeedFiresAction).feedId) {
          return {...feed, isBookmarked:true};
        }
        return {...feed};
      }));

    case REMOVE_FEED_BOOKMARK:
      return state.set('feeds', state.get('feeds').map(feed => {
        if(feed.id === (action as addFeedFiresAction).feedId) {
          return {...feed, isBookmarked:false};
        }
        return {...feed};
      }));
}


  return state;
};

export default feedReducer;
