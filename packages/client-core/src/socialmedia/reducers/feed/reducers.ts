import {
  ADD_FEED,
  ADD_FEED_BOOKMARK,
  ADD_FEED_FEATURED,
  ADD_FEED_FIRES,
  ADD_FEED_VIEW,
  FEEDS_AS_ADMIN_RETRIEVED,
  FEEDS_BOOKMARK_RETRIEVED,
  FEEDS_CREATOR_RETRIEVED,
  FEEDS_FEATURED_RETRIEVED,
  FEEDS_FETCH,
  FEEDS_MY_FEATURED_RETRIEVED,
  FEEDS_RETRIEVED,
  FEED_RETRIEVED,
  REMOVE_FEED_BOOKMARK,
  REMOVE_FEED_FEATURED,
  REMOVE_FEED_FIRES,
  UPDATE_FEED
} from '../actions';
import Immutable from 'immutable';
import {
  FeedRetrievedAction,
  FeedsAction,
  FeedsRetrievedAction,
  oneFeedAction
} from './actions';

export const initialFeedState = {
  feeds: {
    feeds: [],
    feedsFeatured: [],
    feedsCreator:[],
    feedsBookmark:[],
    myFeatured:[],
    feed: {},
    fetching: false,
    feedsAdmin:[]
  },
};

const immutableState = Immutable.fromJS(initialFeedState);

const feedReducer = (state = immutableState, action: FeedsAction): any => {
  const currentFeed = state.get('feed');
  switch (action.type) {
    case FEEDS_FETCH : return state.set('fetching', true);
    case FEEDS_RETRIEVED:     
      return state.set('feeds', (action as FeedsRetrievedAction).feeds).set('fetching', false);

    case FEEDS_FEATURED_RETRIEVED:     
      return state.set('feedsFeatured', (action as FeedsRetrievedAction).feeds).set('fetching', false);

    case FEEDS_CREATOR_RETRIEVED:     
      return state.set('feedsCreator', (action as FeedsRetrievedAction).feeds).set('fetching', false);

    case FEEDS_MY_FEATURED_RETRIEVED:     
      return state.set('myFeatured', (action as FeedsRetrievedAction).feeds).set('fetching', false);

    case FEEDS_BOOKMARK_RETRIEVED:
      return state.set('feedsBookmark', (action as FeedsRetrievedAction).feeds).set('fetching', false);
      
    case FEED_RETRIEVED: 
      return state.set('feed', (action as FeedRetrievedAction).feed).set('fetching', false);

    case ADD_FEED_FIRES:
      return state.set('feeds', state.get('feeds').map(feed => {
        if(feed.id === (action as oneFeedAction).feedId) {
          return {...feed, fires: ++feed.fires, isFired:true};
        }
        return {...feed};
      })).set('feed', currentFeed ? {...currentFeed, fires: ++currentFeed.fires, isFired:true} : {});

    case REMOVE_FEED_FIRES:
      return state.set('feeds', state.get('feeds').map(feed => {
        if(feed.id === (action as oneFeedAction).feedId) {
          return {...feed, fires: feed.fires-1, isFired:false};
        }
        return {...feed};
      })).set('feed', currentFeed ?  {...currentFeed, fires: --currentFeed.fires, isFired:false} : {});

    case ADD_FEED_BOOKMARK:
      return state.set('feeds', state.get('feeds').map(feed => {
        if(feed.id === (action as oneFeedAction).feedId) {
          return {...feed, isBookmarked:true};
        }
        return {...feed};
      })).set('feed', currentFeed ? {...currentFeed, isBookmarked:true} : {});

    case REMOVE_FEED_BOOKMARK:
      return state.set('feeds', state.get('feeds').map(feed => {
        if(feed.id === (action as oneFeedAction).feedId) {
          return {...feed, isBookmarked:false};
        }
        return {...feed};
      })).set('feed', currentFeed ?  {...currentFeed, isBookmarked:false} : {});

    case ADD_FEED_VIEW:
      return state.set('feedsFeatured', state.get('feedsFeatured')?.map(feed => {
        if(feed.id === (action as oneFeedAction).feedId) {
          return {...feed, viewsCount: ++feed.viewsCount};
        }
        return {...feed};
      })).set('feed', currentFeed ? {...currentFeed, viewsCount: ++currentFeed.viewsCount} : {});
    case ADD_FEED:
      return state.set('feeds', [...state.get('feeds'), (action as FeedRetrievedAction).feed]);


    case ADD_FEED_FEATURED:
      return state.set('feedsCreator', state.get('feedsCreator').map(feed => {
        if(feed.id === (action as oneFeedAction).feedId) {
          return {...feed, featured:true};
        }
        return {...feed};
      }));

    case REMOVE_FEED_FEATURED:
      const myFeatured = state.get('myFeatured');
      return state.set('feedsCreator', state.get('feedsCreator').map(feed => {
        if(feed.id === (action as oneFeedAction).feedId) {
          return {...feed, featured:false};
        }
        return {...feed};
      })).set('myFeatured', myFeatured ? myFeatured.splice(myFeatured.findIndex(item=>item.id === (action as oneFeedAction).feedId),1) : []);

    case FEEDS_AS_ADMIN_RETRIEVED:     
      return state.set('feedsAdmin', (action as FeedsRetrievedAction).feeds).set('fetching', false);

    case UPDATE_FEED:
      return state.set('feedsAdmin', state.get('feedsAdmin').map(feed => {
        if(feed.id === (action as FeedRetrievedAction).feed.id) {
          return {...feed, ...(action as FeedRetrievedAction).feed};
        }
        return {...feed};
      }));

}


  return state;
};

export default feedReducer;
